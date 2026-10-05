import type { ReactNode } from 'react'
import type { Route } from '../components/useHashRoute'

const navigation: { route: Route; label: string; href: string }[] = [
  { route: 'home', label: '首页', href: '#/' },
  { route: 'diagnosis', label: '我的诊断', href: '#/diagnosis' },
  { route: 'action', label: '当前行动', href: '#/action' },
]

export function AppLayout({ activeRoute, children }: { activeRoute: Route; children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">AI</span><span>求职准备助手</span></div>
        <nav aria-label="主导航" className="navigation">
          {navigation.map(({ route, label, href }) => (
            <a key={route} href={href} className={activeRoute === route ? 'nav-link active' : 'nav-link'} aria-current={activeRoute === route ? 'page' : undefined}>{label}</a>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">面向首次准备实习大学生的 AI 求职准备助手</header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
