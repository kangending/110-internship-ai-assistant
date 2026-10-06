import { useEffect, useRef, useState } from "react";
import { linHaoCase } from "../data/linHao";
import type { ConfirmedInformation, UnknownInformation } from "../types/case";
import type { Supplements } from "../data/supplementOptions";
import { resolveCaseInformation } from "./resolveInformation";

export type Stage =
  | "idle" | "form" | "analyzing" | "understanding" | "failed"
  | "preliminary" | "reanalyzing" | "revised";
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

export function navigate(path: "home" | "create" | "understanding" | "diagnosis" | "action") {
  window.location.hash = path === "home" ? "#/" : `#/${path}`;
}

const previewStage: Record<DemoState, Stage> = {
  first: "idle", existing: "revised", insufficient: "understanding",
  failure: "failed", preliminary: "preliminary", revised: "revised",
};

export function useAssessment() {
  const [businessStage, setBusinessStage] = useState<Stage>("idle");
  const [businessForm, setBusinessForm] = useState<FormValues>(emptyForm);
  const [businessUsingCase, setBusinessUsingCase] = useState(false);
  const [demoPreview, setDemoPreview] = useState<DemoState | null>(null);
  const [acceptedInference, setAcceptedInferenceState] = useState(false);
  const [supplements, setSupplements] = useState<Supplements>({});
  const [correctionNote, setCorrectionNote] = useState("");
  const [revisedBy, setRevisedBy] = useState<"correction" | "supplement" | null>(null);
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
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
  const visibleSupplements: Supplements = demoPreview || !isCaseScenario ? {} : supplements;
  const corrected = isCaseScenario && (
    (!!correctionNote && !demoPreview) || demoPreview === "revised" || demoPreview === "existing"
  );
  const resolvedInformation = isCaseScenario
    ? resolveCaseInformation(visibleSupplements, corrected, !demoPreview && acceptedInference)
    : null;
  const genericUnknown: UnknownInformation[] = [{ id: "unknown-role-details", topic: "岗位能力", statement: "岗位相关能力的掌握情况未知", status: "unknown", source: null }];
  const remainingUnknown = resolvedInformation?.unknown ?? genericUnknown;
  const remainingSupplementItems = resolvedInformation?.remainingSupplementItems ?? genericUnknown;
  const supplementSelections = resolvedInformation?.supplementSelections ?? visibleSupplements;
  const supplementFacts: ConfirmedInformation[] = resolvedInformation?.confirmed.filter(item => item.source === "user_supplement") ?? [];
  const inferenceSuperseded = resolvedInformation?.inferenceSuperseded ?? false;
  const hasDecisiveSupplements = resolvedInformation?.useRevisedRanking ?? false;
  const requiresMoreForRevision = false;
  const hasCriticalUnknown = !isCaseScenario || !!resolvedInformation?.criticalUnknown.length ||
    !!(form.noJd || !form.jdText.trim());
  const canGenerateFormal = isCaseScenario && !!resolvedInformation?.canGenerateFormal && !hasCriticalUnknown;

  function stopTimer() { if (timer.current) clearTimeout(timer.current); timer.current = null; }
  function begin(prefill: boolean) {
    stopTimer(); setDemoPreview(null); setBusinessForm(prefill ? caseForm : emptyForm);
    setBusinessUsingCase(prefill); setBusinessStage("form");
    setAcceptedInferenceState(false); setSupplements({}); setCorrectionNote(""); setRevisedBy(null); setSelectedGapId(null);
    navigate("create");
  }
  function runAnalysis() {
    stopTimer();
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDemoPreview(null); setAcceptedInferenceState(false); setBusinessStage("analyzing");
    navigate("understanding");
    timer.current = setTimeout(() => { setBusinessStage("understanding"); timer.current = null; }, 1150);
  }
  function beginReanalysis(cause: "correction" | "supplement" | null) {
    stopTimer(); setRevisedBy(cause); setBusinessStage("reanalyzing"); navigate("diagnosis");
    timer.current = setTimeout(() => { setBusinessStage("revised"); timer.current = null; }, 1150);
  }
  function applyCorrection(note: string) {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    stopTimer(); setDemoPreview(null); setCorrectionNote(note);
    setAcceptedInferenceState(false); setBusinessStage("analyzing"); navigate("understanding");
    timer.current = setTimeout(() => { setBusinessStage("understanding"); timer.current = null; }, 750);
  }
  function saveSupplements(next: Supplements) {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); setBusinessStage("understanding"); }
    setDemoPreview(null); setSupplements(current => ({ ...current, ...next }));
    if (next.threads === "尚未学习") setAcceptedInferenceState(false);
  }
  function confirmInference() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); setBusinessStage("understanding"); }
    setDemoPreview(null); setAcceptedInferenceState(true);
  }
  function showPreliminary() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDemoPreview(null);
    if (canGenerateFormal) { beginReanalysis(corrected ? "correction" : hasDecisiveSupplements ? "supplement" : null); return; }
    setBusinessStage("preliminary"); navigate("diagnosis");
  }
  function backToForm() {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); }
    setDemoPreview(null); setBusinessStage("form"); navigate("create");
  }
  function selectDemo(next: DemoState | "reset") {
    setDemoPreview(next === "reset" ? "first" : next);
    const choice = next === "reset" ? "first" : next;
    navigate(choice === "first" || choice === "existing" ? "home" :
      choice === "insufficient" || choice === "failure" ? "understanding" : "diagnosis");
  }
  function chooseGap(id: string) {
    if (demoPreview) { setBusinessForm(form); setBusinessUsingCase(usingCase); setBusinessStage("revised"); }
    setDemoPreview(null); setSelectedGapId(id); navigate("action");
  }

  return {
    stage: demoPreview ? previewStage[demoPreview] : businessStage,
    form, setForm: setBusinessForm, usingCase, setUsingCase: setBusinessUsingCase,
    isCaseScenario, demoState: demoPreview, selectDemo, begin, runAnalysis,
    acceptedInference: demoPreview ? false : acceptedInference,
    setAcceptedInference: (value: boolean) => { if (value) confirmInference(); else setAcceptedInferenceState(false); },
    supplements: visibleSupplements, supplementSelections, supplementFacts,
    remainingUnknown, remainingSupplementItems, resolvedInformation,
    canGenerateFormal, hasCriticalUnknown, corrected,
    saveSupplements, hasDecisiveSupplements, inferenceSuperseded, requiresMoreForRevision, correctionNote, revisedBy,
    selectedGapId, chooseGap, applyCorrection, showPreliminary, backToForm,
  };
}

export type Assessment = ReturnType<typeof useAssessment>;
