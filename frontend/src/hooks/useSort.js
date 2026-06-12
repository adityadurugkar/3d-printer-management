import { useState, useCallback } from 'react'

export function useSort(config = {}) {
  const [sortColumn, setSortColumn] = useState(config.defaultColumn || null)
  const [sortDirection, setSortDirection] = useState(config.defaultDirection || null)

  const toggleSort = useCallback((column) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDirection('asc')
      return column
    })
  }, [])

  const getSortedData = useCallback((data) => {
    if (!sortColumn || !sortDirection || !data) return data
    return [...data].sort((a, b) => {
      if (config.comparators?.[sortColumn]) {
        const cmp = config.comparators[sortColumn](a, b)
        return sortDirection === 'asc' ? cmp : -cmp
      }

      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const aTime = Date.parse(aVal)
        const bTime = Date.parse(bVal)
        if (!isNaN(aTime) && !isNaN(bTime)) {
          return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
        }
        const cmp = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? cmp : -cmp
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return String(aVal).localeCompare(String(bVal)) * (sortDirection === 'asc' ? 1 : -1)
    })
  }, [sortColumn, sortDirection, config])

  return { sortColumn, sortDirection, toggleSort, getSortedData }
}
