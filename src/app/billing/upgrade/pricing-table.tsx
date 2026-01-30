'use client'

import { PricingTable } from '@clerk/nextjs'

type PricingTableSectionProps = {
  heading: string
  description: string
}

export function PricingTableSection({
  heading,
  description,
}: PricingTableSectionProps) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="space-y-2 text-center">
        <h1 className="font-semibold text-3xl text-foreground">{heading}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <PricingTable />
      </div>
    </section>
  )
}
