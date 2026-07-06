import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface PaginationProps {
  currentPage: number
  lastPage: number
  basePath: string
  total: number
  pageSize: number
}

export default function Pagination({
  currentPage,
  lastPage,
  basePath,
  total,
  pageSize,
}: PaginationProps) {
  const t = useTranslations('pagination')

  if (lastPage <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  return (
    <nav aria-label={t('label')} className="mt-10 flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        {t('showing', { start: startItem, end: endItem, total })}
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={`${basePath}?page=${currentPage - 1}`}
            aria-label={t('prev')}
            className="flex h-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </span>
        )}

        {/* Page numbers */}
        {Array.from({ length: Math.min(lastPage, 7) }, (_, i) => {
          // Mostrar ventana de páginas centrada en la actual
          let pageNum: number
          if (lastPage <= 7) {
            pageNum = i + 1
          } else if (currentPage <= 4) {
            pageNum = i + 1
          } else if (currentPage >= lastPage - 3) {
            pageNum = lastPage - 6 + i
          } else {
            pageNum = currentPage - 3 + i
          }

          const isActive = pageNum === currentPage
          return (
            <Link
              key={pageNum}
              href={`${basePath}?page=${pageNum}`}
              className={`flex h-9 min-w-[2.25rem] cursor-pointer items-center justify-center rounded-xl px-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                  : 'border border-border bg-card text-foreground hover:border-primary/50 hover:text-primary'
              }`}
            >
              {pageNum}
            </Link>
          )
        })}

        {/* Next */}
        {currentPage < lastPage ? (
          <Link
            href={`${basePath}?page=${currentPage + 1}`}
            aria-label={t('next')}
            className="flex h-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        )}
      </div>
    </nav>
  )
}
