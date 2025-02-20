"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { getIncomes, createIncome, updateIncome, deleteIncome, getAccounts, getCategories } from "../utils/api"
import { Pencil, Trash2 } from "lucide-react"
import { formatNumber, unformatNumber, formatNumberWithCurrency } from "../utils/numberFormat"

const Incomes = () => {
  const [incomes, setIncomes] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [editingIncome, setEditingIncome] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSelectedAccountPublic, setIsSelectedAccountPublic] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchIncomes()
    fetchCategories()
    fetchAccounts()
  }, [])

  const fetchIncomes = async () => {
    try {
      const response = await getIncomes()
      setIncomes(response.data)
    } catch (error) {
      console.error("Error fetching incomes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data.map((account) => ({ ...account, isPublic: account.public })))
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleSourceAccountChange = (event) => {
    const selectedAccountId = event.target.value
    const selectedAccount = accounts.find((account) => account.id === Number.parseInt(selectedAccountId))
    setIsSelectedAccountPublic(selectedAccount ? selectedAccount.isPublic : false)
  }

  const onSubmit = async (data) => {
    const rawValue = unformatNumber(data.valor)
    const numericValue = Number(rawValue)

    const formattedData = {
      ...data,
      valor: numericValue,
      cuentaId: Number(data.cuentaId),
      categoriaId: Number(data.categoriaId),
      destinoId: data.destinoId ? Number(data.destinoId) : null,
      fecha: new Date(data.fecha + "T00:00:00.000Z").toISOString(),
    }
    
    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, formattedData)
      } else {
        await createIncome(formattedData)
      }
      reset()
      setEditingIncome(null)
      fetchIncomes()
    } catch (error) {
      console.error("Error saving income:", error)
    }
  }

  const handleEdit = (income) => {
    setEditingIncome(income)
    setValue("description", income.description)
    setValue("valor", income.valor.toString())
    setValue("categoriaId", income.categoriaId)
    setValue("cuentaId", income.cuentaId)
    setValue("destinoId", income.destinoId || "")
    setValue("fecha", income.fecha.split("T")[0])
    
    // Actualizar el estado de cuenta pública
    const selectedAccount = accounts.find((account) => account.id === income.cuentaId)
    setIsSelectedAccountPublic(selectedAccount ? selectedAccount.isPublic : false)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await deleteIncome(id)
        fetchIncomes()
      } catch (error) {
        console.error("Error deleting income:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {editingIncome ? "Edit Income" : "Create Income"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <input
              type="text"
              {...register("description", { required: "Description is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
            <Controller
              name="valor"
              control={control}
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    field.onChange(formatNumber(rawValue)); // Solo muestra los puntos, sin "COP"
                  }}
                  value={field.value}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
                />
              )}
            />
            {errors.valor && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
            <select
              {...register("categoriaId", { required: "Category is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoriaId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Source Account</label>
            <select
              {...register("cuentaId", { required: "Source account is required" })}
              onChange={(e) => {
                register("cuentaId").onChange(e)
                handleSourceAccountChange(e)
              }}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors.cuentaId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cuentaId.message}</p>
            )}
          </div>

          {isSelectedAccountPublic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Destination Account</label>
              <select
                {...register("destinoId", { required: "Destination account is required for public accounts" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              >
                <option value="">Select destination account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors.destinoId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.destinoId.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date</label>
            <input
              type="date"
              {...register("fecha", { required: "Date is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            />
            {errors.fecha && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            {editingIncome && (
              <button
                type="button"
                onClick={() => {
                  setEditingIncome(null)
                  reset()
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2D2D2D] hover:bg-gray-50 dark:hover:bg-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              {editingIncome ? "Update Income" : "Create Income"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Incomes List</h2>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading incomes...</p>
        ) : incomes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No incomes found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#2D2D2D]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{income.description}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category: {income.category?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Source Account: {income.accountInicio?.name}</p>
                    {income.accountDestino && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Destination Account: {income.accountDestino.name}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Amount: {formatNumberWithCurrency(income.valor.toString())}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date: {income.fecha.split('T')[0].split('-').reverse().join('/')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(income)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-notion-orange dark:hover:text-notion-orange-dark"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Incomes
