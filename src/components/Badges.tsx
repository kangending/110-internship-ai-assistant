import { CircleCheck, CircleHelp, Sparkles } from "lucide-react";
import type {
  GapStatus,
  InformationSource,
  InformationStatus,
  Priority,
} from "../types/case";

const sourceLabel: Record<InformationSource, string> = {
  user_input: "你的填写",
  jd: "目标 JD",
  ai_inference: "AI 推测",
  generic_role_assumption: "通用岗位假设",
  user_correction: "用户纠正",
  user_supplement: "用户补充",
  user_confirmation: "用户确认",
  action_feedback: "本次行动反馈",
};
const statusLabel: Record<InformationStatus, string> = {
  confirmed: "已确认",
  inferred: "AI 推测",
  unknown: "待确认",
};
const gapLabel: Record<GapStatus, string> = {
  met: "已满足",
  partial: "部分满足",
  gap: "当前缺口",
  unknown: "能力待核实",
};

export function StatusBadge({ status }: { status: InformationStatus }) {
  const Icon =
    status === "confirmed"
      ? CircleCheck
      : status === "inferred"
        ? Sparkles
        : CircleHelp;
  return (
    <span className={`badge status-${status}`}>
      <Icon size={13} />
      {statusLabel[status]}
    </span>
  );
}
export function SourceBadge({
  source,
}: {
  source: InformationSource;
}) {
  return <span className="source-badge">来源：{sourceLabel[source]}</span>;
}
export function GapBadge({ status }: { status: GapStatus }) {
  return <span className={`badge gap-${status}`}>{gapLabel[status]}</span>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge priority-${priority}`}>
      {priority} ·{" "}
      {priority === "P0"
        ? "现在优先"
        : priority === "P1"
          ? "接下来补"
          : "后续增强"}
    </span>
  );
}
