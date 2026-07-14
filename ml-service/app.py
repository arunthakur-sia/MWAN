from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import shap
import networkx as nx
from networkx.algorithms.community import louvain_communities
import joblib
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MWAN Compliance Intelligence ML Service")

DATABASE_URL = os.getenv("DATABASE_URL")
MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "prediction_model.pkl"

FEATURE_COLS = [
    "declared_fleet_size", "actual_fleet_tga", "fleet_gap", "fleet_gap_pct",
    "declaration_trend_6q", "payment_compliance_rate", "overdue_count",
    "partial_payment_ratio", "ownership_complexity", "network_membership",
]


def get_conn():
    return psycopg2.connect(DATABASE_URL)


@app.get("/health")
async def health():
    return {"status": "ok"}


# ─── Feature Engineering ────────────────────────────────────

def load_feature_matrix() -> pd.DataFrame:
    conn = get_conn()
    try:
        features_df = pd.read_sql("""
            SELECT
                c.id as carrier_id,
                c.declared_fleet_size,
                COUNT(DISTINCT v.id) as actual_fleet_tga,
                COUNT(DISTINCT v.id) - c.declared_fleet_size as fleet_gap,
                CASE WHEN COUNT(DISTINCT v.id) > 0
                     THEN (COUNT(DISTINCT v.id) - c.declared_fleet_size)::float
                          / COUNT(DISTINCT v.id) * 100
                     ELSE 0 END as fleet_gap_pct,
                COUNT(DISTINCT s.national_id) as ownership_complexity,
                MAX(CASE WHEN nm.network_id IS NOT NULL THEN 1 ELSE 0 END) as network_membership
            FROM "Carrier" c
            LEFT JOIN "Vehicle" v ON v.owner_company_id = c.company_id
                AND v.registration_status = 'ACTIVE'
            LEFT JOIN "CompanyRegistry" cr ON cr.company_id = c.company_id
            LEFT JOIN "Shareholder" s ON s.company_id = cr.id AND s.status = 'ACTIVE'
            LEFT JOIN "NetworkMembership" nm ON nm.carrier_id = c.id
            WHERE c.license_status = 'ACTIVE'
            GROUP BY c.id, c.declared_fleet_size
        """, conn)

        payment_df = pd.read_sql("""
            SELECT
                carrier_id,
                COUNT(*) as total_invoices,
                SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END)::float
                    / NULLIF(COUNT(*), 0) as payment_compliance_rate,
                SUM(CASE WHEN payment_status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN payment_status = 'PARTIAL' THEN 1 ELSE 0 END)::float
                    / NULLIF(COUNT(*), 0) as partial_payment_ratio
            FROM "FeePayment"
            GROUP BY carrier_id
        """, conn)

        trend_df = pd.read_sql("""
            SELECT carrier_id,
                   REGR_SLOPE(declared_fleet, EXTRACT(EPOCH FROM declaration_date))
                       as declaration_trend_6q
            FROM "Declaration"
            WHERE declaration_date >= NOW() - INTERVAL '18 months'
            GROUP BY carrier_id
        """, conn)
    finally:
        conn.close()

    df = features_df.merge(payment_df, on="carrier_id", how="left")
    df = df.merge(trend_df, on="carrier_id", how="left")
    df = df.fillna(0)
    return df


def train_model(df: pd.DataFrame, label_query: str) -> tuple[GradientBoostingClassifier, dict]:
    conn = get_conn()
    try:
        labels_df = pd.read_sql(label_query, conn)
    finally:
        conn.close()

    train_df = df.merge(labels_df, on="carrier_id", how="inner")
    X = train_df[FEATURE_COLS]
    y = train_df["label"]

    model = GradientBoostingClassifier(
        n_estimators=200, max_depth=5, learning_rate=0.1, subsample=0.8, random_state=42,
    )

    n_splits = min(5, y.value_counts().min())
    metrics = {}
    if n_splits >= 2:
        cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        accs, precs, recs, f1s, aucs = [], [], [], [], []
        for train_idx, val_idx in cv.split(X, y):
            model.fit(X.iloc[train_idx], y.iloc[train_idx])
            preds = model.predict(X.iloc[val_idx])
            probs = model.predict_proba(X.iloc[val_idx])[:, 1]
            accs.append(accuracy_score(y.iloc[val_idx], preds))
            precs.append(precision_score(y.iloc[val_idx], preds, zero_division=0))
            recs.append(recall_score(y.iloc[val_idx], preds, zero_division=0))
            f1s.append(f1_score(y.iloc[val_idx], preds, zero_division=0))
            if len(set(y.iloc[val_idx])) > 1:
                aucs.append(roc_auc_score(y.iloc[val_idx], probs))
        metrics = {
            "accuracy": float(np.mean(accs)),
            "precision": float(np.mean(precs)),
            "recall": float(np.mean(recs)),
            "f1": float(np.mean(f1s)),
            "auc_roc": float(np.mean(aucs)) if aucs else None,
        }

    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    metrics["training_samples"] = int(len(train_df))
    metrics["positive_samples"] = int(y.sum())
    return model, metrics


class PredictionRequest(BaseModel):
    mode: str = "batch"
    carrier_id: str | None = None
    horizon_months: int = 12


