import { LoaderCircle, Sparkles } from "lucide-react";

export function LoadingState({ revising = false }: { revising?: boolean }) {
  const steps = revising
    ? ["更新用户事实", "检查受影响的建议", "重新排列下一步优先级"]
    : ["读取岗位要求", "整理已有经历", "检查关键信息"];
  return (
    <div className="loading-view page-enter" role="status" aria-live="polite">
      <div className="loading-symbol">
        <Sparkles size={26} />
      </div>
      <h1>
        {revising ? "正在根据你的补充重新排序" : "正在整理你的目标和经历"}
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
