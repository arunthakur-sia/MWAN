"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const COMPANY_COLOR = "#469A57";
const PERSON_COLOR = "#353535";

interface Node {
  id: string;
  type: "company" | "person";
  label: string;
}
interface Link {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

type SimNode = Node & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode> & Omit<Link, "source" | "target">;

export function NetworkGraph({ nodes, links }: { nodes: Node[]; links: Link[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // d3-force mutates these objects in place; clone so React state stays untouched.
    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = links.map((l) => ({ ...l }));

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", (d) => Math.max(1, d.weight / 20));

    const node = svg
      .append("g")
      .selectAll<SVGCircleElement, SimNode>("circle")
      .data(simNodes)
      .join("circle")
      .attr("r", (d) => (d.type === "company" ? 16 : 10))
      .attr("fill", (d) => (d.type === "company" ? COMPANY_COLOR : PERSON_COLOR))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(
        d3
          .drag<SVGCircleElement, SimNode>()
          .on("start", (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (e, d) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on("end", (e, d) => {
            if (!e.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(simNodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "company" ? 28 : 20))
      .attr("fill", "#6B7280");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);
      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COMPANY_COLOR }} />
          {t("networkDetail.legendCompany")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PERSON_COLOR }} />
          {t("networkDetail.legendPerson")}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8" className="shrink-0">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#9CA3AF" strokeWidth="2" />
          </svg>
          {t("networkDetail.legendLinkWeight")}
        </span>
        <span className="text-gray-400">{t("networkDetail.legendDrag")}</span>
      </div>
      <svg ref={svgRef} className="w-full h-[500px]" />
    </div>
  );
}
