'use client'

import { create } from 'zustand'
import { HolidayBudget, HolidayItem, AguinaldoProjection } from '@/types'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

interface HolidayState {
    holidayBudgets: HolidayBudget[]
    aguinaldoProjection: AguinaldoProjection | null
    isLoading: boolean

    // Holiday Budget Actions
    addHolidayBudget: (budget: Omit<HolidayBudget, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateHolidayBudget: (id: string, updates: Partial<HolidayBudget>) => void
    deleteHolidayBudget: (id: string) => void
    addHolidayItem: (budgetId: string, item: Omit<HolidayItem, 'id'>) => void
    updateHolidayItem: (budgetId: string, itemId: string, updates: Partial<HolidayItem>) => void
    deleteHolidayItem: (budgetId: string, itemId: string) => void
    markItemPurchased: (budgetId: string, itemId: string, actualCost: number) => void

    // Aguinaldo Actions
    setAguinaldoProjection: (projection: AguinaldoProjection) => void
    updateAguinaldoAllocation: (allocationType: keyof AguinaldoProjection['allocations'], amount: number) => void

    // Loaders
    loadHolidayData: () => void
    clearAll: () => void
}

export const useHolidayStore = create<HolidayState>()((set) => ({
    holidayBudgets: [],
    aguinaldoProjection: null,
    isLoading: true,

    addHolidayBudget: (data: Omit<HolidayBudget, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newBudget: HolidayBudget = {
            ...data,
            id: `holiday_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => {
            const updated = [...state.holidayBudgets, newBudget]
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    updateHolidayBudget: (id, updates) => {
        set((state) => {
            const updated = state.holidayBudgets.map((b) =>
                b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
            )
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    deleteHolidayBudget: (id) => {
        set((state) => {
            const updated = state.holidayBudgets.filter((b) => b.id !== id)
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    addHolidayItem: (budgetId, itemData) => {
        set((state) => {
            const updated = state.holidayBudgets.map((b) => {
                if (b.id !== budgetId) return b

                const newItem: HolidayItem = {
                    ...itemData,
                    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                }

                return {
                    ...b,
                    items: [...b.items, newItem],
                    updatedAt: new Date().toISOString(),
                }
            })
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    updateHolidayItem: (budgetId, itemId, updates) => {
        set((state) => {
            const updated = state.holidayBudgets.map((b) => {
                if (b.id !== budgetId) return b

                return {
                    ...b,
                    items: b.items.map((item) =>
                        item.id === itemId ? { ...item, ...updates } : item
                    ),
                    updatedAt: new Date().toISOString(),
                }
            })
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    deleteHolidayItem: (budgetId, itemId) => {
        set((state) => {
            const updated = state.holidayBudgets.map((b) => {
                if (b.id !== budgetId) return b

                return {
                    ...b,
                    items: b.items.filter((item) => item.id !== itemId),
                    updatedAt: new Date().toISOString(),
                }
            })
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    markItemPurchased: (budgetId, itemId, actualCost) => {
        set((state) => {
            const updated = state.holidayBudgets.map((b) => {
                if (b.id !== budgetId) return b

                const updatedItems = b.items.map((item) =>
                    item.id === itemId
                        ? { ...item, purchased: true, actualCost }
                        : item
                )

                const newSpentAmount = updatedItems
                    .filter((item) => item.purchased)
                    .reduce((sum, item) => sum + item.actualCost, 0)

                return {
                    ...b,
                    items: updatedItems,
                    spentAmount: newSpentAmount,
                    updatedAt: new Date().toISOString(),
                }
            })
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: updated, aguinaldo: state.aguinaldoProjection })
            return { holidayBudgets: updated }
        })
    },

    setAguinaldoProjection: (projection) => {
        set((state) => {
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: state.holidayBudgets, aguinaldo: projection })
            return { aguinaldoProjection: projection }
        })
    },

    updateAguinaldoAllocation: (allocationType, amount) => {
        set((state) => {
            if (!state.aguinaldoProjection) return state

            const updated = {
                ...state.aguinaldoProjection,
                allocations: {
                    ...state.aguinaldoProjection.allocations,
                    [allocationType]: amount,
                },
            }
            Storage.set(STORAGE_KEYS.HOLIDAY, { budgets: state.holidayBudgets, aguinaldo: updated })
            return { aguinaldoProjection: updated }
        })
    },

    loadHolidayData: () => {
        const stored = Storage.get<{ budgets: HolidayBudget[]; aguinaldo: AguinaldoProjection | null }>(
            STORAGE_KEYS.HOLIDAY,
            { budgets: [], aguinaldo: null }
        )
        set({
            holidayBudgets: stored.budgets,
            aguinaldoProjection: stored.aguinaldo,
            isLoading: false,
        })
    },

    clearAll: () => {
        Storage.remove(STORAGE_KEYS.HOLIDAY)
        set({ holidayBudgets: [], aguinaldoProjection: null })
    },
}))
