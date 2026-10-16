import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";
import api from "../api/api";

interface Transaction {
  id: number;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  created_at: string;
  category: string | null;
}

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface TransactionForm {
  category_id: string;
  amount: string;
  type: "income" | "expense";
  description: string;
  transaction_date: string;
}

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const emptyForm: TransactionForm = {
  category_id: "",
  amount: "",
  type: "expense",
  description: "",
  transaction_date: getToday(),
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TransactionForm>(emptyForm);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionResponse, categoryResponse] =
        await Promise.all([
          api.get("/transactions"),
          api.get("/categories"),
        ]);

      setTransactions(
        transactionResponse.data.transactions || []
      );

      setCategories(
        categoryResponse.data.categories || []
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === form.type
    );
  }, [categories, form.type]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        (transaction.description || "")
          .toLowerCase()
          .includes(searchText) ||
        (transaction.category || "")
          .toLowerCase()
          .includes(searchText);

      const matchesType =
        !filterType ||
        transaction.type === filterType;

      const matchesCategory =
        !filterCategory ||
        transaction.category === filterCategory;

      const transactionDateOnly =
        transaction.transaction_date
          ? transaction.transaction_date.substring(0, 10)
          : "";

      const matchesDate =
        !filterDate ||
        transactionDateOnly === filterDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [
    transactions,
    search,
    filterType,
    filterCategory,
    filterDate,
  ]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setError("");
    setSuccess("");
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (transaction: Transaction) => {
    const category = categories.find(
      (item) => item.name === transaction.category
    );

    setError("");
    setSuccess("");

    setEditingId(transaction.id);

    setForm({
      category_id: category
        ? String(category.id)
        : "",
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description || "",
      transaction_date:
        transaction.transaction_date.substring(0, 10),
    });

    setShowForm(true);
  };

  const handleTypeChange = (
    type: "income" | "expense"
  ) => {
    setForm((previous) => ({
      ...previous,
      type,
      category_id: "",
    }));
  };

  const validateForm = () => {
    const amount = Number(form.amount);

    if (!form.category_id) {
      setError("Please select a category.");
      return false;
    }

    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError("Please enter an amount greater than 0.");
      return false;
    }

    if (!form.transaction_date) {
      setError("Please select a transaction date.");
      return false;
    }

    if (form.description.trim().length > 200) {
      setError(
        "Description cannot be longer than 200 characters."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        type: form.type,
        description: form.description.trim(),
        transaction_date: form.transaction_date,
      };

      if (editingId) {
        const response = await api.put(
          `/transactions/${editingId}`,
          payload
        );

        setSuccess(
          response.data.message ||
            "Transaction updated successfully."
        );
      } else {
        const response = await api.post(
          "/transactions",
          payload
        );

        setSuccess(
          response.data.message ||
            "Transaction created successfully."
        );
      }

      resetForm();
      await fetchData();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to save transaction."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/transactions/${id}`);

      setSuccess("Transaction deleted successfully.");

      await fetchData();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to delete transaction."
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterCategory("");
    setFilterDate("");
  };

  const formatAmount = (amount: number) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    const dateOnly = date.substring(0, 10);
    const [year, month, day] = dateOnly.split("-");

    return `${day}/${month}/${year}`;
  };

  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpense = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const hasFilters =
    search ||
    filterType ||
    filterCategory ||
    filterDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transactions
            </h1>

            <p className="text-gray-500 mt-1">
              Manage and track your income and expenses.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus size={19} />
            Add Transaction
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Enter the transaction details below.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange("income")
                    }
                    className={`py-3 rounded-xl border font-semibold transition ${
                      form.type === "income"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Income
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange("expense")
                    }
                    className={`py-3 rounded-xl border font-semibold transition ${
                      form.type === "expense"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select category
                  </option>

                  {availableCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>

                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Transaction Date
                </label>

                <input
                  id="transactionDate"
                  type="date"
                  value={form.transaction_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      transaction_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  rows={3}
                  maxLength={200}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter a short description..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.description.length}/200
                </p>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formLoading
                    ? "Saving..."
                    : editingId
                    ? "Update Transaction"
                    : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Showing Transactions
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-2">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ArrowUpCircle
                size={19}
                className="text-green-600"
              />

              <p className="text-sm text-gray-500">
                Income
              </p>
            </div>

            <p className="text-2xl font-bold text-green-600 mt-2">
              ₹{formatAmount(totalIncome)}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ArrowDownCircle
                size={19}
                className="text-red-600"
              />

              <p className="text-sm text-gray-500">
                Expenses
              </p>
            </div>

            <p className="text-2xl font-bold text-red-600 mt-2">
              ₹{formatAmount(totalExpense)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />

            <h2 className="font-bold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search description or category..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Type */}
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
              className="px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category */}
            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value)
              }
              className="px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(e.target.value)
              }
              className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
              >
                <RefreshCw size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">
              Transaction History
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                <p className="text-gray-500 mt-4">
                  Loading transactions...
                </p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <Search
                  size={24}
                  className="text-gray-400"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mt-4">
                No transactions found
              </h3>

              <p className="text-gray-500 mt-2">
                {hasFilters
                  ? "Try changing or clearing your filters."
                  : "Add your first transaction to get started."}
              </p>

              {!hasFilters && (
                <button
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  <Plus size={18} />
                  Add Transaction
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.map(
                      (transaction) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">
                              {transaction.description ||
                                "No description"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {transaction.category ||
                              "Uncategorized"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                transaction.type ===
                                "income"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {transaction.type ===
                              "income"
                                ? "Income"
                                : "Expense"}
                            </span>
                          </td>

                          <td
                            className={`px-5 py-4 text-right font-bold ${
                              transaction.type ===
                              "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type ===
                            "income"
                              ? "+"
                              : "-"}
                            ₹
                            {formatAmount(
                              Number(transaction.amount)
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openEditForm(
                                    transaction
                                  )
                                }
                                title="Edit transaction"
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    transaction.id
                                  )
                                }
                                title="Delete transaction"
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredTransactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="p-5"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.description ||
                              "No description"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {transaction.category ||
                              "Uncategorized"}{" "}
                            •{" "}
                            {formatDate(
                              transaction.transaction_date
                            )}
                          </p>
                        </div>

                        <p
                          className={`font-bold whitespace-nowrap ${
                            transaction.type ===
                            "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}
                          ₹
                          {formatAmount(
                            Number(transaction.amount)
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type ===
                            "income"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.type ===
                          "income"
                            ? "Income"
                            : "Expense"}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEditForm(
                                transaction
                              )
                            }
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                transaction.id
                              )
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
