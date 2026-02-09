'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, TrendingUpIcon, TrendingDownIcon, Wallet, BarChart3, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string
}

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
const EXPENSE_CATEGORIES = ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other']

type ChartType = 'bar' | 'line'

export default function BudgetApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions()
  }, [fetchTransactions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.amount || !formData.category || !formData.date) {
      setError('Please fill in all required fields')
      return
    }

    const numericAmount = parseFloat(formData.amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount')
      return
    }

    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'

      const method = editingTransaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: numericAmount
        })
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingTransaction(null)
        resetForm()
        fetchTransactions()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save transaction' }))
        setError(errorData.error || 'Failed to save transaction')
      }
    } catch (err) {
      console.error('Error saving transaction:', err)
      setError('An error occurred while saving')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date.split('T')[0]
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTransactions()
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setError('')
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    resetForm()
  }

  // Format currency to Euro
  const formatEuro = (amount: number) => {
    return `€${amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}`
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Prepare chart data
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = t.date.substring(0, 7)
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 }
    }
    if (t.type === 'income') {
      acc[month].income += t.amount
    } else {
      acc[month].expenses += t.amount
    }
    return acc
  }, {})

  const chartData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-6)

  const chartConfig = {
    income: {
      label: 'Income',
      color: '#10b981'
    },
    expenses: {
      label: 'Expenses',
      color: '#ef4444'
    }
  }

  // Calendar view data
  const getTransactionsForDate = (date: string) => {
    return transactions.filter(t => t.date.split('T')[0] === date)
  }

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayTransactions = getTransactionsForDate(dateStr)
    const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
    return {
      date: dateStr,
      total,
      transactions: dayTransactions
    }
  }

  // Generate calendar days
  const getCalendarDays = () => {
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startDayOfWeek = firstDayOfMonth.getDay()

    const days = []
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: '', transactions: [], total: 0 })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i)
      days.push(getDayData(date))
    }
    return days
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-50">
            Personal Budget Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your income and expenses, visualize your finances in Euros
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Income
              </CardTitle>
              <TrendingUpIcon className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatEuro(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Expenses
              </CardTitle>
              <TrendingDownIcon className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {formatEuro(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Balance
              </CardTitle>
              <Wallet className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatEuro(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Income vs Expenses (Last 6 Months)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Bar
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Line
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
                        }}
                      />
                      <YAxis tickFormatter={(value) => `€${value}`} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`€${value.toLocaleString('en-EU', { minimumFractionDigits: 2 })}`, '']}
                        labelFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="income"
                        fill="#10b981"
                        name="Income"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expenses"
                        fill="#ef4444"
                        name="Expenses"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {chartType === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
                        }}
                      />
                      <YAxis tickFormatter={(value) => `€${value}`} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`€${value.toLocaleString('en-EU', { minimumFractionDigits: 2 })}`, '']}
                        labelFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Income"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Expenses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-slate-500">
                No data available. Add your first transaction to see the chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Your income and expense history</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTransaction(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTransaction
                        ? 'Update the transaction details below'
                        : 'Enter the details for your new transaction'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="type">Type *</Label>
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
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (€) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Add a note (optional)"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingTransaction ? 'Update' : 'Add'} Transaction
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'list' ? (
              // List View
              transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    No transactions yet
                  </p>
                  <p className="text-sm text-slate-500">
                    Click "Add Transaction" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                            {transaction.type === 'income' ? (
                              <TrendingUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <TrendingDownIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-50">
                              {transaction.category}
                            </div>
                            {transaction.description && (
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {transaction.description}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(transaction.date).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatEuro(transaction.amount)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction.id)}
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : (
              // Calendar View
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-slate-600 dark:text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayData, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg border min-h-[100px] ${
                        dayData.date
                          ? 'bg-white dark:bg-slate-800 hover:shadow-md cursor-pointer transition-all'
                          : 'bg-slate-50 dark:bg-slate-900/50'
                      }`}
                    >
                      {dayData.date ? (
                        <div className="h-full flex flex-col">
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {new Date(dayData.date).getDate()}
                          </div>
                          {dayData.transactions.length > 0 && (
                            <div className="mt-auto space-y-1">
                              {dayData.transactions.map(t => (
                                <div
                                  key={t.id}
                                  className={`text-xs p-1 rounded ${t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'}`}
                                >
                                  <div className="truncate">
                                    {t.category}
                                  </div>
                                  <div className="font-semibold">
                                    {formatEuro(t.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
