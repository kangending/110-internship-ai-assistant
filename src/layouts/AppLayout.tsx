import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  House,
  Target,
  ListChecks,
  FlaskConical,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { Route } from "../components/useHashRoute";
import type { Assessment, DemoState } from "../state/useAssessment";

const navigation = [
  { route: "home", label: "首页", href: "#/", icon: House },
  { route: "diagnosis", label: "我的诊断", href: "#/diagnosis", icon: Target },
  { route: "action", label: "当前行动", href: "#/action", icon: ListChecks },
] as const;

const demoOptions: { value: DemoState | "reset"; label: string }[] = [
  { value: "first", label: "首次使用" },
  { value: "existing", label: "已有记录" },
  { value: "insufficient", label: "信息不足" },
  { value: "failure", label: "AI 生成失败" },
  { value: "preliminary", label: "初步诊断" },
  { value: "revised", label: "用户纠正后" },
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
      : activeRoute;
  const hasContext =
    assessment.form.targetRole.trim() || assessment.stage === "revised";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#/" aria-label="回到首页" onClick={() => setDemoOpen(false)}>
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
              onClick={() => setDemoOpen(false)}
              className={`nav-link ${navRoute === route ? "active" : ""}`}
              aria-current={navRoute === route ? "page" : undefined}
            >
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom" ref={demoRef}>
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
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
