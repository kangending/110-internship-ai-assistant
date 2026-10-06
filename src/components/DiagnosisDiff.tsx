import { ArrowRight, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { linHaoCase } from "../data/linHao";

export function DiagnosisDiff({
  targetRole,
  months,
  revisedBy = "correction",
}: {
  targetRole: string;
  months: string;
  revisedBy?: "correction" | "supplement" | null;
}) {
  const before = linHaoCase.firstDiagnosis.recommendations;
  const after = linHaoCase.revisedDiagnosis.recommendations;
  const springChange = linHaoCase.recommendationChanges.find(
    (change) => change.previousRecommendationId === "before-spring",
  );
  return (
    <section className="diff-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">变化记录</span>
          <h2>为什么建议变了？</h2>
        </div>
      </div>
      <div className="diff-list">
        {before.map((old, index) => {
          const current = after[index];
          const previousRank = before.find(
            (item) => item.title === current.title,
          )?.rank;
          return (
            <div className="surface diff-row" key={old.id}>
              <div className="diff-before">
                <span className="muted-label">修正前</span>
                <strong>
                  {old.title} <small>#{old.rank}</small>
                </strong>
              </div>
              <ArrowRight className="diff-arrow" size={18} />
              <div className="diff-after">
                <span className="muted-label">修正后</span>
                <strong>
                  {current.title} <small>#{current.rank}</small>
                </strong>
              </div>
              {previousRank && previousRank < current.rank ? (
                <ArrowDownRight className="change-down" size={18} />
              ) : (
                <ArrowUpRight className="change-up" size={18} />
              )}
            </div>
          );
        })}
      </div>
      <div className="diff-explainer">
        <div className="surface">
          <h3>发生变化的原因</h3>
          {revisedBy !== "supplement" && springChange && <p className="diff-summary">{springChange.explanation}</p>}
          {revisedBy === "supplement" && <p className="diff-summary">你补充的多线程与 MySQL 情况改变了学习先后顺序。</p>}
          <ul>
            {linHaoCase.corrections.slice(1, revisedBy === "supplement" ? 3 : undefined).map((item) => (
              <li key={item.id}>{item.statement}</li>
            ))}
          </ul>
        </div>
        <div className="surface">
          <h3>保持不变</h3>
          <ul>
            <li>目标岗位仍是 {targetRole}</li>
            <li>距离投递仍约 {months} 个月</li>
            <li>
              基础算法仍需要持续进行 <Minus size={13} />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
