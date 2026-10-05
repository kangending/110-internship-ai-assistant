# AI 求职准备助手

面向首次准备实习大学生的 Web 演示原型。当前版本仅提供前端工程骨架、三个可切换的页面入口，以及林浩模拟案例的 Mock 数据。已确认的产品需求见 [docs/product-spec.md](docs/product-spec.md)。

## 技术栈

React、TypeScript、Vite。页面使用静态 Mock 数据，无后端、数据库或真实 AI 接口。导航使用浏览器 hash 路由。

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

- 左侧导航、顶部标题与主内容区域。
- 首页、我的诊断、当前行动三个可切换入口；后两页是占位页面。
- 林浩案例的数据类型与示例数据。
- 产品需求文档与 Docker 启动配置。

## 当前尚未实现

AI 理解确认、差距诊断、用户纠正、建议重新排序、行动选择、行动反馈及更新建议等业务流程。岗位搜索或推荐、自动投递、简历编辑、模拟面试、完整刷题系统、复杂任务管理、真实 AI API、后端数据库均不在当前实现范围内。
