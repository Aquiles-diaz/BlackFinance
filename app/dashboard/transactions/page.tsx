'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationDialog } from '@/components/common/delete-confirmation-dialog'
import { useTransactionsStore } from '@/store/use-transactions-store'
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_LABELS } from '@/types'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function TransactionsPage() {
    const transactions = useTransactionsStore((state) => state.transactions)
    const addTransaction = useTransactionsStore((state) => state.addTransaction)
    const updateTransaction = useTransactionsStore((state) => state.updateTransaction)
    const deleteTransaction = useTransactionsStore((state) => state.deleteTransaction)

    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: '',
        date: formatDateInput(new Date()),
        note: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const data = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            category: formData.category as Transaction['category'],
            date: formData.date,
            note: formData.note,
        }

        if (editingId) {
            updateTransaction(editingId, data)
        } else {
            addTransaction(data)
        }

        setIsOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            type: 'expense',
            amount: '',
            category: '',
            date: formatDateInput(new Date()),
            note: '',
        })
        setEditingId(null)
    }

    const handleEdit = (transaction: Transaction) => {
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            category: transaction.category,
            date: transaction.date,
            note: transaction.note,
        })
        setEditingId(transaction.id)
        setIsOpen(true)
    }

    const handleDelete = () => {
        if (deleteId) {
            deleteTransaction(deleteId)
            setDeleteId(null)
        }
    }

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Transacciones</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona tus ingresos y gastos
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Transacción
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: 'income' | 'expense') =>
                                        setFormData({ ...formData, type: value, category: '' })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Ingreso</SelectItem>
                                        <SelectItem value="expense">Gasto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {CATEGORY_LABELS[cat]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nota (opcional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Descripción..."
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingId ? 'Actualizar' : 'Crear'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Transactions List */}
            <Card className="overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border/50 bg-secondary/20">
                            <tr>
                                <th className="text-left p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Fecha</th>
                                <th className="text-left p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Tipo</th>
                                <th className="text-left p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Categoría</th>
                                <th className="text-left p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Nota</th>
                                <th className="text-right p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Monto</th>
                                <th className="text-right p-6 font-semibold text-muted-foreground font-mono text-xs uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {sortedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-muted-foreground">
                                        No hay transacciones registradas
                                    </td>
                                </tr>
                            ) : (
                                sortedTransactions.map((transaction, index) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-secondary/30 transition-colors group"
                                    >
                                        <td className="p-6 text-sm font-medium">{formatDate(transaction.date)}</td>
                                        <td className="p-6">
                                            <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'} className="px-3 py-1">
                                                {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-sm">{CATEGORY_LABELS[transaction.category]}</td>
                                        <td className="p-6 text-sm text-muted-foreground">
                                            {transaction.note || '-'}
                                        </td>
                                        <td className="p-6 text-right font-mono font-semibold text-base">
                                            <span className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}>
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(transaction)}
                                                    className="hover:bg-primary/20 hover:text-primary"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(transaction.id)}
                                                    className="hover:bg-destructive/20 hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="¿Eliminar transacción?"
                description="Esta acción no se puede deshacer. Se eliminará permanentemente esta transacción."
                itemName={
                    deleteId
                        ? `${formatCurrency(transactions.find(t => t.id === deleteId)?.amount || 0)} - ${CATEGORY_LABELS[transactions.find(t => t.id === deleteId)?.category || 'food']
                        }`
                        : ''
                }
            />
        </div>
    )
}
