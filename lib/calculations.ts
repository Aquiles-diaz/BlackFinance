import { Transaction, Budget, SavingsGoal, Debt, Category } from '@/types'

// Calculate total by transaction type
export function calculateTotalByType(
    transactions: Transaction[],
    type: 'income' | 'expense',
    month?: number,
    year?: number
): number {
    return transactions
        .filter(t => {
            if (t.type !== type) return false
            if (month === undefined || year === undefined) return true

            const date = new Date(t.date)
            return date.getMonth() === month && date.getFullYear() === year
        })
        .reduce((sum, t) => sum + t.amount, 0)
}

// Calculate total by category
export function calculateTotalByCategory(
    transactions: Transaction[],
    category: Category,
    month?: number,
    year?: number
): number {
    return transactions
        .filter(t => {
            if (t.category !== category) return false
            if (month === undefined || year === undefined) return true

            const date = new Date(t.date)
            return date.getMonth() === month && date.getFullYear() === year
        })
        .reduce((sum, t) => sum + t.amount, 0)
}

// Calculate budget utilization percentage
export function calculateBudgetUtilization(
    budget: Budget,
    actualSpent: number
): {
    percentage: number
    remaining: number
    overspent: boolean
} {
    const percentage = budget.plannedAmount > 0
        ? (actualSpent / budget.plannedAmount) * 100
        : 0
    const remaining = budget.plannedAmount - actualSpent
    const overspent = actualSpent > budget.plannedAmount

    return { percentage, remaining, overspent }
}

// Calculate savings progress
export function calculateSavingsProgress(goal: SavingsGoal): {
    percentage: number
    remaining: number
    daysLeft: number
} {
    const percentage = goal.targetAmount > 0
        ? (goal.currentAmount / goal.targetAmount) * 100
        : 0
    const remaining = goal.targetAmount - goal.currentAmount
    const deadline = new Date(goal.deadline)
    const today = new Date()
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return { percentage, remaining, daysLeft }
}

// Calculate debt progress
export function calculateDebtProgress(debt: Debt): {
    percentage: number
    remaining: number
    monthsLeft: number
} {
    const percentage = debt.totalAmount > 0
        ? (debt.paidAmount / debt.totalAmount) * 100
        : 0
    const remaining = debt.totalAmount - debt.paidAmount

    // Calculate months left based on monthly payment
    const monthsLeft = debt.monthlyPayment > 0
        ? Math.ceil(remaining / debt.monthlyPayment)
        : 0

    return { percentage, remaining, monthsLeft }
}

// Group transactions by category
export function groupTransactionsByCategory(
    transactions: Transaction[],
    month?: number,
    year?: number
): { category: Category; total: number; count: number }[] {
    const filtered = transactions.filter(t => {
        if (month === undefined || year === undefined) return true
        const date = new Date(t.date)
        return date.getMonth() === month && date.getFullYear() === year
    })

    const grouped = filtered.reduce((acc, t) => {
        if (!acc[t.category]) {
            acc[t.category] = { total: 0, count: 0 }
        }
        acc[t.category].total += t.amount
        acc[t.category].count += 1
        return acc
    }, {} as Record<Category, { total: number; count: number }>)

    return Object.entries(grouped).map(([category, data]) => ({
        category: category as Category,
        total: data.total,
        count: data.count,
    }))
}

// Calculate monthly balance
export function calculateMonthlyBalance(
    transactions: Transaction[],
    month: number,
    year: number
): {
    income: number
    expenses: number
    balance: number
} {
    const income = calculateTotalByType(transactions, 'income', month, year)
    const expenses = calculateTotalByType(transactions, 'expense', month, year)
    const balance = income - expenses

    return { income, expenses, balance }
}

// Get transactions for time series (last N months)
export function getMonthlyTimeSeries(
    transactions: Transaction[],
    monthsCount: number = 6
): {
    month: string
    income: number
    expenses: number
}[] {
    const today = new Date()
    const result: { month: string; income: number; expenses: number }[] = []

    for (let i = monthsCount - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const month = date.getMonth()
        const year = date.getFullYear()
        const monthName = date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })

        const income = calculateTotalByType(transactions, 'income', month, year)
        const expenses = calculateTotalByType(transactions, 'expense', month, year)

        result.push({ month: monthName, income, expenses })
    }

    return result
}

// Calculate debt amortization schedule
export function calculateAmortizationSchedule(debt: Debt, periods: number = 12): {
    period: number
    payment: number
    principal: number
    interest: number
    balance: number
}[] {
    const remaining = debt.totalAmount - debt.paidAmount
    const monthlyRate = debt.interestRate / 100 / 12
    const schedule: {
        period: number
        payment: number
        principal: number
        interest: number
        balance: number
    }[] = []

    let balance = remaining

    for (let i = 1; i <= periods && balance > 0; i++) {
        const interest = balance * monthlyRate
        const principal = Math.min(debt.monthlyPayment - interest, balance)
        const payment = principal + interest
        balance -= principal

        schedule.push({
            period: i,
            payment,
            principal,
            interest,
            balance: Math.max(0, balance),
        })
    }

    return schedule
}
