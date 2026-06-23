import type { ReactNode } from 'react'
import type { RoleWorkspaceConfig } from '../types/roles'
import './role-workspace.css'

type RoleWorkspaceLayoutProps = {
  config: RoleWorkspaceConfig
  children?: ReactNode
}

export function RoleWorkspaceLayout({ config, children }: RoleWorkspaceLayoutProps) {
  return (
    <main className={`role-workspace role-workspace--${config.role}`}>
      <header className="role-workspace__header">
        <p className="role-workspace__eyebrow">{config.role.replace('_', ' ')}</p>
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
      </header>

      <section className="role-workspace__capabilities" aria-label="Role capabilities">
        {config.capabilities.map((capability) => (
          <article className="role-workspace__capability" key={capability}>
            <h2>{capability}</h2>
          </article>
        ))}
      </section>

      {children}
    </main>
  )
}
