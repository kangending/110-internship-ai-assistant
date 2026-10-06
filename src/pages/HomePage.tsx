import {
  ArrowRight,
  CheckCheck,
  Crosshair,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { linHaoCase } from "../data/linHao";
import { navigate, type Assessment } from "../state/useAssessment";

const flow = [
  {
    number: "1",
    title: "确认 AI 理解",
    text: "区分事实、推测和未知信息",
    icon: CheckCheck,
  },
  {
    number: "2",
    title: "找到关键差距",
    text: "对照岗位要求和当前经历",
    icon: Crosshair,
  },
  {
    number: "3",
    title: "决定下一步",
    text: "把建议转换成一个可执行行动",
    icon: RotateCcw,
  },
];

export function HomePage({ assessment }: { assessment: Assessment }) {
  const existing =
    assessment.demoState === "existing" || assessment.stage === "revised";
  if (existing)
    return (
      <div className="page-enter home-page">
        <div className="hero-kicker">
          你的准备进度
        </div>
        <h1>目标已明确，接着推进最重要的一步。</h1>
        <p className="hero-lead">
          最近的补充已经更新诊断，可以从当前主线继续。
        </p>
        <div className="existing-grid">
          <div className="surface stat-panel">
            <span className="muted-label">当前目标</span>
            <strong>Java 后端开发实习生</strong>
            <span>距离投递约 4 个月</span>
          </div>
          <div className="surface stat-panel">
            <span className="muted-label">最近变化</span>
            <strong>Java 核心基础</strong>
            <span>当前缺口 → 部分满足</span>
          </div>
          <div className="surface stat-panel">
            <span className="muted-label">当前主线</span>
            <strong>Spring Boot 基础</strong>
            <span>继续推进</span>
          </div>
        </div>
        <div className="button-row">
          <button
            className="button primary hero-cta"
            onClick={() => navigate("diagnosis")}
          >
            查看最新诊断 <ArrowRight size={16} />
          </button>
          <button
            className="button secondary"
            onClick={() => navigate("action")}
          >
            继续当前行动
          </button>
        </div>
        <p className="disclaimer">模拟案例，仅用于原型体验。</p>
      </div>
    );
  return (
    <div className="page-enter home-page">
      <div className="hero">
        <div className="hero-kicker">
          岗位差距诊断
        </div>
        <h1>
          先找到真正的差距，
          <br />
          再决定下一步。
        </h1>
        <p className="hero-lead">
          把目标岗位和你的经历放在一起。先确认 AI
          有没有理解错，再找出现在最值得处理的问题。
        </p>
        <div className="button-row">
          <button
            className="button primary hero-cta"
            onClick={() => assessment.begin(false)}
          >
            开始第一次诊断 <ArrowRight size={18} />
          </button>
          <button
            className="button secondary hero-cta demo-accent-button"
            onClick={() => assessment.begin(true)}
          >
            <Sparkles size={17} /> 使用「林浩」模拟案例
          </button>
        </div>
        <p className="disclaimer">
          林浩为虚构模拟案例，用于原型体验，不是真实用户研究数据。
        </p>
      </div>
      <div className="home-section-title">
        <span className="eyebrow">从信息到行动</span>
        <h2>三步看清下一步</h2>
      </div>
      <div className="flow-grid">
        {flow.map((item) => (
          <div className="surface flow-card" key={item.number}>
            <span className="flow-number">{item.number}</span>
            <item.icon size={20} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <div className="surface case-preview">
        <div>
          <span className="eyebrow">模拟案例预览</span>
          <h2>林浩</h2>
          <p>大三上学期 · 软件工程</p>
          <div className="case-facts">
            <span>目标：{linHaoCase.initialInput.targetJob.title}</span>
            <span>距离投递：4 个月</span>
            <span>每周时间：20h</span>
            <span>已有：Java 基础、MySQL、JDBC 学生管理系统</span>
          </div>
        </div>
        <button className="button secondary case-preview-cta demo-accent-button" onClick={() => assessment.begin(true)}>
          使用该案例开始体验 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
