import { useState } from "react";
import { ArrowRight, CircleHelp, FileText, Sparkles } from "lucide-react";
import { linHaoCase } from "../data/linHao";
import { ContextRail, RailCard } from "../components/ContextRail";
import { SourceBadge } from "../components/Badges";
import {
  caseForm,
  type Assessment,
  type FormValues,
} from "../state/useAssessment";

type Field = "targetRole" | "experience" | "months" | "hours";

export function CreateDiagnosisPage({
  assessment,
}: {
  assessment: Assessment;
}) {
  const { form, setForm } = assessment;
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  function update(key: keyof FormValues, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key in errors)
      setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!form.targetRole.trim()) next.targetRole = "请填写目标岗位";
    if (!form.experience.trim()) next.experience = "请描述一下当前经历";
    if (!form.months.trim() || Number(form.months) <= 0)
      next.months = "请填写距离投递的月数";
    if (!form.hours.trim() || Number(form.hours) <= 0)
      next.hours = "请填写每周可投入时间";
    setErrors(next);
    if (Object.keys(next).length === 0) assessment.runAnalysis();
  }
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">建立诊断</span>
          <h1>建立岗位差距诊断</h1>
          <p>先告诉我你的目标和现在的位置。</p>
        </div>
        {assessment.usingCase ? (
          <div className="case-loaded" aria-label="林浩模拟案例已载入">
            <div className="case-loaded-head"><span>模拟案例</span><span className="case-loaded-badge">已载入</span></div>
            <div className="case-loaded-body"><strong>林浩</strong><button type="button" className="button ghost small" onClick={() => { setForm(caseForm); setErrors({}); }}>重新载入</button></div>
            <p>大三上 · 软件工程 · Java 后端</p>
          </div>
        ) : (
          <button type="button" className="load-case-action" onClick={() => { setForm(caseForm); assessment.setUsingCase(true); setErrors({}); }}>
            <span className="load-case-icon"><Sparkles size={19} /></span>
            <span><strong>载入「林浩」模拟案例</strong><small>快速填充目标岗位、JD 和经历</small></span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="content-grid">
        <form className="form-stack" onSubmit={submit} noValidate>
          <section className="surface form-section">
            <div className="section-heading">
              <span className="section-number" aria-hidden="true">1</span>
              <div>
                <h2>目标岗位与 JD</h2>
                <p>有具体 JD 时，判断会优先依据你提供的岗位要求。</p>
              </div>
            </div>
            <label htmlFor="target-role">
              目标岗位 <span className="required">*</span>
            </label>
            <input
              id="target-role"
              value={form.targetRole}
              onChange={(e) => update("targetRole", e.target.value)}
              placeholder="例如：Java 后端开发实习生"
              aria-invalid={!!errors.targetRole}
            />
            {errors.targetRole && (
              <span className="field-error">{errors.targetRole}</span>
            )}
            <label htmlFor="target-jd">
              目标 JD <span className="optional">建议填写</span>
            </label>
            <textarea
              id="target-jd"
              rows={6}
              value={form.jdText}
              disabled={form.noJd}
              onChange={(e) => update("jdText", e.target.value)}
              placeholder="粘贴岗位描述中的能力要求"
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={form.noJd}
                onChange={(e) => update("noJd", e.target.checked)}
              />
              暂时没有具体 JD
            </label>
            {form.noJd && (
              <div className="inline-note">
                <CircleHelp size={17} />
                <div>
                  <strong>通用岗位假设</strong>
                  <p>
                    当前将基于 Java
                    后端实习的通用岗位要求生成初步诊断。后续补充真实 JD
                    后，建议可能变化。
                  </p>
                </div>
              </div>
            )}
          </section>
          <section className="surface form-section">
            <div className="section-heading">
              <span className="section-number" aria-hidden="true">2</span>
              <div>
                <h2>准备条件</h2>
                <p>时间约束能帮助我们判断当前优先级。</p>
              </div>
            </div>
            <div className="field-grid">
              <div>
                <label htmlFor="grade">年级</label>
                <input
                  id="grade"
                  value={form.grade}
                  onChange={(e) => update("grade", e.target.value)}
                  placeholder="例如：大三上学期"
                />
              </div>
              <div>
                <label htmlFor="major">专业</label>
                <input
                  id="major"
                  value={form.major}
                  onChange={(e) => update("major", e.target.value)}
                  placeholder="例如：软件工程"
                />
              </div>
              <div>
                <label htmlFor="months">
                  距离计划投递 <span className="required">*</span>
                </label>
                <div className="input-unit">
                  <input
                    id="months"
                    type="number"
                    min="1"
                    value={form.months}
                    onChange={(e) => update("months", e.target.value)}
                    placeholder="4"
                    aria-invalid={!!errors.months}
                  />
                  <span>个月</span>
                </div>
                {errors.months && (
                  <span className="field-error">{errors.months}</span>
                )}
              </div>
              <div>
                <label htmlFor="hours">
                  每周可投入 <span className="required">*</span>
                </label>
                <div className="input-unit">
                  <input
                    id="hours"
                    type="number"
                    min="1"
                    value={form.hours}
                    onChange={(e) => update("hours", e.target.value)}
                    placeholder="20"
                    aria-invalid={!!errors.hours}
                  />
                  <span>小时</span>
                </div>
                {errors.hours && (
                  <span className="field-error">{errors.hours}</span>
                )}
              </div>
            </div>
          </section>
          <section className="surface form-section">
            <div className="section-heading">
              <span className="section-number" aria-hidden="true">3</span>
              <div>
                <h2>当前经历</h2>
                <p>用自己的话描述即可，我们会先整理并请你确认。</p>
              </div>
            </div>
            <label htmlFor="experience">
              你的经历 <span className="required">*</span>
            </label>
            <textarea
              id="experience"
              rows={5}
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              placeholder="写下已学技能、课程、项目，以及你觉得薄弱的地方……"
              aria-invalid={!!errors.experience}
            />
            {errors.experience && (
              <span className="field-error">{errors.experience}</span>
            )}
            <div className="hint-chips">
              <span>学过的技术</span>
              <span>项目经历</span>
              <span>课程</span>
              <span>觉得薄弱的地方</span>
            </div>
          </section>
          <div className="form-actions">
            <span>下一步会先请你确认 AI 对信息的理解</span>
            <button className="button primary" type="submit">
              让 AI 整理我的情况 <ArrowRight size={16} />
            </button>
          </div>
        </form>
        <ContextRail>
          <RailCard title="本次诊断依据">
            <div className="rail-list">
              <div>
                <FileText size={16} />
                目标 JD
              </div>
              <div>
                <SourceBadge source="user_input" />
              </div>
              <div>
                <SourceBadge source="ai_inference" />
              </div>
            </div>
          </RailCard>
          <RailCard title="我们不会这样判断">
            <p>没有提到 ≠ 不会</p>
            <p className="muted">
              如果某项能力的信息不足，会标记为“待确认”，不会直接当成你的短板。
            </p>
          </RailCard>
          {assessment.usingCase && (
            <RailCard title="模拟案例">
              <p>{linHaoCase.disclaimer}</p>
            </RailCard>
          )}
        </ContextRail>
      </div>
    </div>
  );
}