@app.post("/predict")
async def run_predictions(req: PredictionRequest):
    """
    Predict under-declaration probability for all active carriers using a
    gradient boosting classifier bootstrapped on the ground-truth label set,
    explained per-carrier via SHAP top-3 factors.
    """
    df = load_feature_matrix()

    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
    else:
        model, _ = train_model(df, "SELECT carrier_id, under_declaration_label as label FROM ground_truth_labels")

    if req.mode == "single" and req.carrier_id:
        df = df[df["carrier_id"] == req.carrier_id]

    X_pred = df[FEATURE_COLS]
    probabilities = model.predict_proba(X_pred)[:, 1]

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_pred)

    results = []
    for i, (_, row) in enumerate(df.iterrows()):
        feature_importance = list(zip(FEATURE_COLS, shap_values[i]))
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        top3 = feature_importance[:3]

        results.append({
            "carrier_id": row["carrier_id"],
            "probability": round(float(probabilities[i]), 4),
            "risk_tier": (
                "HIGH" if probabilities[i] > 0.7
                else "MEDIUM" if probabilities[i] > 0.4
                else "LOW"
            ),
            "top_factors": [
                {"feature": f[0], "impact": round(float(f[1]), 4)} for f in top3
            ],
        })

    return {"predictions": results, "model_version": "v1.0"}


# ─── Network Analysis Module ───────────────────────────────

@app.post("/detect-networks")
async def detect_networks():
    """
    Build ownership graph from MOC shareholder/director/address data.
    Apply Louvain community detection to find affiliated clusters.
    """
    conn = get_conn()
    try:
        shareholders = pd.read_sql("""
            SELECT cr.company_id, s.national_id, s.name, s.ownership_pct
            FROM "Shareholder" s
            JOIN "CompanyRegistry" cr ON cr.id = s.company_id
            WHERE s.status = 'ACTIVE'
        """, conn)

        directors = pd.read_sql("""
            SELECT cr.company_id, d.national_id, d.name
            FROM "Director" d
            JOIN "CompanyRegistry" cr ON cr.id = d.company_id
            WHERE d.status = 'ACTIVE'
        """, conn)

        addresses = pd.read_sql("""
            SELECT company_id, registered_address
            FROM "CompanyRegistry"
            WHERE registered_address IS NOT NULL
        """, conn)
    finally:
        conn.close()

    G = nx.Graph()

    for _, row in shareholders.iterrows():
        G.add_edge(
            f"company:{row['company_id']}", f"person:{row['national_id']}",
            weight=float(row["ownership_pct"]), relation="shareholder",
        )

    for _, row in directors.iterrows():
        G.add_edge(
            f"company:{row['company_id']}", f"person:{row['national_id']}",
            weight=30, relation="director",
        )

    addr_groups = addresses.groupby("registered_address")["company_id"].apply(list)
    for addr, companies in addr_groups.items():
        if len(companies) > 1:
            for i in range(len(companies)):
                for j in range(i + 1, len(companies)):
                    G.add_edge(
                        f"company:{companies[i]}", f"company:{companies[j]}",
                        weight=20, relation="co_located",
                    )

    company_nodes = [n for n in G.nodes() if n.startswith("company:")]
    company_graph = nx.Graph()
    company_graph.add_nodes_from(company_nodes)

    for idx, c1 in enumerate(company_nodes):
        for c2 in company_nodes[idx + 1:]:
            common = set(G.neighbors(c1)) & set(G.neighbors(c2))
            direct = G.has_edge(c1, c2)
            if common or direct:
                total_weight = sum(
                    G[c1][n].get("weight", 1) + G[c2][n].get("weight", 1) for n in common
                )
                if direct:
                    total_weight += G[c1][c2].get("weight", 1)
                if total_weight > 0:
                    company_graph.add_edge(c1, c2, weight=total_weight)

    if company_graph.number_of_edges() > 0:
        communities = louvain_communities(company_graph, resolution=1.0, seed=42)
    else:
        communities = []

    networks = []
    for i, community in enumerate(communities):
        members = [n.replace("company:", "") for n in community]
        if len(members) < 2:
            continue

        person_connections: dict[str, int] = {}
        for member in members:
            node = f"company:{member}"
            if node not in G:
                continue
            for neighbor in G.neighbors(node):
                if neighbor.startswith("person:"):
                    pid = neighbor.replace("person:", "")
                    person_connections[pid] = person_connections.get(pid, 0) + 1

        if not person_connections:
            continue
        primary_owner = max(person_connections, key=person_connections.get)

        networks.append({
            "network_id": f"NET-{i + 1:03d}",
            "primary_owner_id": primary_owner,
            "member_company_ids": members,
            "member_count": len(members),
            "connection_strength": sum(
                company_graph[u][v]["weight"]
                for u, v in company_graph.edges()
                if u in community and v in community
            ),
        })

    return {"networks_detected": len(networks), "networks": networks}


# ─── Model Retraining ──────────────────────────────────────

@app.post("/retrain")
async def retrain_model():
    """
    Retrain the prediction model using completed inspection outcomes as
    ground truth once enough real-world feedback has accumulated.
    """
    conn = get_conn()
    try:
        count_df = pd.read_sql("""
            SELECT COUNT(*) as n FROM "Inspection" WHERE status = 'COMPLETED' AND outcome IS NOT NULL
        """, conn)
    finally:
        conn.close()

    if int(count_df["n"].iloc[0]) < 50:
        return {"status": "insufficient_data", "samples": int(count_df["n"].iloc[0])}

    df = load_feature_matrix()
    label_query = """
        SELECT DISTINCT ON (c.id)
            c.id as carrier_id,
            CASE WHEN i.outcome IN ('CONFIRMED_UNDER_DECLARATION', 'PARTIAL_VIOLATION')
                 THEN 1 ELSE 0 END as label
        FROM "Inspection" i
        JOIN "Carrier" c ON c.id = i.carrier_id
        WHERE i.status = 'COMPLETED' AND i.outcome IS NOT NULL
        ORDER BY c.id, i.completed_at DESC
    """
    _, metrics = train_model(df, label_query)

    return {"status": "retrained", **metrics}
