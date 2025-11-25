'use client'

import { create } from 'zustand'
import { Budget, Category } from '@/types'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

interface BudgetState {
    budgets: Budget[]
    isLoading: boolean

    // Actions
    addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateBudget: (id: string, updates: Partial<Budget>) => void
    deleteBudget: (id: string) => void
    getBudgetByCategory: (category: Category, month: number, year: number) => Budget | undefined
    getBudgetsByMonth: (month: number, year: number) => Budget[]
    loadBudgets: () => void
    clearAll: () => void
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
    budgets: [],
    isLoading: true,

    addBudget: (data) => {
        const newBudget: Budget = {
            ...data,
            id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => {
            const updated = [...state.budgets, newBudget]
            Storage.set(STORAGE_KEYS.BUDGETS, updated)
            return { budgets: updated }
        })
    },

    updateBudget: (id, updates) => {
        set((state) => {
            const updated = state.budgets.map((b) =>
                b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
            )
            Storage.set(STORAGE_KEYS.BUDGETS, updated)
            return { budgets: updated }
        })
    },

    deleteBudget: (id) => {
        set((state) => {
            const updated = state.budgets.filter((b) => b.id !== id)
            Storage.set(STORAGE_KEYS.BUDGETS, updated)
            return { budgets: updated }
        })
    },

    getBudgetByCategory: (category, month, year) => {
        return get().budgets.find(
            (b) => b.category === category && b.month === month && b.year === year
        )
    },

    getBudgetsByMonth: (month, year) => {
        return get().budgets.filter((b) => b.month === month && b.year === year)
    },

    loadBudgets: () => {
        const stored = Storage.get<Budget[]>(STORAGE_KEYS.BUDGETS, [])
        set({ budgets: stored, isLoading: false })
    },

    clearAll: () => {
        Storage.remove(STORAGE_KEYS.BUDGETS)
        set({ budgets: [] })
    },
}))
