'use client'

import { create } from 'zustand'
import { Transaction, TransactionType, Category } from '@/types'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

interface TransactionsState {
    transactions: Transaction[]
    isLoading: boolean

    // Actions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateTransaction: (id: string, updates: Partial<Transaction>) => void
    deleteTransaction: (id: string) => void
    getTransactionById: (id: string) => Transaction | undefined
    getTransactionsByType: (type: TransactionType) => Transaction[]
    getTransactionsByCategory: (category: Category) => Transaction[]
    getTransactionsByMonth: (month: number, year: number) => Transaction[]
    loadTransactions: () => void
    clearAll: () => void
}

export const useTransactionsStore = create<TransactionsState>()((set, get) => ({
    transactions: [],
    isLoading: true,

    addTransaction: (data) => {
        const newTransaction: Transaction = {
            ...data,
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => {
            const updated = [...state.transactions, newTransaction]
            Storage.set(STORAGE_KEYS.TRANSACTIONS, updated)
            return { transactions: updated }
        })
    },

    updateTransaction: (id, updates) => {
        set((state) => {
            const updated = state.transactions.map((t) =>
                t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
            )
            Storage.set(STORAGE_KEYS.TRANSACTIONS, updated)
            return { transactions: updated }
        })
    },

    deleteTransaction: (id) => {
        set((state) => {
            const updated = state.transactions.filter((t) => t.id !== id)
            Storage.set(STORAGE_KEYS.TRANSACTIONS, updated)
            return { transactions: updated }
        })
    },

    getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id)
    },

    getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type)
    },

    getTransactionsByCategory: (category) => {
        return get().transactions.filter((t) => t.category === category)
    },

    getTransactionsByMonth: (month, year) => {
        return get().transactions.filter((t) => {
            const date = new Date(t.date)
            return date.getMonth() === month && date.getFullYear() === year
        })
    },

    loadTransactions: () => {
        const stored = Storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])

        // Process recurring transactions
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let hasNewRecurring = false
        const newTransactions = [...stored]

        // Find all recurring transactions
        const recurringTemplates = stored.filter(t => t.isRecurring && t.recurringDay)

        recurringTemplates.forEach(template => {
            if (!template.recurringDay) return

            // Check if this recurring transaction already exists for current month
            const alreadyExists = stored.some(t =>
                t.note === template.note &&
                t.amount === template.amount &&
                t.type === template.type &&
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear &&
                t.id !== template.id // Don't count the template itself if it's in this month
            )

            // If it doesn't exist and we passed the day, create it
            if (!alreadyExists && now.getDate() >= template.recurringDay) {
                const newDate = new Date(currentYear, currentMonth, template.recurringDay)
                const newTxn: Transaction = {
                    ...template,
                    id: `txn_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    date: newDate.toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isRecurring: false, // The generated instance is not a template
                    recurringDay: undefined
                }
                newTransactions.push(newTxn)
                hasNewRecurring = true
            }
        })

        if (hasNewRecurring) {
            Storage.set(STORAGE_KEYS.TRANSACTIONS, newTransactions)
            set({ transactions: newTransactions, isLoading: false })
        } else {
            set({ transactions: stored, isLoading: false })
        }
    },

    clearAll: () => {
        Storage.remove(STORAGE_KEYS.TRANSACTIONS)
        set({ transactions: [] })
    },
}))
