import { useEffect } from "react";
import { ArrowRight, FileSearch, X } from "lucide-react";
import { SourceBadge, StatusBadge } from "./Badges";
import type { DiagnosisRecommendation, DiagnosisSnapshot, Information } from "../types/case";

export function EvidenceDrawer({
  recommendation,
  diagnosis,
  informationById,
  onClose,
  onCorrect,
}: {
  recommendation: DiagnosisRecommendation;
  diagnosis: DiagnosisSnapshot;
  informationById: Map<string, Information>;
  onClose: () => void;
  onCorrect: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  const evidence = recommendation.informationIds
    .map((id) => informationById.get(id))
    .filter((item) => item !== undefined);
  const requirements = recommendation.requirementIds
    .map((id) => diagnosis.requirements.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  return (
    <div
      className="overlay drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="drawer-header">
          <div>
            <span className="eyebrow">建议依据</span>
            <h2 id="drawer-title">
              为什么建议“
              {recommendation.id === "before-spring"
                ? "开始 Spring Boot"
                : recommendation.title}
              ”？
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="关闭依据"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-content">
          <section className="drawer-section">
            <span className="layer-number">01 / 岗位要求</span>
            {requirements.map((item) => (
              <div className="evidence-line" key={item.id}>
                <FileSearch size={17} />
                <div>
                  <strong>{item.text}</strong>
                  <SourceBadge source={item.source} />
                </div>
              </div>
            ))}
          </section>
          <section className="drawer-section">
            <span className="layer-number">02 / 你的当前情况</span>
            {evidence.map((item) => (
              <div className="evidence-line" key={item.id}>
                <span
                  className={`small-dot status-${item.status}`}
                />
                <div>
                  <strong>{item.statement}</strong>
                  {item.source ? (
                    <SourceBadge source={item.source} />
                  ) : (
                    <StatusBadge status="unknown" />
                  )}
                  {item.status === "inferred" && (
                    <p className="caution-text">
                      这不是你明确确认的事实。
                    </p>
                  )}
                </div>
              </div>
            ))}
            {evidence.length === 0 && (
              <p className="muted">目前没有可确认的个人经历信息。</p>
            )}
          </section>
          <section className="drawer-section">
            <span className="layer-number">03 / 为什么排在这里</span>
            {recommendation.reasons.map((reason, index) => (
              <p className="reason-line" key={index}>
                {reason}
              </p>
            ))}
            {recommendation.id === "before-spring" && (
              <p className="inline-note">
                如果这个判断不符合你的实际情况，建议先修正信息，再决定下一步。
              </p>
            )}
          </section>
        </div>
        <div className="drawer-actions">
          {recommendation.id === "before-spring" && (
            <button className="button primary" onClick={onCorrect}>
              这个判断不符合我的情况 <ArrowRight size={16} />
            </button>
          )}
          <button className="button secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </aside>
    </div>
  );
}
