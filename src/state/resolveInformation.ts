import { linHaoCase } from "../data/linHao";
import { supplementOptions, type SupplementKey, type Supplements } from "../data/supplementOptions";
import type { ConfirmedInformation, Information, UnknownInformation } from "../types/case";

// All views resolve the same facts. A later explicit correction outranks a
// supplement, which outranks a confirmation, initial statement and inference.
export function resolveCaseInformation(supplements: Supplements, corrected: boolean, accepted: boolean) {
  const confirmed = new Map<string, ConfirmedInformation>();
  for (const fact of linHaoCase.firstUnderstanding.confirmed) confirmed.set(fact.id, fact);
  const byId = new Map<string, Information>();
  for (const fact of confirmed.values()) byId.set(fact.id, fact);

  for (const key of Object.keys(supplementOptions) as SupplementKey[]) {
    const answer = supplements[key];
    if (!answer) continue;
    const option = supplementOptions[key];
    const fact: ConfirmedInformation = {
      id: `supplement-${key}`, topic: option.topic,
      statement: `${option.topic}：${answer}`, status: "confirmed", source: "user_supplement",
    };
    confirmed.set(fact.id, fact);
    byId.set(fact.id, fact);
    byId.set(option.unknownId, fact);
  }

  if (corrected) {
    for (const correction of linHaoCase.corrections) {
      const fact: ConfirmedInformation = { ...correction, status: "confirmed" };
      if (correction.id === "correction-java") confirmed.delete("fact-java");
      if (correction.id === "correction-project") confirmed.delete("fact-project");
      if (correction.id === "correction-threads") confirmed.delete("supplement-threads");
      if (correction.id === "correction-mysql") confirmed.delete("supplement-mysql");
      confirmed.set(fact.id, fact);
      byId.set(fact.id, fact);
      for (const oldId of correction.supersedesInformationIds) byId.set(oldId, fact);
      if (correction.id === "correction-java") byId.set("fact-java", fact);
      if (correction.id === "correction-project") byId.set("fact-project", fact);
    }
  }

  const inferenceSuperseded = corrected || supplements.threads === "尚未学习";
  const inference = linHaoCase.firstUnderstanding.inferred[0];
  const inferred = !inferenceSuperseded && !accepted ? [inference] : [];
  if (!inferenceSuperseded) {
    if (accepted) {
      const confirmation: ConfirmedInformation = {
        id: inference.id, topic: inference.topic, statement: inference.statement,
        status: "confirmed", source: "user_confirmation",
      };
      confirmed.set(confirmation.id, confirmation);
      byId.set(confirmation.id, confirmation);
    } else byId.set(inference.id, inference);
  }

  const unknown: UnknownInformation[] = linHaoCase.firstUnderstanding.unknown.filter(item => {
    if (byId.has(item.id)) return false;
    byId.set(item.id, item);
    return true;
  });
  const criticalIds = new Set(linHaoCase.firstDiagnosis.missingInformation
    .filter(item => item.affectsTopThree).map(item => item.informationId));
  const criticalUnknown = unknown.filter(item => criticalIds.has(item.id));
  // The drawer reflects concrete answers only. Confirming the high-level
  // Spring Boot inference never supplies any of these selections.
  const supplementSelections: Supplements = { ...supplements };
  if (corrected) {
    supplementSelections.threads = "尚未学习";
    supplementSelections.mysql = "只会基础 CRUD";
  }
  const remainingSupplementItems = unknown.filter(item =>
    Object.values(supplementOptions).some(option => option.unknownId === item.id));
  return {
    confirmed: [...confirmed.values()], inferred, unknown, byId,
    criticalUnknown, inferenceSuperseded, supplementSelections, remainingSupplementItems,
    canGenerateFormal: inferred.length === 0 && criticalUnknown.length === 0,
    useRevisedRanking: corrected ||
      (supplements.threads === "尚未学习" && supplements.mysql === "只会基础 CRUD"),
  };
}
