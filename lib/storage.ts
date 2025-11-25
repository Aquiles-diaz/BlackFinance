// LocalStorage wrapper with type safety and error handling

export class Storage {
    static get<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error)
            return defaultValue
        }
    }

    static set<T>(key: string, value: T): void {
        if (typeof window === 'undefined') return

        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error)
        }
    }

    static remove(key: string): void {
        if (typeof window === 'undefined') return

        try {
            window.localStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing from localStorage key "${key}":`, error)
        }
    }

    static clear(): void {
        if (typeof window === 'undefined') return

        try {
            window.localStorage.clear()
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    }
}

// Storage keys
export const STORAGE_KEYS = {
    TRANSACTIONS: 'blackfinance_transactions',
    BUDGETS: 'blackfinance_budgets',
    SAVINGS: 'blackfinance_savings',
    DEBTS: 'blackfinance_debts',
    HOLIDAY: 'blackfinance_holiday',
    AGUINALDO: 'blackfinance_aguinaldo',
} as const
