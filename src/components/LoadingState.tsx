import { LoaderCircle, Sparkles } from "lucide-react";

export function LoadingState({ revising = false, actionFeedback = false, periodDays }: { revising?: boolean; actionFeedback?: boolean; periodDays?: number }) {
  const steps = actionFeedback ? ["整理行动反馈", "更新已确认事实", "检查差距变化", "重新排列下一步"] : revising
    ? ["更新用户事实", "检查受影响的建议", "重新排列下一步优先级"]
    : ["读取岗位要求", "整理已有经历", "检查关键信息"];
  return (
    <div className="loading-view page-enter" role="status" aria-live="polite">
      <div className="loading-symbol">
        <Sparkles size={26} />
      </div>
      <h1>
        {actionFeedback ? periodDays ? `正在根据这 ${periodDays} 天的真实进展更新建议` : '正在根据本次行动的真实进展更新建议' : revising ? "正在根据你的补充重新排序" : "正在整理你的目标和经历"}
      </h1>
      <p>我们正在梳理依据，请稍等片刻。</p>
      <div className="loading-steps">
        {steps.map((step, index) => (
          <div key={step} style={{ animationDelay: `${index * 250}ms` }}>
            <LoaderCircle size={15} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
