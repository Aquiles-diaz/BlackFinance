'use client'

import { create } from 'zustand'
import { Debt } from '@/types'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

interface DebtsState {
    debts: Debt[]
    isLoading: boolean

    // Actions
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateDebt: (id: string, updates: Partial<Debt>) => void
    deleteDebt: (id: string) => void
    addPayment: (id: string, amount: number) => void
    getDebtById: (id: string) => Debt | undefined
    getActiveDebts: () => Debt[]
    loadDebts: () => void
    clearAll: () => void
}

export const useDebtsStore = create<DebtsState>()((set, get) => ({
    debts: [],
    isLoading: true,

    addDebt: (data) => {
        const newDebt: Debt = {
            ...data,
            id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => {
            const updated = [...state.debts, newDebt]
            Storage.set(STORAGE_KEYS.DEBTS, updated)
            return { debts: updated }
        })
    },

    updateDebt: (id, updates) => {
        set((state) => {
            const updated = state.debts.map((d) =>
                d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
            )
            Storage.set(STORAGE_KEYS.DEBTS, updated)
            return { debts: updated }
        })
    },

    deleteDebt: (id) => {
        set((state) => {
            const updated = state.debts.filter((d) => d.id !== id)
            Storage.set(STORAGE_KEYS.DEBTS, updated)
            return { debts: updated }
        })
    },

    addPayment: (id, amount) => {
        set((state) => {
            const updated = state.debts.map((d) => {
                if (d.id !== id) return d

                const newPaidAmount = d.paidAmount + amount
                const isPaid = newPaidAmount >= d.totalAmount

                return {
                    ...d,
                    paidAmount: newPaidAmount,
                    status: isPaid ? 'paid' as const : d.status,
                    updatedAt: new Date().toISOString(),
                }
            })
            Storage.set(STORAGE_KEYS.DEBTS, updated)
            return { debts: updated }
        })
    },

    getDebtById: (id) => {
        return get().debts.find((d) => d.id === id)
    },

    getActiveDebts: () => {
        return get().debts.filter((d) => d.status === 'active')
    },

    loadDebts: () => {
        const stored = Storage.get<Debt[]>(STORAGE_KEYS.DEBTS, [])
        set({ debts: stored, isLoading: false })
    },

    clearAll: () => {
        Storage.remove(STORAGE_KEYS.DEBTS)
        set({ debts: [] })
    },
}))
