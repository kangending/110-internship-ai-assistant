# AI 求职准备助手

面向首次准备实习大学生的 Web 演示原型。当前版本可用林浩虚构案例体验从首次输入、AI 理解确认到纠错后诊断更新的流程。已确认的产品需求见 [docs/product-spec.md](docs/product-spec.md)。

## 技术栈

React、TypeScript、Vite、lucide-react。页面使用静态 Mock 数据，无后端、数据库或真实 AI 接口。导航使用浏览器 hash 路由；演示状态只在当前浏览器会话内保存。

## 本地开发

需要 Node.js 20.19+ 或 22.12+，以及 npm。

```bash
npm ci
npm run dev
```

浏览器访问终端显示的地址，默认是 http://localhost:5173 。生产构建可运行 `npm run build`。

## Docker 启动

需要 Docker 和 Docker Compose。

```bash
docker compose up --build
```

浏览器访问 http://localhost:8080 。容器以 Nginx 提供构建后的静态页面。

## 当前已实现

- 深色视觉系统、左侧导航、上下文栏、状态徽标与来源徽标。
- 首页首次使用与已有记录状态；建立诊断页的空表单、林浩预填、无 JD 状态和表单校验。
- 分析中、生成失败与重试；AI 理解确认、信息不足、初步诊断、依据 Drawer、纠错 Dialog、重新分析与修正后诊断 Diff。
- 左侧“演示模式”可切换关键状态；林浩案例的类型和 Mock 数据驱动页面内容。
- 产品需求文档与 Docker 启动配置。

## 当前尚未实现

完整行动选择、当前行动、行动反馈和行动后的建议更新尚未实现。案例以外的输入可以编辑并保留，但不会生成未经验证的个人建议排序。岗位搜索或推荐、自动投递、简历编辑、模拟面试、完整刷题系统、复杂任务管理、真实 AI API、后端数据库均不在当前实现范围内。
