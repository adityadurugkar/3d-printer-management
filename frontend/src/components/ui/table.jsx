import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-border/50', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-border/30 transition-all duration-150 hover:bg-muted/40 data-[state=selected]:bg-muted/60',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider bg-muted/20',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-3.5 align-middle text-foreground/90', className)} {...props} />
))
TableCell.displayName = 'TableCell'

const SortableHead = forwardRef(({ column, sortColumn, sortDirection, onSort, children, className, ...props }, ref) => {
  const isActive = sortColumn === column
  const Icon = isActive
    ? sortDirection === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown

  return (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider bg-muted/20 cursor-pointer select-none hover:text-foreground/70 transition-colors',
        isActive ? 'text-foreground/90' : 'text-muted-foreground/80',
        className
      )}
      onClick={() => onSort(column)}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        <Icon className={cn('h-3.5 w-3.5 flex-shrink-0 transition-opacity', isActive ? 'opacity-100' : 'opacity-30 group-hover:opacity-70')} />
      </div>
    </th>
  )
})
SortableHead.displayName = 'SortableHead'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SortableHead }
