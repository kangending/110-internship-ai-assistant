import { ArrowUpRight, FileSearch } from "lucide-react";
import { GapBadge, PriorityBadge } from "./Badges";
import type { DiagnosisRecommendation } from "../types/case";
import type { Information } from "../types/case";

export function RecommendationCard({
  item,
  preliminary,
  informationById,
  onEvidence,
}: {
  item: DiagnosisRecommendation;
  preliminary: boolean;
  informationById: Map<string, Information>;
  onEvidence: () => void;
}) {
  const dependencies = item.informationIds.map(id => informationById.get(id));
  const basis = dependencies.some(info => info?.status === "inferred")
    ? "包含 AI 推测"
    : dependencies.some(info => !info || info.status === "unknown")
      ? "仍有信息不足"
      : dependencies.length === 0
        ? preliminary ? "仍有信息不足" : "依据目标 JD"
        : "基于已确认事实";
  const label = preliminary && item.rank === 1 ? "暂列优先" : null;
  return (
    <article
      className={`surface recommendation ${item.rank === 1 ? "featured" : ""}`}
    >
      <div className="recommendation-index">
        {String(item.rank).padStart(2, "0")}
      </div>
      <div className="recommendation-body">
        <div className="rec-topline">
          <h3>{item.title}</h3>
          <ArrowUpRight size={16} />
        </div>
        <div className="badge-row">
          {label && <span className="badge tentative">{label}</span>}
          <PriorityBadge priority={item.priority} />
          <GapBadge status={item.gapStatus} />
        </div>
        <p>{item.reasons[0]}</p>
        <div className="rec-footer">
          <span>{basis}</span>
          <button className="button ghost small" onClick={onEvidence}>
            <FileSearch size={15} />
            查看依据
          </button>
        </div>
      </div>
    </article>
  );
}
