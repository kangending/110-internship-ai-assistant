import { linHaoCase } from '../data/linHao'

export function HomePage() {
  return (
    <section className="page">
      <p className="eyebrow">项目演示原型</p>
      <h1>首页</h1>
      <p className="intro">帮助首次准备实习的大学生看清目标岗位与自身经历之间的差距，并找到下一步行动。</p>
      <div className="panel">
        <h2>模拟案例</h2>
        <p>{linHaoCase.initialInput.profile.name} · {linHaoCase.initialInput.profile.grade} · {linHaoCase.initialInput.profile.major}</p>
        <p>目标岗位：{linHaoCase.initialInput.targetJob.title}</p>
      </div>
    </section>
  )
}
