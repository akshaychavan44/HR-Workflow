"use client"

import { MoreHorizontal } from "lucide-react"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "./feedback"

export type Column<Row> = {
  key: string
  header: string
  cell: (row: Row) => ReactNode
  /** Column width or alignment classes, applied to header and cells. */
  className?: string
  /** Shape of this column's shimmer while a row is processing. */
  skeletonClassName?: string
}

/**
 * Bordered-free table with a grey rounded header row. Below 640px each row
 * becomes a stacked card, so callers don't need a separate mobile view.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  caption,
  selectable = false,
  isRowLoading,
  rowMenu,
  onRowClick,
  empty,
}: {
  columns: Column<Row>[]
  rows: Row[]
  getRowId: (row: Row) => string
  /** Accessible table name. */
  caption: string
  selectable?: boolean
  /** Rows for which this returns true render as shimmer skeletons. */
  isRowLoading?: (row: Row) => boolean
  /** `DropdownMenuItem`s for the row's ⋯ menu. */
  rowMenu?: (row: Row) => ReactNode
  onRowClick?: (row: Row) => void
  empty?: ReactNode
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (rows.length === 0 && empty) return <>{empty}</>

  const ids = rows.map(getRowId)
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id))
  const someSelected = ids.some((id) => selected.has(id))

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const menu = (row: Row) =>
    rowMenu ? (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Row actions"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex size-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-panel hover:text-ink"
        >
          <MoreHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {rowMenu(row)}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null

  return (
    <>
      {/* Scrolls inside its card when a tablet can't fit every column. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-[13px] text-ink-secondary">
              {selectable ? (
                <th scope="col" className="w-11 rounded-l-panel bg-panel py-3 pl-4">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(ids))}
                  />
                </th>
              ) : null}
              {columns.map((column, i) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "bg-panel px-3 py-3 font-normal",
                    i === 0 && !selectable && "rounded-l-panel pl-4",
                    i === columns.length - 1 && !rowMenu && "rounded-r-panel pr-4",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowMenu ? (
                <th scope="col" className="w-12 rounded-r-panel bg-panel pr-2">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = getRowId(row)
              const loading = isRowLoading?.(row) ?? false
              return (
                <tr
                  key={id}
                  aria-busy={loading || undefined}
                  onClick={onRowClick && !loading ? () => onRowClick(row) : undefined}
                  className={cn(
                    "text-[13px] text-ink transition-colors",
                    onRowClick && !loading && "cursor-pointer hover:bg-panel/60"
                  )}
                >
                  {selectable ? (
                    <td className="py-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select row ${id}`}
                        disabled={loading}
                        checked={selected.has(id)}
                        onCheckedChange={() => toggle(id)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column, i) => (
                    <td
                      key={column.key}
                      className={cn("px-3 py-3.5", i === 0 && !selectable && "pl-4", column.className)}
                    >
                      {loading ? (
                        <Skeleton className={cn("h-4 w-24", column.skeletonClassName)} />
                      ) : (
                        column.cell(row)
                      )}
                    </td>
                  ))}
                  {rowMenu ? (
                    <td className="pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                      {loading ? null : menu(row)}
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 sm:hidden" aria-label={caption}>
        {rows.map((row) => {
          const id = getRowId(row)
          const loading = isRowLoading?.(row) ?? false
          return (
            <li
              key={id}
              aria-busy={loading || undefined}
              onClick={onRowClick && !loading ? () => onRowClick(row) : undefined}
              className="rounded-panel bg-panel p-4"
            >
              {loading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-2/3 bg-surface" />
                  <Skeleton className="h-4 w-1/2 bg-surface" />
                </div>
              ) : (
                <dl className="space-y-2">
                  {columns.map((column) => (
                    <div key={column.key} className="flex items-center justify-between gap-4 text-[13px]">
                      <dt className="text-ink-secondary">{column.header}</dt>
                      <dd className="min-w-0 truncate text-right text-ink">{column.cell(row)}</dd>
                    </div>
                  ))}
                  {rowMenu ? (
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                      {menu(row)}
                    </div>
                  ) : null}
                </dl>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
