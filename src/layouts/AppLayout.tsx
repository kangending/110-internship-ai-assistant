import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  House,
  Target,
  ListChecks,
  FlaskConical,
  ChevronDown,
  Info,
  Sparkles,
} from "lucide-react";
import type { Route } from "../components/useHashRoute";
import { FlowBackButton } from "../components/FlowBackButton";
import { canStartAction } from "../data/linHaoAction";
import type { Assessment, DemoState } from "../state/useAssessment";

const navigation = [
  { route: "home", label: "首页", href: "#/", icon: House },
  { route: "diagnosis", label: "我的诊断", href: "#/diagnosis", icon: Target },
  { route: "action", label: "当前行动", href: "#/action", icon: ListChecks },
] as const;

const demoOptions: { value: DemoState | "reset" | "action_active" | "feedback_done" | "latest"; label: string }[] = [
  { value: "first", label: "首次使用" },
  { value: "existing", label: "模拟已有记录（林浩）" },
  { value: "insufficient", label: "模拟信息不足（林浩）" },
  { value: "failure", label: "模拟 AI 生成失败" },
  { value: "preliminary", label: "模拟初步诊断（林浩）" },
  { value: "revised", label: "模拟用户纠正后（林浩）" },
  { value: "action_active", label: "模拟行动进行中（林浩）" },
  { value: "feedback_done", label: "模拟行动反馈完成后（林浩）" },
  { value: "latest", label: "模拟最新诊断（林浩）" },
  { value: "reset", label: "恢复初始状态" },
];

export function AppLayout({
  activeRoute,
  assessment,
  children,
}: {
  activeRoute: Route;
  assessment: Assessment;
  children: ReactNode;
}) {
  const [demoOpen, setDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!demoOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!demoRef.current?.contains(event.target as Node)) setDemoOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDemoOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [demoOpen]);
  const navRoute =
    activeRoute === "create" || activeRoute === "understanding"
      ? "diagnosis"
      : activeRoute === "proposal" || activeRoute === "feedback" || activeRoute === "update" ? "action" : activeRoute;
  const hasContext =
    assessment.form.targetRole.trim() || assessment.stage === "revised";
  const canFastForward = !!assessment.currentAction && canStartAction(assessment.currentAction) &&
    assessment.actionPeriod === 'active' && !assessment.actionHasFeedback;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#/" aria-label="回到首页" onClick={() => { setDemoOpen(false); assessment.clearFlowOrigins(); }}>
          <span className="brand-mark">
            <Sparkles size={16} strokeWidth={2.3} />
          </span>
          <span>求职准备</span>
        </a>
        <div className="nav-caption">工作区</div>
        <nav className="navigation" aria-label="主导航">
          {navigation.map(({ route, label, href, icon: Icon }) => (
            <a
              key={route}
              href={href}
              onClick={() => { setDemoOpen(false); assessment.clearFlowOrigins(); }}
              className={`nav-link ${navRoute === route ? "active" : ""}`}
              aria-current={navRoute === route ? "page" : undefined}
            >
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom" ref={demoRef}>
          {activeRoute === 'action' && canFastForward && (
            <div className="demo-action-hint" role="note">
              <Info size={15} aria-hidden="true" />
              <div>
                <strong>演示提示</strong>
                <p>打开「演示模式」<br />选择「<b>快进到本周期结束</b>」<br />即可继续体验行动反馈流程</p>
              </div>
            </div>
          )}
          <button
            className="demo-trigger"
            type="button"
            onClick={() => setDemoOpen(!demoOpen)}
            aria-expanded={demoOpen}
          >
            <FlaskConical size={17} /> 演示模式 <ChevronDown size={14} />
          </button>
          {demoOpen && (
            <div className="demo-menu" aria-label="演示状态">
              {demoOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    assessment.selectDemo(option.value);
                    setDemoOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
              {canFastForward && <button type="button" onClick={() => {
                assessment.selectDemo('after_seven_days');
                setDemoOpen(false);
              }}>快进到本周期结束</button>}
            </div>
          )}
          <span className="sidebar-footnote">虚构案例 · 仅供原型体验</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            {hasContext
              ? assessment.form.targetRole || "Java 后端开发实习生"
              : "岗位差距诊断"}
          </div>
          {hasContext && (
            <div className="topbar-meta">
              <span>{assessment.form.months || "4"} 个月后投递</span>
              <span>每周 {assessment.form.hours || "20"}h</span>
              {assessment.usingCase && (
                <span className="context-chip">模拟案例</span>
              )}
            </div>
          )}
        </header>
        <main className="main-content"><FlowBackButton route={activeRoute} assessment={assessment}/>{children}</main>
      </div>
    </div>
  );
}
