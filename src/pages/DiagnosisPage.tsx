import { useState } from "react";
import {
  ArrowRight,
  CircleHelp,
  Sparkles,
  Info,
  Target,
  TriangleAlert,
} from "lucide-react";
import { ContextRail, RailCard } from "../components/ContextRail";
import { DiagnosisDiff } from "../components/DiagnosisDiff";
import { DiagnosisHistoryDrawer } from "../components/DiagnosisHistoryDrawer";
import { EvidenceDrawer } from "../components/EvidenceDrawer";
import { LoadingState } from "../components/LoadingState";
import { RecommendationCard } from "../components/RecommendationCard";
import type { Assessment } from "../state/useAssessment";
import type { DiagnosisRecommendation, DiagnosisSnapshot } from "../types/case";

export function DiagnosisPage({
  assessment,
  onCorrect,
  onSupplement,
}: {
  assessment: Assessment;
  onCorrect: () => void;
  onSupplement: () => void;
}) {
  const [activeEvidence, setActiveEvidence] =
    useState<DiagnosisRecommendation | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  if (assessment.stage === "reanalyzing") return <LoadingState revising />;
  if (assessment.stage !== "preliminary" && assessment.stage !== "revised")
    return (
      <div className="message-state page-enter">
        <div className="message-icon">
          <Target size={27} />
        </div>
        <h1>还没有岗位差距诊断</h1>
        <p>先写下目标岗位和当前经历，再一起找到值得优先处理的问题。</p>
        <button
          className="button primary"
          onClick={() => assessment.begin(false)}
        >
          开始第一次诊断 <ArrowRight size={16} />
        </button>
      </div>
    );
  if (!assessment.isCaseScenario && !assessment.isCustomSpringReady)
    return (
      <div className="message-state page-enter">
        <div className="message-icon">
          <Target size={27} />
        </div>
        <h1>当前没有可靠的建议排序</h1>
        <p>你填写的内容已保留。完整的诊断排序可以使用林浩模拟案例体验。</p>
        <div className="button-row">
          <button
            className="button primary"
            onClick={() => assessment.begin(true)}
          >
            使用林浩模拟案例
          </button>
          <button className="button secondary" onClick={assessment.backToForm}>
            返回修改信息
          </button>
        </div>
      </div>
    );

  const formal = !!assessment.updatedDiagnosis || assessment.canGenerateFormal || assessment.demoState === "revised" || assessment.demoState === "existing";
  const revised = assessment.usesRevisedDiagnosis;
  const base = assessment.effectiveDiagnosis;
  const noJd = assessment.form.noJd || !assessment.form.jdText.trim();
  const diagnosis: DiagnosisSnapshot = noJd
    ? {
        ...base,
        preliminary: true,
        requirements: base.requirements.map((item) => ({
          ...item,
          source: "generic_role_assumption",
        })),
        recommendations: base.recommendations.map((item) => ({
          ...item,
          basis: { ...item.basis, explicitInJd: false },
          reasons: item.reasons.map((reason) =>
            reason
              .replaceAll("模拟 JD", "通用岗位假设")
              .replaceAll("目标 JD", "通用岗位假设"),
          ),
        })),
      }
    : base;
  const visibleDiagnosis: DiagnosisSnapshot = {
    ...diagnosis, preliminary: !formal,
    recommendations: diagnosis.recommendations.map(item => ({
      ...item,
      informationIds: assessment.updatedDiagnosis ? item.informationIds : item.id === "after-java" ? ["fact-java", "unknown-threads"]
        : item.id === "after-mysql" ? ["unknown-mysql-depth"]
        : item.id === "after-spring" ? ["fact-java", "unknown-threads"]
        : item.informationIds,
    })),
  };
  const remainingCount = assessment.remainingUnknown.length;
  const confirmedCount = assessment.resolvedInformation?.confirmed.length ?? 0;
  const inferredCount = assessment.resolvedInformation?.inferred.length ?? 0;
  const guidedJavaId = assessment.guidedDemo && formal && !assessment.hasCompletedVerifiedCycle
    ? visibleDiagnosis.recommendations.find(item => item.id === 'after-java')?.id : undefined;
  const selectedRecommendationId = visibleDiagnosis.recommendations.some(item => item.id === selected)
    ? selected! : guidedJavaId ?? visibleDiagnosis.recommendations[0].id;
  return (
    <div className="page-enter diagnosis-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">我的诊断</span>
          <h1>{assessment.updatedDiagnosis ? '最新诊断' : formal ? revised ? assessment.revisedBy === "supplement" ? "建议已根据你的补充更新" : "建议已根据你的纠正更新" : "正式诊断" : "当前的初步判断"}</h1>
          <p>
            {formal
              ? assessment.updatedDiagnosis ? '优先级已根据本次行动反馈中的明确事实更新。' : "优先级现在依据你补充的实际情况。"
              : "先看当前排序，任何不准确的判断都可以修正。"}
          </p>
        </div>
        {formal && assessment.isCaseScenario && <button className="button secondary" onClick={() => setHistoryOpen(true)}>查看变化记录</button>}
      </div>
      {assessment.guidedDemoDeviated && <div className="notice warning" role="status"><CircleHelp size={17}/><div><strong>已修改标准演示预设</strong><p>选择其他方向可能无法进入完整行动反馈闭环。</p></div></div>}
      {formal ? (
        <div className={`notice ${noJd ? "warning" : "success"}`}>
          <Sparkles size={17} />
          <div>
            <strong>{assessment.updatedDiagnosis ? '已根据本次行动反馈更新' : revised ? `已根据你的${assessment.revisedBy === "supplement" ? "补充" : "纠正"}重新排序` : "关键信息已确认 · 正式诊断"}</strong>
            <p>{assessment.updatedDiagnosis ? assessment.updatedDiagnosis.recommendations.find(item => item.id === 'after-java')?.gapStatus === 'partial' ? 'Java 核心基础已从当前缺口进入部分满足；Spring Boot 成为当前主线。' : '当前反馈还不足以改变 Java 核心基础的优先级，请继续巩固。' : revised ? "当前 Top 3 已依据最新确认的事实排序。" : "当前判断基于已确认的关键信息。"}</p>
          </div>
        </div>
      ) : (
        <div className="notice warning">
          <TriangleAlert size={18} />
          <div>
            <strong>初步诊断</strong>
            <p>
              {noJd
                ? "当前基于通用岗位假设，后续补充真实 JD 后建议可能变化。"
                : `当前还有 ${inferredCount} 项 AI 推测、${assessment.resolvedInformation?.criticalUnknown.length ?? remainingCount} 项关键待确认信息。以下排序可能变化。`}
            </p>
          </div>
        </div>
      )}
      {formal && remainingCount > 0 && <div className="notice information-reminder" role="status"><Info size={18}/><div><strong>仍有 {remainingCount} 项信息未确认</strong><p>{assessment.remainingUnknown.map(item => item.statement).join('；')}。这不会阻止本次正式诊断，相关岗位要求仍保持未知。</p></div><button className="button ghost small" onClick={onSupplement}>继续补充</button></div>}
      <div className="content-grid">
        <div className="stack">
          <div className="section-heading list-heading">
            <div>
              <h2>当前优先处理的差距</h2>
              <p>按现有信息排列，先处理更影响下一步的事项。</p>
            </div>
            <span className="muted-label">TOP 3</span>
          </div>
          <div className="recommendation-list">
            {visibleDiagnosis.recommendations.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                preliminary={!formal}
                informationById={assessment.resolvedInformation?.byId ?? new Map()}
                onEvidence={() => setActiveEvidence(item)}
              />
            ))}
          </div>
          {!formal && <div className="surface status-action-card warning"><div className="status-action-icon"><CircleHelp size={20}/></div><div className="status-action-copy"><span className="badge status-unknown">待确认</span><strong>还有关键信息会影响建议排序</strong><p>先确认影响当前优先级的信息，再决定下一步。</p></div><button className="button primary" onClick={() => setActiveEvidence(visibleDiagnosis.recommendations[0])}>检查关键依据 <ArrowRight size={16}/></button></div>}
          {formal && (
            <>
              {assessment.isCaseScenario && revised && !assessment.updatedDiagnosis && <DiagnosisDiff
                targetRole={assessment.form.targetRole || "Java 后端开发实习生"}
                months={assessment.form.months || "4"}
                revisedBy={assessment.revisedBy}
              />}
              <section className="surface next-action">
                <span className="eyebrow">下一步</span>
                <h2>接下来想先处理哪一个？</h2>
                <div className="action-options">
                  {visibleDiagnosis.recommendations.map((item) => (
                    <button
                      className={`action-option ${selectedRecommendationId === item.id ? "selected" : ""}`}
                      key={item.id}
                      onClick={() => { setSelected(item.id); if (guidedJavaId && item.id !== 'after-java') assessment.markGuidedDemoDeviation(); }}
                    >
                      <span>{item.title}</span>
                      <small>
                        {item.priority}
                        {item.rank === 1 ? " · 推荐" : ""}
                      </small>
                      {guidedJavaId && item.id === 'after-java' && <span className="badge priority-P0">标准演示推荐</span>}
                    </button>
                  ))}
                </div>
                <button
                  className="button primary"
                  onClick={() => assessment.chooseGap(selectedRecommendationId)}
                >
                  为这个差距制定下一步 <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
        </div>
        <ContextRail>
          <RailCard title="当前目标">
            <strong>
              {assessment.form.targetRole || "Java 后端开发实习生"}
            </strong>
            <p>距离投递 {assessment.form.months || "4"} 个月</p>
            <p>每周时间 {assessment.form.hours || "20"}h</p>
          </RailCard>
          <RailCard title={formal ? "当前判断依据" : "信息状态"}>
            <p>{noJd ? "通用岗位假设" : "目标 JD"}</p>
            <p>
              {`${confirmedCount} 已确认 · ${inferredCount} AI 推测 · ${remainingCount} 待确认`}
            </p>
            <p className="muted">
              {formal
                ? "当前 Top 3 主要建立在已确认信息上。"
                : "当前排序包含尚未确认的信息，建议可能变化。"}
            </p>
          </RailCard>
          {!formal && (
            <RailCard title="有判断不准确？">
              <p>先查看建议依据，再修正影响优先级的信息。</p>
              <button
                className="button ghost small"
                onClick={() => setActiveEvidence(visibleDiagnosis.recommendations[0])}
              >
                <CircleHelp size={15} />
                查看第一条依据
              </button>
            </RailCard>
          )}
        </ContextRail>
      </div>
      {activeEvidence && (
        <EvidenceDrawer
          recommendation={visibleDiagnosis.recommendations.find(item => item.id === activeEvidence.id) ?? activeEvidence}
          diagnosis={visibleDiagnosis}
          informationById={assessment.resolvedInformation?.byId ?? new Map()}
          onClose={() => setActiveEvidence(null)}
          onCorrect={() => {
            setActiveEvidence(null);
            onCorrect();
          }}
        />
      )}
      {historyOpen && <DiagnosisHistoryDrawer entries={assessment.diagnosisHistory} onClose={() => setHistoryOpen(false)} />}
    </div>
  );
}
