"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { getAccounts, createAccount, updateAccount, deleteAccount } from "../utils/api"
import { Pencil, Trash2 } from "lucide-react"

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [editingAccount, setEditingAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data)
      } else {
        await createAccount(data)
      }
      reset()
      setEditingAccount(null)
      fetchAccounts()
    } catch (error) {
      console.error("Error saving account:", error)
    }
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setValue("name", account.name)
    setValue("type", account.type)
    setValue("balance", account.balance)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await deleteAccount(id)
        fetchAccounts()
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {editingAccount ? "Edit Account" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Name</label>
            <input
              type="text"
              {...register("name", { required: "Account name is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Type</label>
            <select
              {...register("type", { required: "Account type is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="savings">Savings</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Initial Balance</label>
            <input
              type="number"
              step="0.01"
              {...register("balance", { required: "Initial balance is required" })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
            />
            {errors.balance && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.balance.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            {editingAccount && (
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null)
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
              {editingAccount ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accounts List</h2>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No accounts found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#2D2D2D]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type: {account.type}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Balance: ${account.balance}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:text-notion-orange dark:hover:text-notion-orange-dark"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
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

export default Accounts

