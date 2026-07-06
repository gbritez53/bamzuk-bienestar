// Íconos inline (sin dependencia de librería) para las secciones de Home.
// Trazos minimalistas inspirados en Material Symbols Outlined del mockup
// (spa/oil_barrel/pill/psychology/eco/science/package_2), redibujados como
// SVG propios para no depender de un CDN de íconos.

type IconProps = { className?: string }

export function SpaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21c-4.5 0-7-3-7-6.5C5 11 8 7 12 4c4 3 7 7 7 10.5 0 3.5-2.5 6.5-7 6.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8" />
    </svg>
  )
}

export function OilDropIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z"
      />
    </svg>
  )
}

export function SupplementIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <rect x={4} y={4} width={16} height={16} rx={8} />
      <path strokeLinecap="round" d="M8 12h8" />
    </svg>
  )
}

export function WellnessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx={12} cy={12} r={8} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13c.7.9 1.8 1.5 3 1.5s2.3-.6 3-1.5M9 9.5h.01M15 9.5h.01" />
    </svg>
  )
}

export function EcoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20c8 0 12-4 12-13-8 0-12 5-12 13Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c2-6 5-9 9-11" />
    </svg>
  )
}

export function ScienceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
    </svg>
  )
}

export function PackagingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8 12 4l8.5 4M3.5 8v8L12 20l8.5-4V8M3.5 8 12 12l8.5-4M12 12v8" />
    </svg>
  )
}
