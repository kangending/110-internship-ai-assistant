import { useEffect, useRef, useState } from "react";
import { linHaoCase } from "../data/linHao";
import type { ConfirmedInformation, DiagnosisSnapshot, UnknownInformation } from "../types/case";
import type { Supplements } from "../data/supplementOptions";
import { resolveCaseInformation } from "./resolveInformation";
import { buildActionOutcome, buildDiagnosisHistory, canStartAction, createActionPlan } from "../data/linHaoAction";
import type { ActionFeedback, ActionPeriod, ActionPlan, ActionProgress } from "../types/action";

export type Stage =
  | "idle" | "form" | "analyzing" | "understanding" | "failed"
  | "preliminary" | "reanalyzing" | "revised" | "updating";
export type DemoState =
  | "first" | "existing" | "insufficient" | "failure" | "preliminary" | "revised";

export interface FormValues {
  targetRole: string;
  jdText: string;
  noJd: boolean;
  grade: string;
  major: string;
  months: string;
  hours: string;
  experience: string;
}

export const emptyForm: FormValues = {
  targetRole: "", jdText: "", noJd: false, grade: "", major: "",
  months: "", hours: "", experience: "",
};
export const caseForm: FormValues = {
  targetRole: linHaoCase.initialInput.targetJob.title,
  jdText: linHaoCase.initialInput.targetJob.jd?.requirements.map(item => item.text).join("\n") ?? "",
  noJd: false,
  grade: linHaoCase.initialInput.profile.grade,
  major: linHaoCase.initialInput.profile.major,
  months: "4",
  hours: "20",
  experience: "我是大三软件工程学生，想找 Java 后端实习。Java 基础已经学过，也做过一个 Java + MySQL 的学生管理系统。现在距离找实习还有四个月，我应该怎么准备？",
};

export function navigate(path: "home" | "create" | "understanding" | "diagnosis" | "proposal" | "action" | "feedback" | "update") {
  window.location.hash = path === "home" ? "#/" : `#/${path}`;
}

const previewStage: Record<DemoState, Stage> = {
  first: "idle", existing: "revised", insufficient: "understanding",
  failure: "failed", preliminary: "preliminary", revised: "revised",
};

function hasExplicitSpringDirection(form: FormValues, supplements: Supplements) {
  const experience = `${form.experience.trim()} ${supplements.general?.trim() ?? ''}`;
  const javaReady = /Java.{0,16}(基础|集合|多线程).{0,16}(具备|掌握|熟悉|扎实|熟练|已学|学完)/i.test(experience) ||
    /(具备|掌握|熟悉|扎实|熟练).{0,16}Java.{0,12}(基础|集合|多线程)/i.test(experience) ||
    supplements.threads === '可以独立完成常见基础练习';
  const mysqlReady = /MySQL.{0,16}(基础|索引|事务).{0,16}(具备|掌握|熟悉|扎实|熟练|已学|学完)/i.test(experience) ||
    /(具备|掌握|熟悉|扎实|熟练).{0,16}MySQL.{0,12}(基础|索引|事务)/i.test(experience) ||
    supplements.mysql === '了解索引和事务' || supplements.mysql === '有较完整实践经验';
  return /Java/i.test(form.targetRole) && /(后端|服务端)/.test(form.targetRole) &&
    /Spring\s*Boot/i.test(form.jdText) && javaReady && mysqlReady;
}

