"use client"

import { useState, useMemo } from "react"

interface FilterOptions {
  searchTerm: string
  filters: Record<string, string>
}

export function useFilters<T>(items: T[], searchFields: (keyof T)[], filterFields: (keyof T)[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        searchFields.some((field) => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "all" || value === "") return true
        return String(item[key as keyof T]) === value
      })

      return matchesSearch && matchesFilters
    })
  }, [items, searchTerm, filters, searchFields])

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({})
  }

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredItems,
  }
}
