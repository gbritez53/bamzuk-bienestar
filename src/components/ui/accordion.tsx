'use client'

import { useState, type ReactNode } from 'react'

export interface AccordionItemData {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItemData[]
  /** IDs open by default. Defaults to the first item only (design: "first item open by default"). */
  defaultOpenIds?: string[]
}

// Cada sección se expande/colapsa de forma independiente (no es "single-open"):
// abrir una no afecta el estado de las demás — requisito explícito del spec
// (product-detail: "Expandable info accordion" / escenario "Expand one section").
export function Accordion({ items, defaultOpenIds }: AccordionProps) {
  const initial = defaultOpenIds ?? (items[0] ? [items[0].id] : [])
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(initial))

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="divide-y divide-border border-t border-border">
      {items.map(item => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}

interface AccordionItemProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

export function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full cursor-pointer items-center justify-between py-3.5 text-left"
      >
        <span className="font-heading text-base font-bold text-foreground">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-primary ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  )
}