export function useAssessment() {
  const [businessStage, setBusinessStage] = useState<Stage>("idle");
  const [businessForm, setBusinessForm] = useState<FormValues>(emptyForm);
  const [businessUsingCase, setBusinessUsingCase] = useState(false);
  const [guidedDemo, setGuidedDemo] = useState(false);
  const [guidedDemoDeviated, setGuidedDemoDeviated] = useState(false);
  const [demoPreview, setDemoPreview] = useState<DemoState | null>(null);
  const [acceptedInference, setAcceptedInferenceState] = useState(false);
  const [supplements, setSupplements] = useState<Supplements>({});
  const [correctionNote, setCorrectionNote] = useState("");
  const [revisedBy, setRevisedBy] = useState<"correction" | "supplement" | null>(null);
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [proposedAction, setProposedAction] = useState<ActionPlan | null>(null);
  const [currentAction, setCurrentAction] = useState<ActionPlan | null>(null);
  const [firstActionTitle, setFirstActionTitle] = useState<string | null>(null);
  const [actionProgress, setActionProgress] = useState<ActionProgress>({ algorithmCompleted: 0 });
  const [actionPeriod, setActionPeriod] = useState<ActionPeriod | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [feedbackPeriodDays, setFeedbackPeriodDays] = useState<number | null>(null);
  const [actionHasFeedback, setActionHasFeedback] = useState(false);
  const [adjustingNext, setAdjustingNext] = useState(false);
  const [diagnosisOrigin, setDiagnosisOrigin] = useState<"understanding" | null>(null);
  const [actionOrigin, setActionOrigin] = useState<"proposal" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const form = demoPreview && demoPreview !== "failure" ? caseForm
    : demoPreview === "failure" && !businessForm.targetRole.trim() ? caseForm
    : businessForm;
  const usingCase = demoPreview !== null && demoPreview !== "failure" ? true
    : demoPreview === "failure" && !businessForm.targetRole.trim() ? true
    : businessUsingCase;
  const isCaseScenario = usingCase && form.targetRole.trim() === caseForm.targetRole &&
    form.experience.trim() === caseForm.experience && form.months === caseForm.months &&
    form.hours === caseForm.hours && (form.noJd || form.jdText.trim() === caseForm.jdText);
  const visibleSupplements: Supplements = demoPreview ? {} : supplements;
  const isCustomSpringReady = !isCaseScenario && !demoPreview && hasExplicitSpringDirection(form, visibleSupplements);
  const corrected = isCaseScenario && (
    (!!correctionNote && !demoPreview) || demoPreview === "revised" || demoPreview === "existing"
  );
  const customFacts: ConfirmedInformation[] = isCustomSpringReady ? [
    { id: 'custom-role', topic: '目标岗位', statement: form.targetRole, status: 'confirmed', source: 'user_input' },
    { id: 'custom-experience', topic: '当前经历', statement: form.experience, status: 'confirmed', source: 'user_input' },
    ...(visibleSupplements.general?.trim() ? [{ id: 'custom-supplement', topic: '补充能力', statement: visibleSupplements.general.trim(), status: 'confirmed' as const, source: 'user_supplement' as const }] : []),
    ...(form.grade ? [{ id: 'custom-grade', topic: '年级', statement: form.grade, status: 'confirmed' as const, source: 'user_input' as const }] : []),
    ...(form.major ? [{ id: 'custom-major', topic: '专业', statement: form.major, status: 'confirmed' as const, source: 'user_input' as const }] : []),
  ] : [];
  const customRequirements = form.jdText.split('\n').map((text, index) => ({ id: `custom-jd-${index}`, text: text.trim(), source: 'jd' as const })).filter(item => item.text);
  const customDiagnosis: DiagnosisSnapshot | null = isCustomSpringReady ? {
    id: 'custom-spring-direction', kind: 'revised', preliminary: false,
    requirements: customRequirements, missingInformation: [], supplementQuestions: [],
    recommendations: [{
      id: 'custom-spring', rank: 1, title: 'Spring Boot 基础', gapStatus: 'unknown', priority: 'P0',
      requirementIds: customRequirements.filter(item => /Spring\s*Boot/i.test(item.text)).map(item => item.id),
      informationIds: visibleSupplements.general?.trim() ? ['custom-experience', 'custom-supplement'] : ['custom-experience'],
      basis: { explicitInJd: true, confirmedGap: false, prerequisiteForLaterAbility: false, monthsUntilApplications: Number(form.months) || 4 },
      reasons: ['你当前提供的信息明确描述 Java 和 MySQL 基础已具备，目标 JD 提到 Spring Boot。', '因此当前下一阶段方向是 Spring Boot；本原型尚未为此方向建立可验证行动。'],
    }],
  } : null;
  const resolvedInformation = isCaseScenario
    ? resolveCaseInformation(visibleSupplements, corrected, !demoPreview && acceptedInference)
    : isCustomSpringReady ? {
      confirmed: customFacts, inferred: [], unknown: [],
      byId: new Map(customFacts.map(fact => [fact.id, fact])),
      criticalUnknown: [], inferenceSuperseded: false,
      supplementSelections: visibleSupplements, remainingSupplementItems: [],
      canGenerateFormal: true, useRevisedRanking: false,
    } : null;
  const actionOutcome = actionFeedback ? buildActionOutcome(actionFeedback) : null;
  const postActionFacts = actionOutcome?.facts ?? [];
  const updatedDiagnosis = actionOutcome?.diagnosis ?? null;
  // feedbackPeriodDays is recorded only after an executable action's feedback is accepted.
  // Keep this true if the user later chooses another action.
  const hasCompletedVerifiedCycle = !!(actionFeedback && updatedDiagnosis && feedbackPeriodDays !== null);
  const usesRevisedDiagnosis = !!(resolvedInformation?.useRevisedRanking || demoPreview === 'revised' || demoPreview === 'existing');
  const effectiveDiagnosis = updatedDiagnosis ?? customDiagnosis ?? (usesRevisedDiagnosis ? linHaoCase.revisedDiagnosis : linHaoCase.firstDiagnosis);
  const latestInformation = resolvedInformation && postActionFacts.length ? (() => {
    const byId = new Map(resolvedInformation.byId);
    for (const fact of postActionFacts) byId.set(fact.id, fact);
    if (byId.has('feedback-threads')) byId.set('correction-threads', byId.get('feedback-threads')!);
    if (byId.has('feedback-mysql')) byId.set('correction-mysql', byId.get('feedback-mysql')!);
    const confirmed = resolvedInformation.confirmed.filter(fact =>
      !(fact.id === 'correction-threads' && byId.has('feedback-threads')) &&
      !(fact.id === 'correction-mysql' && byId.has('feedback-mysql')));
    return { ...resolvedInformation, confirmed: [...confirmed, ...postActionFacts], byId };
  })() : resolvedInformation;
  const completedActionDays = feedbackPeriodDays ?? currentAction?.days ?? createActionPlan('after-java').days;
  const diagnosisHistory = buildDiagnosisHistory(!!updatedDiagnosis, firstActionTitle ?? currentAction?.title ?? '',
    updatedDiagnosis?.recommendations.find(item => item.id === 'after-java')?.gapStatus === 'partial', completedActionDays);
  const genericUnknown: UnknownInformation[] = [{ id: "unknown-role-details", topic: "岗位能力", statement: "岗位相关能力的掌握情况未知", status: "unknown", source: null }];
  const remainingUnknown = resolvedInformation?.unknown ?? genericUnknown;
  const hasCustomSupplement = !isCaseScenario && !!visibleSupplements.general?.trim();
  const remainingSupplementItems = resolvedInformation?.remainingSupplementItems ?? (hasCustomSupplement ? [] : genericUnknown);
  const supplementSelections = resolvedInformation?.supplementSelections ?? visibleSupplements;
  const supplementFacts: ConfirmedInformation[] = resolvedInformation?.confirmed.filter(item => item.source === "user_supplement") ?? [];
  const inferenceSuperseded = resolvedInformation?.inferenceSuperseded ?? false;
  const hasDecisiveSupplements = resolvedInformation?.useRevisedRanking ?? false;
  const requiresMoreForRevision = false;
  const hasCriticalUnknown = (!isCaseScenario && !isCustomSpringReady) || !!resolvedInformation?.criticalUnknown.length ||
    !!(form.noJd || !form.jdText.trim());
  const canGenerateFormal = (isCaseScenario || isCustomSpringReady) && !!resolvedInformation?.canGenerateFormal && !hasCriticalUnknown;

  function stopTimer() { if (timer.current) clearTimeout(timer.current); timer.current = null; }
  function clearBusinessSnapshot() {
    stopTimer();
    setDemoPreview(null); setBusinessStage('idle'); setBusinessForm(emptyForm); setBusinessUsingCase(false);
    setGuidedDemo(false); setGuidedDemoDeviated(false);
    setAcceptedInferenceState(false); setSupplements({}); setCorrectionNote(''); setRevisedBy(null);
    setSelectedGapId(null); setProposedAction(null); setCurrentAction(null); setFirstActionTitle(null);
    setActionProgress({ algorithmCompleted: 0 }); setActionPeriod(null);
    setActionFeedback(null); setFeedbackPeriodDays(null); setActionHasFeedback(false); setAdjustingNext(false);
    setDiagnosisOrigin(null); setActionOrigin(null);
  }
  function resetToFirstUse() {
    clearBusinessSnapshot();
    navigate('home');
  }
  function begin(prefill: boolean) {
    clearBusinessSnapshot();
    setBusinessForm(prefill ? caseForm : emptyForm); setBusinessUsingCase(prefill); setBusinessStage('form');
    navigate("create");
  }
  function beginStandardDemo() {
    begin(true);
    setGuidedDemo(true);
  }
  function runAnalysis() {
    stopTimer();
    if (guidedDemo && !isCaseScenario) setGuidedDemoDeviated(true);
    setDiagnosisOrigin(null);
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDemoPreview(null); setAcceptedInferenceState(false); setBusinessStage("analyzing");
    navigate("understanding");
    timer.current = setTimeout(() => { setBusinessStage("understanding"); timer.current = null; }, 1150);
  }
  function beginReanalysis(cause: "correction" | "supplement" | null) {
    stopTimer(); setDiagnosisOrigin('understanding'); setRevisedBy(cause); setBusinessStage("reanalyzing"); navigate("diagnosis");
    timer.current = setTimeout(() => { setBusinessStage("revised"); timer.current = null; }, 1150);
  }
  function applyCorrection(note: string) {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    stopTimer(); setDemoPreview(null); setCorrectionNote(note);
    setSupplements(current => ({ ...current, threads: undefined, mysql: undefined }));
    setAcceptedInferenceState(false); setBusinessStage("analyzing"); navigate("understanding");
    timer.current = setTimeout(() => { setBusinessStage("understanding"); timer.current = null; }, 750);
  }
  function saveSupplements(next: Supplements) {
    if (guidedDemo && (next.threads !== '尚未学习' || next.mysql !== '只会基础 CRUD' || next.tools !== '基本没有使用过')) setGuidedDemoDeviated(true);
    if (demoPreview) {
      setBusinessForm(form); setBusinessUsingCase(usingCase);
      setBusinessStage(window.location.hash === '#/diagnosis' ? previewStage[demoPreview] : 'understanding');
      if (demoPreview === 'revised' || demoPreview === 'existing') {
        setCorrectionNote('Java 多线程尚未学习；MySQL 只会 CRUD；学生管理系统是 JDBC 课程作业。');
        setRevisedBy('correction');
      }
    }
    setDemoPreview(null); setSupplements(current => ({ ...current, ...next }));
    if (next.threads === "尚未学习") setAcceptedInferenceState(false);
  }
  function confirmInference() {
    if (guidedDemo) setGuidedDemoDeviated(true);
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); setBusinessStage("understanding"); }
    setDemoPreview(null); setAcceptedInferenceState(true);
  }
  function revokeInferenceConfirmation() { setAcceptedInferenceState(false); }
  function showPreliminary() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDemoPreview(null);
    if (canGenerateFormal) { beginReanalysis(corrected ? "correction" : hasDecisiveSupplements ? "supplement" : null); return; }
    setDiagnosisOrigin('understanding'); setBusinessStage("preliminary"); navigate("diagnosis");
  }
  function backToForm() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDiagnosisOrigin(null); setDemoPreview(null); setBusinessStage("form"); navigate("create");
  }
  function returnToUnderstanding() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDiagnosisOrigin(null); setDemoPreview(null); setBusinessStage('understanding'); navigate('understanding');
  }
  function selectDemo(next: DemoState | "reset" | "action_active" | "after_seven_days" | "direction_ended" | "feedback_done" | "latest") {
    if (next === 'first' || next === 'reset') { resetToFirstUse(); return; }
    if (next === 'after_seven_days') {
      if (currentAction && canStartAction(currentAction) && actionPeriod === 'active') setActionPeriod('ended');
      return;
    }
    if (next === 'action_active') {
      clearBusinessSnapshot();
      setSelectedGapId('after-java'); setCurrentAction(createActionPlan('after-java'));
      setFirstActionTitle(createActionPlan('after-java').title);
      setActionPeriod('active');
      setDemoPreview(null); setBusinessForm(caseForm); setBusinessUsingCase(true); setBusinessStage('revised');
      setCorrectionNote('Java 多线程尚未学习；MySQL 只会 CRUD；学生管理系统是 JDBC 课程作业。'); setRevisedBy('correction');
      navigate('action'); return;
    }
    if (next === 'direction_ended') {
      clearBusinessSnapshot();
      setBusinessForm(caseForm); setBusinessUsingCase(true); setBusinessStage('revised');
      setCorrectionNote('Java 多线程尚未学习；MySQL 只会 CRUD；学生管理系统是 JDBC 课程作业。');
      setRevisedBy('correction');
      setSelectedGapId('after-spring'); setCurrentAction(createActionPlan('after-spring'));
      setActionPeriod('ended'); navigate('action'); return;
    }
    if (next === 'feedback_done' || next === 'latest') {
      clearBusinessSnapshot();
      setSelectedGapId('after-java'); setCurrentAction(createActionPlan('after-java'));
      setFirstActionTitle(createActionPlan('after-java').title);
      setActionFeedback({ threads: 'practiced', threadsNote: '已写过基础示例，仍不熟练。', mysql: 'intro', mysqlNote: '已接触索引基础。', algorithmCompleted: 5, algorithmIndependent: 3, difficulty: 'cannot_code' });
      setFeedbackPeriodDays(7);
      setActionHasFeedback(true);
      setActionPeriod('ended'); setDemoPreview(null); setBusinessForm(caseForm); setBusinessUsingCase(true); setBusinessStage('revised');
      setCorrectionNote('Java 多线程尚未学习；MySQL 只会 CRUD；学生管理系统是 JDBC 课程作业。'); setRevisedBy('correction');
      navigate(next === 'latest' ? 'diagnosis' : 'update'); return;
    }
    clearBusinessSnapshot();
    setDemoPreview(next); setBusinessStage(previewStage[next]);
    setBusinessForm(caseForm); setBusinessUsingCase(true);
    navigate(next === "existing" ? "home" :
      next === "insufficient" || next === "failure" ? "understanding" : "diagnosis");
  }
  function chooseGap(id: string) {
    if (guidedDemo && id !== 'after-java') setGuidedDemoDeviated(true);
    if (demoPreview) {
      setBusinessForm(form); setBusinessUsingCase(usingCase); setBusinessStage("revised");
      if (demoPreview === 'revised' || demoPreview === 'existing') {
        setCorrectionNote('Java 多线程尚未学习；MySQL 只会 CRUD；学生管理系统是 JDBC 课程作业。');
        setRevisedBy('correction');
      }
    }
    const recommendation = effectiveDiagnosis.recommendations.find(item => item.id === id);
    if (!recommendation) return;
    setDiagnosisOrigin(null); setActionOrigin(null); setDemoPreview(null); setSelectedGapId(id); setProposedAction(createActionPlan(id, recommendation.title)); setAdjustingNext(false); navigate("proposal");
  }
  function adjustProposal(next: ActionPlan) { setProposedAction(next); }
  function startAction() {
    if (!proposedAction || !canStartAction(proposedAction)) return;
    setCurrentAction(proposedAction); setActionProgress({ algorithmCompleted: 0 });
    setFirstActionTitle(current => current ?? proposedAction.title);
    setActionOrigin('proposal'); setActionPeriod('active'); setActionHasFeedback(false); setAdjustingNext(false); navigate('action');
  }
  function adjustCurrentAction(next: ActionPlan) { setCurrentAction(next); }
  function recordAlgorithmProgress(count: number) {
    setActionProgress({ algorithmCompleted: Math.max(0, Math.min(currentAction?.algorithmTarget ?? 0, count)) });
  }
  function submitActionFeedback(feedback: ActionFeedback) {
    if (!currentAction || !canStartAction(currentAction) || actionPeriod !== 'ended' || feedback.algorithmIndependent > feedback.algorithmCompleted) return;
    stopTimer(); setActionOrigin(null); setBusinessStage('updating'); navigate('update');
    const periodDays = currentAction.days;
    timer.current = setTimeout(() => { setActionFeedback(feedback); setFeedbackPeriodDays(periodDays); setActionHasFeedback(true); setBusinessStage('revised'); timer.current = null; }, 1300);
  }
  function continueNext(adjust: boolean) {
    const nextRecommendation = effectiveDiagnosis.recommendations[0];
    const nextGap = nextRecommendation.id;
    setAdjustingNext(adjust);
    setSelectedGapId(adjust ? null : nextGap);
    setProposedAction(adjust ? null : createActionPlan(nextGap, nextRecommendation.title));
    navigate('proposal');
  }
  function clearFlowOrigins() { setDiagnosisOrigin(null); setActionOrigin(null); }

  return {
    stage: demoPreview ? previewStage[demoPreview] : businessStage,
    form, setForm: setBusinessForm, usingCase, setUsingCase: setBusinessUsingCase,
    isCaseScenario, isCustomSpringReady, hasCustomSupplement, guidedDemo, guidedDemoDeviated,
    markGuidedDemoDeviation: () => setGuidedDemoDeviated(true), beginStandardDemo,
    demoState: demoPreview, selectDemo, resetToFirstUse, begin, runAnalysis,
    acceptedInference: demoPreview ? false : acceptedInference,
    setAcceptedInference: (value: boolean) => { if (value) confirmInference(); else revokeInferenceConfirmation(); },
    revokeInferenceConfirmation,
    supplements: visibleSupplements, supplementSelections, supplementFacts,
    remainingUnknown, remainingSupplementItems, resolvedInformation: latestInformation,
    canGenerateFormal, hasCriticalUnknown, corrected,
    saveSupplements, hasDecisiveSupplements, inferenceSuperseded, requiresMoreForRevision, correctionNote, revisedBy,
    selectedGapId, chooseGap, applyCorrection, showPreliminary, backToForm, returnToUnderstanding,
    diagnosisOrigin, actionOrigin, clearFlowOrigins,
    proposedAction, currentAction, actionProgress, actionPeriod, actionFeedback, actionHasFeedback,
    postActionFacts, updatedDiagnosis, effectiveDiagnosis, usesRevisedDiagnosis, hasCompletedVerifiedCycle,
    diagnosisHistory, completedActionDays, adjustingNext,
    adjustProposal, startAction, adjustCurrentAction, recordAlgorithmProgress,
    submitActionFeedback, continueNext,
  };
}

export type Assessment = ReturnType<typeof useAssessment>;
