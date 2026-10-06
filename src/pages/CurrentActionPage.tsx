import { ArrowRight, ListChecks } from "lucide-react";
import { navigate } from "../state/useAssessment";
import type { Assessment } from "../state/useAssessment";
import { linHaoCase } from "../data/linHao";

export function CurrentActionPage({ assessment }: { assessment: Assessment }) {
  const selected = [...linHaoCase.revisedDiagnosis.recommendations, ...linHaoCase.firstDiagnosis.recommendations]
    .find(item => item.id === assessment.selectedGapId);
  return (
    <div className="message-state page-enter">
      <div className="message-icon">
        <ListChecks size={27} />
      </div>
      <span className="eyebrow">当前行动</span>
      <h1>把差距变成下一步行动</h1>
      <p>{selected ? `你已选择“${selected.title}”。接下来可以把这个差距转成具体行动。` : "先看清当前最重要的差距，再决定从哪里开始。"}</p>
      <button
        className="button secondary"
        onClick={() => navigate("diagnosis")}
      >
        返回我的诊断 <ArrowRight size={16} />
      </button>
    </div>
  );
}
