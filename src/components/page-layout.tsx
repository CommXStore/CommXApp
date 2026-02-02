'use client'

import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h1 className="font-semibold text-2xl">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

type PageLayoutProps = {
  children: ReactNode
  header?: ReactNode
}

export function PageLayout({ children, header }: PageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-4">
      {header}
      <div className="flex h-full flex-col gap-4">{children}</div>
    </div>
  )
}
