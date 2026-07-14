# MWAN Compliance Intelligence Engine — One-Pager (Plain-Language Overview)

## What the system actually does

Waste-transport companies ("carriers") are supposed to tell MWAN how many trucks they operate, and they pay a license fee based on that number. Some carriers under-report their fleet to pay less. Today, the only way to catch this is to send an inspector out to physically count trucks — slow, expensive, and only possible for a small number of companies per year.

This system is a decision-support tool that helps MWAN decide **which companies to inspect first**, by combining four things it knows about every carrier:

1. **The declared fleet** — how many trucks the company says it has (from MWAN's own licensing records).
2. **The real fleet** — how many trucks are actually registered to that company in the national vehicle registry (Transport General Authority / NAQL). If this number is bigger than the declared number, that's a direct sign of under-reporting.
3. **The corporate ownership web** — who owns and directs each company (from the Ministry of Commerce registry). The system draws a map of shared owners, directors, and office addresses to spot cases where one person secretly controls several "small" companies to dodge fees.
4. **Payment behavior** — whether a company pays its fees on time, late, or partially, which tends to correlate with other compliance problems.

From these four inputs, every active carrier gets:
- A **compliance score (0–100)** — a single number summarizing how risky the company looks.
- A **risk level** — Low / Medium / High.
- **Plain-English reasons** for the score — e.g., "12 more trucks found in the national registry than declared," "shares an owner with 4 other licensed carriers," "declared fleet dropped 30% right before license renewal."

Inspectors then work down a ranked list, starting with the highest-risk companies, instead of picking inspections at random.

## Feature-by-feature: what each screen does, why it exists, and what to expect

### Dashboard (home screen)
**What it is:** The landing page — total carriers, how many are High/Medium/Low risk, how many have a fleet gap, pending inspections, detected ownership networks, and unread alerts, plus a risk-distribution chart and a feed of recent alerts.
**Why we built it:** Leadership and inspection managers need a 10-second answer to "how big is the problem right now and is it getting better or worse," without opening any single carrier's file.
**What to expect:** A snapshot, not an action list — it tells you the shape of the problem (e.g., "40 High-risk carriers"), while the Carriers and Inspections pages are where you act on it. The three buttons at the top ("Run Fleet Gap," "Run Prediction," "Run Networks") manually trigger the three detection pipelines on demand — useful for demos or right after new data lands, but in production these would normally run on a schedule rather than by hand.

### Carriers directory
**What it is:** A searchable, filterable table of every licensed carrier with declared fleet, actual fleet, gap, compliance score, and risk tier side by side.
**Why we built it:** This is the primary workspace for triage — inspectors and analysts need to sort/filter the full population (e.g., "show me only High risk") rather than page through the raw licensing system.
**What to expect:** A prioritization list, not a violation list. A company appearing here with a High score is a candidate worth inspecting soon — it is not a confirmed finding. Search and the Low/Medium/High filter are there because with hundreds of carriers, nobody scans a flat table top to bottom.

### Carrier detail (the "case file")
**What it is:** Everything known about one company on a single page: declared vs. actual fleet, the compliance score with its top-3 plain-English reasons, a historical fleet-declaration timeline, ownership (shareholders/directors), any ownership-network membership, past inspections, and active alerts — plus a one-click "Schedule Inspection" button.
**Why we built it:** An inspector preparing a visit needs the full context in one place instead of separately querying the licensing system, the company registry, and the vehicle registry. The "why" behind the score (top 3 factors) exists specifically so a human can sanity-check the model's reasoning before acting on it, not just trust a number blindly.
**What to expect:** This page is read-heavy by design — its only write action is scheduling an inspection (defaults to two weeks out). It won't let you edit declared fleet size, ownership, or scores directly, because those are meant to flow from the source systems (LMS/MOC/TGA) and the model, not be hand-edited here.

### Ownership networks (list + detail)
**What it is:** A list of detected clusters of companies that appear to share a controlling owner, director, or address, and a detail view for each cluster showing a graph of the companies/people involved, plus combined declared vs. actual fleet across the whole cluster.
**Why we built it:** A single company might look fully compliant on its own while its owner secretly runs several "small" companies that together operate a much bigger, under-licensed fleet. This view exists specifically to make that fragmentation visible, since no single-carrier view can show it.
**What to expect:** A network appearing here is a statistical pattern (shared owners/directors/addresses plus a combined fleet gap), not proof of intentional fraud — legitimate corporate groups can also share directors or addresses. Treat it as "worth a coordinated look across these companies together," and use the "Run Networks" button on the dashboard to regenerate this list after ownership data changes.

### Inspections queue, detail, and outcome form
**What it is:** A worklist of scheduled/in-progress/completed inspections per carrier, a detail page per inspection, and a form for the inspector to record what actually happened (confirmed under-declaration, no violation, partial violation, or network fragmentation confirmed), including the real fleet size they counted on-site.
**Why we built it:** This is the single most important screen in the whole system, because it's the only place real-world ground truth enters. Every other screen produces a *prediction*; this is where a human confirms or denies that prediction against reality.
**What to expect:** Submitting an outcome here doesn't just close a case file — it silently feeds the model's future retraining (see the training loop below). If inspectors skip logging outcomes, or only log the "interesting" cases, the model's future learning will be biased or will stall. This screen should be treated as mandatory bookkeeping, not optional paperwork.

### Alerts
**What it is:** A running feed of system-generated notifications (e.g., a carrier's risk score just crossed a threshold, or new vehicles showed up in the national registry that were never declared to MWAN), each markable as read.
**Why we built it:** Risk scores are only useful if someone notices when they change. Without this feed, a carrier could quietly cross into High-risk territory between scheduled reviews and nobody would know until the next manual look at the dashboard.
**What to expect:** Alerts are informational triggers, not enforcement actions — marking one "read" just acknowledges you've seen it; it doesn't dismiss the underlying risk or close anything. Acting on an alert still means going to that carrier's page and deciding whether to schedule an inspection.

### Analytics (model performance)
**What it is:** The current model's accuracy, precision, recall, and AUC-ROC, how many training samples it was built on, a version history of past model retrains, and a "Retrain" button.
**Why we built it:** A predictive model that nobody is watching is a liability — this page exists so someone can see whether the model's real-world track record (precision/recall against confirmed inspections) is actually good enough to keep trusting, and to see the trend across versions rather than just the latest number.
**What to expect:** Precision matters as much as accuracy here — a model that flags too many innocent carriers (low precision) wastes inspector time even if its overall accuracy looks fine. Clicking "Retrain" only works once at least 50 completed inspections with recorded outcomes exist; below that, it will explicitly report "insufficient data" rather than silently retraining on too little evidence.

## What data the system assumes it has

The engine is built assuming it can pull from three outside systems plus its own history:

| Source | What it assumes MWAN has access to |
|---|---|
| MWAN's own licensing system | Every carrier's declared fleet size, license status, fee payment history, and past declarations over time |
| Ministry of Commerce company registry | Shareholders, directors, registered addresses, and incorporation dates for every registered company |
| Transport Authority / NAQL vehicle registry | Every truck's plate number, registered owner, and active/inactive status |
| Past inspection outcomes | Whether previous flagged companies were actually confirmed as violators or cleared |

**Important caveat:** the system currently runs on a **synthetic (simulated) dataset of 500 companies**, not a live production feed from these three real government systems. The synthetic data was built to mimic realistic patterns (fleet gaps, shared ownership, payment behavior), and includes a pre-labeled "ground truth" answer key so the model has something to learn from before any real inspections have happened. Real-world results will depend on how well the live data, once connected, matches these assumed patterns — for example, it assumes company records can be reliably matched across the three systems (same company, different databases), which in practice depends on data quality (consistent IDs, clean names, etc.).

## How the system "learns" (the training loop, in plain terms)

Think of it like a junior inspector who gets smarter with experience:

1. **Cold start.** Before any real inspections have happened, the model is trained on the 500-company synthetic answer key — cases that were pre-labeled as "violation" or "no violation" — so it has a working sense of what red flags typically look like (fleet gaps, ownership overlaps, payment issues).

2. **Making predictions.** Using that starting knowledge, the model scores every active carrier and produces the ranked, explained list described above.

3. **Real-world feedback.** When an inspector actually visits a company, they record the true outcome — confirmed violation, partial violation, no violation, or fragmented-ownership fraud. This is the system's only source of "ground truth" from the real world.

4. **Retraining.** Once at least **50 completed inspections with confirmed outcomes** have piled up, the system retrains itself using those real results instead of (or in addition to) the synthetic data. Confirmed violations become new positive examples; cleared cases become new negative examples. Below that 50-case threshold, the system reports that it doesn't yet have enough real evidence to retrain responsibly.

5. **Repeat.** Every retraining cycle, the model recalculates how accurate, precise, and reliable its predictions were on held-out cases before trusting the new version. Over many cycles, as more real inspection outcomes accumulate, the model's judgment should increasingly reflect actual on-the-ground behavior rather than the original simulated assumptions.

In short: the system starts by learning from a simulated example set, then gradually "graduates" to learning from real inspectors' findings, continuously refining its sense of what under-declaration looks like as more real cases come in.

## Key assumptions worth flagging to stakeholders

- **Data quality assumption:** the model assumes company and vehicle records can be accurately matched across MWAN, Ministry of Commerce, and the vehicle registry. Messy or inconsistent records would weaken every downstream result.
- **Cold-start assumption:** until enough real inspections accumulate (50+), predictions rely on synthetic, simulated patterns rather than confirmed local behavior — early scores should be treated as a prioritization aid, not proof of wrongdoing.
- **Feedback-loop dependency:** the system only gets better if inspectors consistently record outcomes after each visit; missing or inconsistent feedback will stall improvement.
- **Score is a lead, not a verdict:** a high risk score means "inspect this company sooner," not "this company is guilty" — every flagged case still requires a human inspection to confirm.
