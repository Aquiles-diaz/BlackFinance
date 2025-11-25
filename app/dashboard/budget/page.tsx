'use client'

import { useState } from 'react'
import { Plus, AlertTriangle, TrendingUp, TrendingDown, Wallet, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationDialog } from '@/components/common/delete-confirmation-dialog'
import { useBudgetStore } from '@/store/use-budget-store'
import { useTransactionsStore } from '@/store/use-transactions-store'
import { EXPENSE_CATEGORIES, CATEGORY_LABELS, Category, Budget } from '@/types'
import { getCurrentPeriod, formatCurrency } from '@/lib/utils'
import { calculateTotalByCategory, calculateBudgetUtilization } from '@/lib/calculations'
import { motion } from 'framer-motion'

export default function BudgetPage() {
    const budgets = useBudgetStore((state) => state.budgets)
    const addBudget = useBudgetStore((state) => state.addBudget)
    const updateBudget = useBudgetStore((state) => state.updateBudget)
    const deleteBudget = useBudgetStore((state) => state.deleteBudget)
    const transactions = useTransactionsStore((state) => state.transactions)

    const [isOpen, setIsOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        category: '',
        plannedAmount: '',
    })

    const { month, year } = getCurrentPeriod()
    const monthBudgets = budgets.filter((b) => b.month === month && b.year === year)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (editingBudget) {
            // Editar budget existente
            updateBudget(editingBudget.id, {
                plannedAmount: parseFloat(formData.plannedAmount),
            })
        } else {
            // Crear nuevo budget
            addBudget({
                category: formData.category as Category,
                plannedAmount: parseFloat(formData.plannedAmount),
                month,
                year,
            })
        }

        setIsOpen(false)
        setEditingBudget(null)
        setFormData({ category: '', plannedAmount: '' })
    }

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget)
        setFormData({
            category: budget.category,
            plannedAmount: budget.plannedAmount.toString(),
        })
        setIsOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            deleteBudget(deleteId)
            setDeleteId(null)
        }
    }

    const handleDialogClose = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEditingBudget(null)
            setFormData({ category: '', plannedAmount: '' })
        }
    }

    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.plannedAmount, 0)
    const totalSpent = monthBudgets.reduce((sum, b) => {
        return sum + calculateTotalByCategory(transactions, b.category, month, year)
    }, 0)
    const totalRemaining = totalBudget - totalSpent

    const budgetToDelete = budgets.find(b => b.id === deleteId)

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Presupuesto</h1>
                    <p className="text-base md:text-lg text-muted-foreground">Gestiona tu presupuesto mensual</p>
                </div>

                <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Presupuesto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                    disabled={!!editingBudget}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editingBudget && (
                                    <p className="text-xs text-muted-foreground">
                                        No puedes cambiar la categoría de un presupuesto existente
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Monto Planeado</Label>
                                <Input
                                    type="number"
                                    value={formData.plannedAmount}
                                    onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {editingBudget ? 'Actualizar' : 'Crear'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Budget Summary Cards */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-xl text-primary">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Presupuesto Total</p>
                            <p className="text-3xl font-bold">{formatCurrency(totalBudget)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-destructive/5 border-destructive/10 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-destructive/10 rounded-xl text-destructive">
                            <TrendingDown className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
                            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-success/5 border-success/10 shadow-sm sm:col-span-2 lg:col-span-1">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-success/10 rounded-xl text-success">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Disponible</p>
                            <p className="text-3xl font-bold">{formatCurrency(totalRemaining)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Budget Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {monthBudgets.map((budget, index) => {
                    const actualSpent = calculateTotalByCategory(transactions, budget.category, month, year)
                    const { percentage, remaining, overspent } = calculateBudgetUtilization(budget, actualSpent)

                    return (
                        <motion.div
                            key={budget.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`h-full transition-all hover:shadow-md ${overspent ? 'border-destructive/30 hover:border-destructive/50' : 'hover:border-primary/30'}`}>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl">{CATEGORY_LABELS[budget.category]}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Meta: {formatCurrency(budget.plannedAmount)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {overspent ? (
                                                <Badge variant="destructive" className="animate-pulse px-3 py-1">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Excedido
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 px-3 py-1">
                                                    En orden
                                                </Badge>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(budget.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-muted-foreground">Progreso</span>
                                            <span>{percentage.toFixed(0)}%</span>
                                        </div>
                                        <Progress
                                            value={Math.min(percentage, 100)}
                                            className={`h-3 rounded-full ${overspent ? 'bg-destructive/20' : 'bg-secondary'}`}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Gastado</p>
                                            <p className={`text-xl font-bold ${overspent ? 'text-destructive' : 'text-foreground'}`}>
                                                {formatCurrency(actualSpent)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                                                {overspent ? 'Exceso' : 'Restante'}
                                            </p>
                                            <p className={`text-xl font-bold ${overspent ? 'text-destructive' : 'text-success'}`}>
                                                {formatCurrency(Math.abs(remaining))}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}

                {/* Empty State */}
                {monthBudgets.length === 0 && (
                    <div className="col-span-full">
                        <Card className="border-dashed bg-card/50">
                            <CardContent className="p-16 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                                    <Wallet className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No hay presupuestos definidos</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Comienza creando un presupuesto para una categoría este mes y toma el control de tus finanzas.
                                </p>
                                <Button
                                    onClick={() => setIsOpen(true)}
                                    variant="outline"
                                    className="border-primary/20 hover:bg-primary/5"
                                >
                                    Crear primer presupuesto
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="¿Eliminar presupuesto?"
                description="Esta acción no se puede deshacer. Se eliminará permanentemente este presupuesto."
                itemName={budgetToDelete ? CATEGORY_LABELS[budgetToDelete.category] : ''}
            />
        </div>
    )
}