"use client"

import React, { createContext, useContext, useState } from 'react'

interface TagFilterContextType {
  selectedTags: string[]
  handleTagSelect: (tag: string) => void
  clearTagFilters: () => void
}

const TagFilterContext = createContext<TagFilterContextType | undefined>(undefined)

export function TagFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearTagFilters = () => {
    setSelectedTags([])
  }

  return (
    <TagFilterContext.Provider value={{ selectedTags, handleTagSelect, clearTagFilters }}>
      {children}
    </TagFilterContext.Provider>
  )
}

export function useTagFilter() {
  const context = useContext(TagFilterContext)
  if (context === undefined) {
    throw new Error('useTagFilter must be used within a TagFilterProvider')
  }
  return context
}
