export type TransactionType = 'income' | 'expense'

export type Category =
    | 'salary' // Salario
    | 'freelance' // Freelance
    | 'investments' // Inversiones
    | 'other-income' // Otros ingresos
    | 'housing' // Vivienda
    | 'food' // Alimentación
    | 'transportation' // Transporte
    | 'utilities' // Servicios
    | 'entertainment' // Entretenimiento
    | 'health' // Salud
    | 'education' // Educación
    | 'shopping' // Compras
    | 'subscriptions' // Suscripciones
    | 'gifts' // Regalos
    | 'savings' // Ahorro
    | 'debts' // Deudas
    | 'other-expense' // Otros gastos

export interface Transaction {
    id: string
    type: TransactionType
    amount: number
    category: Category
    date: string
    note: string
    createdAt: string
    updatedAt: string
    isRecurring?: boolean
    recurringDay?: number
}

export interface Budget {
    id: string
    category: Category
    plannedAmount: number
    month: number
    year: number
    createdAt: string
    updatedAt: string
}

export interface SavingsGoal {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline: string
    color: string
    createdAt: string
    updatedAt: string
}

export interface Debt {
    id: string
    name: string
    totalAmount: number
    paidAmount: number
    interestRate: number
    monthlyPayment: number
    startDate: string
    endDate: string
    status: 'active' | 'paid' | 'overdue'
    createdAt: string
    updatedAt: string
}

export interface HolidayBudget {
    id: string
    name: string
    budgetAmount: number
    spentAmount: number
    items: HolidayItem[]
    year: number
    createdAt: string
    updatedAt: string
}

export interface HolidayItem {
    id: string
    name: string
    estimatedCost: number
    actualCost: number
    purchased: boolean
    category: string
}

export interface AguinaldoProjection {
    grossAmount: number
    taxRate: number
    netAmount: number
    expectedDate: string
    allocations: {
        savings: number
        debts: number
        shopping: number
        emergency: number
        other: number
    }
}

// Category labels and colors
export const CATEGORY_LABELS: Record<Category, string> = {
    salary: 'Salario',
    freelance: 'Freelance',
    investments: 'Inversiones',
    'other-income': 'Otros Ingresos',
    housing: 'Vivienda',
    food: 'Alimentación',
    transportation: 'Transporte',
    utilities: 'Servicios',
    entertainment: 'Entretenimiento',
    health: 'Salud',
    education: 'Educación',
    shopping: 'Compras',
    subscriptions: 'Suscripciones',
    gifts: 'Regalos',
    savings: 'Ahorro',
    debts: 'Deudas',
    'other-expense': 'Otros Gastos',
}

export const CATEGORY_COLORS: Record<Category, string> = {
    salary: '#10b981',
    freelance: '#3b82f6',
    investments: '#8b5cf6',
    'other-income': '#06b6d4',
    housing: '#ef4444',
    food: '#f59e0b',
    transportation: '#eab308',
    utilities: '#6366f1',
    entertainment: '#ec4899',
    health: '#14b8a6',
    education: '#8b5cf6',
    shopping: '#f97316',
    subscriptions: '#a855f7',
    gifts: '#f43f5e',
    savings: '#10b981',
    debts: '#dc2626',
    'other-expense': '#6b7280',
}

export const INCOME_CATEGORIES: Category[] = [
    'salary',
    'freelance',
    'investments',
    'other-income',
]

export const EXPENSE_CATEGORIES: Category[] = [
    'housing',
    'food',
    'transportation',
    'utilities',
    'entertainment',
    'health',
    'education',
    'shopping',
    'subscriptions',
    'gifts',
    'savings',
    'debts',
    'other-expense',
]
