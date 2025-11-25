'use client'

import { create } from 'zustand'
import { SavingsGoal } from '@/types'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

interface SavingsState {
    goals: SavingsGoal[]
    isLoading: boolean

    // Actions
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateGoal: (id: string, updates: Partial<SavingsGoal>) => void
    deleteGoal: (id: string) => void
    addToGoal: (id: string, amount: number) => void
    getGoalById: (id: string) => SavingsGoal | undefined
    loadGoals: () => void
    clearAll: () => void
}

export const useSavingsStore = create<SavingsState>()((set, get) => ({
    goals: [],
    isLoading: true,

    addGoal: (data) => {
        const newGoal: SavingsGoal = {
            ...data,
            id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => {
            const updated = [...state.goals, newGoal]
            Storage.set(STORAGE_KEYS.SAVINGS, updated)
            return { goals: updated }
        })
    },

    updateGoal: (id, updates) => {
        set((state) => {
            const updated = state.goals.map((g) =>
                g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
            )
            Storage.set(STORAGE_KEYS.SAVINGS, updated)
            return { goals: updated }
        })
    },

    deleteGoal: (id) => {
        set((state) => {
            const updated = state.goals.filter((g) => g.id !== id)
            Storage.set(STORAGE_KEYS.SAVINGS, updated)
            return { goals: updated }
        })
    },

    addToGoal: (id, amount) => {
        set((state) => {
            const updated = state.goals.map((g) =>
                g.id === id
                    ? {
                        ...g,
                        currentAmount: g.currentAmount + amount,
                        updatedAt: new Date().toISOString(),
                    }
                    : g
            )
            Storage.set(STORAGE_KEYS.SAVINGS, updated)
            return { goals: updated }
        })
    },

    getGoalById: (id) => {
        return get().goals.find((g) => g.id === id)
    },

    loadGoals: () => {
        const stored = Storage.get<SavingsGoal[]>(STORAGE_KEYS.SAVINGS, [])
        set({ goals: stored, isLoading: false })
    },

    clearAll: () => {
        Storage.remove(STORAGE_KEYS.SAVINGS)
        set({ goals: [] })
    },
}))
