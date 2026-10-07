import {
  ArrowLeft,
  ArrowRight,
  Info,
  CircleHelp,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { linHaoCase } from "../data/linHao";
import { StatusBadge, SourceBadge } from "../components/Badges";
import { ContextRail, RailCard } from "../components/ContextRail";
import { LoadingState } from "../components/LoadingState";
import type { Assessment } from "../state/useAssessment";

export function UnderstandingPage({
  assessment,
  onCorrect,
  onSupplement,
}: {
  assessment: Assessment;
  onCorrect: () => void;
  onSupplement: () => void;
}) {
  const { stage, form } = assessment;
  if (stage === "analyzing") return <LoadingState />;
  if (stage === "failed")
    return (
      <div className="message-state page-enter">
        <div className="message-icon error">
          <TriangleAlert size={26} />
        </div>
        <h1>这次分析没有生成成功</h1>
        <p>你填写的信息已经保存，不需要重新填写。</p>
        <div className="button-row">
          <button className="button primary" onClick={assessment.runAnalysis}>
            <RefreshCw size={16} />
            重新生成
          </button>
          <button className="button secondary" onClick={assessment.backToForm}>
            <ArrowLeft size={16} />
            返回修改信息
          </button>
        </div>
      </div>
    );
  if (stage !== "understanding")
    return (
      <div className="message-state page-enter">
        <div className="message-icon">
          <CircleHelp size={26} />
        </div>
        <h1>先告诉我你的目标和经历</h1>
        <button
          className="button primary"
          onClick={() => assessment.begin(false)}
        >
          建立诊断 <ArrowRight size={16} />
        </button>
      </div>
    );

  const isCaseUnderstanding = assessment.isCaseScenario;
  const activeInference = !!assessment.resolvedInformation?.inferred.length;
  const fallbackFacts = [
    ...(form.grade && form.major
      ? [`${form.grade} · ${form.major}`]
      : [form.grade, form.major].filter(Boolean)),
    `目标：${form.targetRole}`,
    `距离投递约 ${form.months} 个月`,
    `每周约 ${form.hours} 小时`,
    isCaseUnderstanding
      ? "学习过 Java 基础 · 做过 Java + MySQL 项目"
      : `你的描述：${form.experience}`,
  ];
  const confirmed = assessment.resolvedInformation?.confirmed ?? fallbackFacts.map((statement, index) => ({
    id: `form-${index}`, statement, source: "user_input" as const,
  }));
  const unknown = assessment.remainingUnknown;
  const remainingSupplementItems = assessment.remainingSupplementItems;
  const inferred = linHaoCase.firstUnderstanding.inferred[0];
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">AI 理解确认</span>
          <h1>在给建议前，先确认我有没有理解错</h1>
          <p>先核对事实、推测和暂时未知的内容。</p>
        </div>
      </div>
      {assessment.guidedDemo && <aside className="guided-demo-callout">
        <span className="badge priority-P0">标准案例闭环方案</span>
        <strong>本案例已为完整演示预设关键选择。</strong>
        <ul>
          <li>AI 推测：建议选择“不准确”</li>
          <li>待补充：打开后默认已选，建议不再更改</li>
          <li>如果主动修改，可能进入其他分支，无法完整体验行动反馈闭环</li>
        </ul>
      </aside>}
      {assessment.guidedDemoDeviated && <div className="notice warning" role="status"><CircleHelp size={17}/><div><strong>已修改标准演示预设</strong><p>后续可能进入其他诊断分支，无法完整体验行动反馈闭环。</p></div></div>}
      {assessment.corrected && <div className="notice success" role="status"><Sparkles size={18}/><div><strong>已根据你的补充更新理解</strong><p>纠正中的事实已确认；你可以核对后再生成诊断。</p></div></div>}
      <div className="notice guidance">
        <Sparkles size={18} />
        <div>
          <strong>{activeInference ? "请先检查下面 1 条 AI 推测" : "请确认下面的信息是否符合你的实际情况"}</strong>
          <p>{activeInference ? "如果理解不准确，后续建议也会受到影响。" : "你确认或补充的内容会立即更新信息状态。"}</p>
        </div>
      </div>
      <div className="summary-strip">
        <strong>
          已整理 {confirmed.length + (activeInference ? 1 : 0) + unknown.length}{" "}
          项关键信息
        </strong>
        <span>
          <i className="dot confirmed" />
          {confirmed.length} 已确认
        </span>
        <span className={isCaseUnderstanding && !assessment.acceptedInference ? "summary-focus" : ""}>
          <i className="dot inferred" />
          {activeInference ? "1 项 AI 推测需要你判断" : "0 项 AI 推测待判断"}
        </span>
        <span>
          <i className="dot unknown" />
          {unknown.length} 待确认
        </span>
      </div>
      {assessment.demoState === "insufficient" && (
        <div className="notice warning">
          <CircleHelp size={17} />
          <div>
            <strong>还有 {unknown.length} 项关键信息会影响建议排序</strong>
            <p>你可以补充后再分析，也可以先看初步诊断。</p>
          </div>
        </div>
      )}
      <div className="content-grid">
        <div className="stack">
          <section className="surface info-section">
            <div className="section-heading">
              <h2>已确认事实</h2>
              <StatusBadge status="confirmed" />
            </div>
            <div className="fact-list">
          {confirmed.map((fact) => (
                <div className="fact-row" key={fact.id}>
                  <span>{fact.statement}</span>
                  <SourceBadge source={fact.source} />
                </div>
              ))}
            </div>
          </section>
          {isCaseUnderstanding && !assessment.inferenceSuperseded && (
            <section className={`surface inference-panel ${assessment.acceptedInference ? "confirmed" : ""}`}>
              <div className="section-heading">
                <div className="heading-with-icon">
                  <Sparkles size={18} />
                  <h2>{assessment.acceptedInference ? "已确认的理解" : "AI 推测"}</h2>
                </div>
                <StatusBadge
                  status={
                    assessment.acceptedInference ? "confirmed" : "inferred"
                  }
                />
              </div>
              <p className="inference-statement">你{inferred.statement}。</p>
              {assessment.acceptedInference && <SourceBadge source="user_confirmation" />}
              <div className="inference-reason">
                <span>为什么这样理解？</span>
                <p>你提到：Java 基础已经学过，也做过 Java + MySQL 项目。</p>
              </div>
              <p className="caution-text">
                {assessment.acceptedInference
                  ? "你已确认这条理解符合当前情况。"
                  : "这是一项推测，不是已确认事实。"}
              </p>
              <div className="button-row">
                <button
                  className="button secondary small"
                  onClick={() => assessment.acceptedInference ? assessment.revokeInferenceConfirmation() : assessment.setAcceptedInference(true)}
                >
                  {assessment.acceptedInference ? "修改确认" : "符合我的情况"}
                </button>
                <button
                  className={`button secondary small emphasis ${assessment.guidedDemo && !assessment.acceptedInference ? 'guided-preselected' : ''}`}
                  aria-pressed={assessment.guidedDemo && !assessment.acceptedInference}
                  onClick={onCorrect}
                >
                  不准确
                </button>
                {assessment.guidedDemo && <span className="badge priority-P0">标准演示推荐</span>}
              </div>
            </section>
          )}
          {assessment.inferenceSuperseded && <div className="notice success"><Sparkles size={17}/><div><strong>原先的框架学习推测已被新事实覆盖</strong><p>你补充了“多线程尚未学习”，建议会依据这一事实重新排序。</p></div></div>}
          <section className="surface info-section">
            <div className="section-heading">
              <h2>{remainingSupplementItems.length ? "待补充" : "补充信息"}</h2>
              <span className={`badge ${remainingSupplementItems.length ? "status-unknown" : "status-confirmed"}`}>
                {remainingSupplementItems.length ? `${remainingSupplementItems.length} 项待补充` : "已补充"}
              </span>
            </div>
            {remainingSupplementItems.length > 0 && <p className="section-intro">以下信息可以帮助完善判断，未填写的项目继续保持未知。</p>}
            <div className="fact-list">
              {!isCaseUnderstanding && assessment.hasCustomSupplement && <div className="fact-row"><span>已补充岗位相关能力信息：{assessment.supplementSelections.general}</span><div><SourceBadge source="user_supplement"/><button className="button ghost small" onClick={onSupplement}>修改补充</button></div></div>}
              {remainingSupplementItems.map((item) => (
                <div className="fact-row" key={item.id}>
                  <span>{item.statement}</span>
                  <button
                    className="button ghost small"
                    onClick={onSupplement}
                  >
                    补充
                  </button>
                </div>
              ))}
              {remainingSupplementItems.length === 0 && isCaseUnderstanding && <p className="all-confirmed">当前列出的补充信息已确认。</p>}
            </div>
          </section>
          <div className="sticky-action">
            <div className={`information-status ${assessment.canGenerateFormal ? "ready" : "pending"}`}>
              <Info size={19} aria-hidden="true" />
              <div>
                <strong>{assessment.canGenerateFormal ? "关键信息已确认" : "仍有关键信息会影响建议排序"}</strong>
                <p>{assessment.canGenerateFormal
                  ? unknown.length ? <>仍有 <em>{unknown.length} 项非关键信息</em>可以补充，不会阻止生成正式诊断。</> : "现在可以生成正式诊断。"
                  : "你可以先补充关键事实，也可以先查看初步诊断。"}</p>
              </div>
            </div>
            <div className="button-row">
              {isCaseUnderstanding && <button className="button secondary" onClick={onSupplement}>{assessment.canGenerateFormal ? "补充剩余信息" : "补充关键信息"}</button>}
              <button className="button ghost" onClick={assessment.backToForm}>编辑全部信息</button>
              <button
                className="button primary"
                onClick={assessment.showPreliminary}
              >
                {assessment.canGenerateFormal ? "生成正式诊断" : "先看初步诊断"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <ContextRail>
          <RailCard title="当前目标">
            <strong>{form.targetRole}</strong>
            <p>
              {form.months} 个月后投递 · 每周 {form.hours}h
            </p>
          </RailCard>
          <RailCard title="岗位要求">
            <div className="rail-tags">
              {(isCaseUnderstanding
                ? ["Java", "多线程", "Spring Boot", "MySQL", "Redis", "算法"]
                : form.jdText.trim().split("\n").filter(Boolean).slice(0, 3)
              ).map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <p className="muted">
              {form.noJd || !form.jdText.trim()
                ? "来源：通用岗位假设"
                : "来源：目标 JD"}
            </p>
          </RailCard>
          <RailCard title="本次信息状态">
            <p>
              {confirmed.length} 项确认事实 · {activeInference ? 1 : 0} 项 AI 推测 · {unknown.length} 项待确认
            </p>
            <p className="muted">
              {assessment.canGenerateFormal ? "关键信息已确认，可以生成正式诊断。" : "仍有关键未确认信息，继续查看将作为初步诊断。"}
            </p>
          </RailCard>
        </ContextRail>
      </div>
    </div>
  );
}
