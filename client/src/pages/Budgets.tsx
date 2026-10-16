import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import api from "../api/api";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  category: string | null;
  spent: number;
}

interface BudgetForm {
  category_id: string;
  amount: string;
  month: string;
  year: string;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentDate = new Date();

const emptyForm: BudgetForm = {
  category_id: "",
  amount: "",
  month: String(currentDate.getMonth() + 1),
  year: String(currentDate.getFullYear()),
};

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<BudgetForm>(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==============================
  // FETCH DATA
  // ==============================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, categoryResponse] =
        await Promise.all([
          api.get("/budgets"),
          api.get("/categories"),
        ]);

      setBudgets(budgetResponse.data.budgets || []);
      setCategories(categoryResponse.data.categories || []);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load budgets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==============================
  // EXPENSE CATEGORIES
  // ==============================

  const expenseCategories = useMemo(() => {
    return categories.filter(
      (category) => category.type === "expense"
    );
  }, [categories]);

  // ==============================
  // RESET FORM
  // ==============================

  const resetForm = () => {
    setForm({
      ...emptyForm,
      month: String(currentDate.getMonth() + 1),
      year: String(currentDate.getFullYear()),
    });

    setEditingId(null);
    setShowForm(false);
  };

  // ==============================
  // ADD BUDGET
  // ==============================

  const openAddForm = () => {
    setError("");
    setSuccess("");

    setForm({
      ...emptyForm,
      month: String(currentDate.getMonth() + 1),
      year: String(currentDate.getFullYear()),
    });

    setEditingId(null);
    setShowForm(true);
  };

  // ==============================
  // EDIT BUDGET
  // ==============================

  const openEditForm = (budget: Budget) => {
    const category = categories.find(
      (item) => item.name === budget.category
    );

    setError("");
    setSuccess("");

    setEditingId(budget.id);

    setForm({
      category_id: category
        ? String(category.id)
        : "",
      amount: String(budget.amount),
      month: String(budget.month),
      year: String(budget.year),
    });

    setShowForm(true);
  };

  // ==============================
  // VALIDATION
  // ==============================

  const validateForm = () => {
    const amount = Number(form.amount);
    const month = Number(form.month);
    const year = Number(form.year);

    if (!form.category_id) {
      setError("Please select a category.");
      return false;
    }

    if (
      !form.amount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setError(
        "Budget amount must be greater than ₹0."
      );
      return false;
    }

    if (month < 1 || month > 12) {
      setError("Please select a valid month.");
      return false;
    }

    if (!year || year < 2020 || year > 2100) {
      setError("Please enter a valid year.");
      return false;
    }

    return true;
  };

  // ==============================
  // CREATE / UPDATE
  // ==============================

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
        month: Number(form.month),
        year: Number(form.year),
      };

      if (editingId !== null) {
        const response = await api.put(
          `/budgets/${editingId}`,
          payload
        );

        setSuccess(
          response.data.message ||
            "Budget updated successfully."
        );
      } else {
        const response = await api.post(
          "/budgets",
          payload
        );

        setSuccess(
          response.data.message ||
            "Budget created successfully."
        );
      }

      resetForm();
      await fetchData();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to save budget."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/budgets/${id}`);

      setSuccess("Budget deleted successfully.");

      await fetchData();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to delete budget."
      );
    }
  };

  // ==============================
  // FORMAT AMOUNT
  // ==============================

  const formatAmount = (amount: number) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ==============================
  // PROGRESS
  // ==============================

  const getProgressWidth = (
    spent: number,
    budget: number
  ) => {
    if (budget <= 0) {
      return "0%";
    }

    return `${Math.min(
      (spent / budget) * 100,
      100
    )}%`;
  };

  // ==============================
  // BUDGET STATUS
  // ==============================

  const getBudgetStatus = (
    spent: number,
    budget: number
  ) => {
    const percentage =
      budget > 0
        ? (spent / budget) * 100
        : 0;

    if (percentage > 100) {
      return {
        label: "Over Budget",
        className:
          "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    }

    if (percentage >= 80) {
      return {
        label: "Almost Reached",
        className:
          "bg-yellow-100 text-yellow-700",
        icon: AlertTriangle,
      };
    }

    return {
      label: "On Track",
      className:
        "bg-green-100 text-green-700",
      icon: CheckCircle,
    };
  };

  // ==============================
  // SUMMARY
  // ==============================

  const totalBudget = budgets.reduce(
    (total, budget) =>
      total + Number(budget.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (total, budget) =>
      total + Number(budget.spent || 0),
    0
  );

  // IMPORTANT:
  // Keep the real negative value so that
  // exceeded budgets can be displayed.
  const totalRemaining =
    totalBudget - totalSpent;

  // ==============================
  // UI
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Budgets
            </h1>

            <p className="text-gray-500 mt-1">
              Set spending limits and monitor your expenses.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus size={19} />
            Add Budget
          </button>
        </div>

        {/* ERROR */}
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

        {/* SUCCESS */}
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

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* TOTAL BUDGET */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Wallet
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Budget
                </p>

                <p className="text-xl font-bold text-gray-900">
                  ₹{formatAmount(totalBudget)}
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL SPENT */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Spent
            </p>

            <p className="text-xl font-bold text-red-600 mt-2">
              ₹{formatAmount(totalSpent)}
            </p>
          </div>

          {/* REMAINING */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              {totalRemaining >= 0
                ? "Remaining"
                : "Exceeded"}
            </p>

            <p
              className={`text-xl font-bold mt-2 ${
                totalRemaining >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {totalRemaining >= 0
                ? "₹"
                : "-₹"}

              {formatAmount(
                Math.abs(totalRemaining)
              )}
            </p>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId !== null
                    ? "Edit Budget"
                    : "Create Budget"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Set a spending limit for an expense category.
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

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="budgetCategory"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Expense Category
                </label>

                <select
                  id="budgetCategory"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select category
                  </option>

                  {expenseCategories.map(
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

              {/* AMOUNT */}
              <div>
                <label
                  htmlFor="budgetAmount"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Budget Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>

                  <input
                    id="budgetAmount"
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

              {/* MONTH */}
              <div>
                <label
                  htmlFor="budgetMonth"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Month
                </label>

                <select
                  id="budgetMonth"
                  value={form.month}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      month: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {monthNames.map(
                    (month, index) => (
                      <option
                        key={month}
                        value={index + 1}
                      >
                        {month}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* YEAR */}
              <div>
                <label
                  htmlFor="budgetYear"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Year
                </label>

                <input
                  id="budgetYear"
                  type="number"
                  min="2020"
                  max="2100"
                  value={form.year}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      year: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* BUTTONS */}
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
                    : editingId !== null
                    ? "Update Budget"
                    : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BUDGET LIST */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">
              Your Budgets
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Monitor your category spending limits.
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">

                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                <p className="text-gray-500 mt-4">
                  Loading budgets...
                </p>
              </div>
            </div>

          ) : budgets.length === 0 ? (

            /* EMPTY */
            <div className="py-16 px-6 text-center">

              <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <Wallet
                  size={25}
                  className="text-gray-400"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mt-4">
                No budgets yet
              </h3>

              <p className="text-gray-500 mt-2">
                Create your first budget to start tracking
                spending.
              </p>

              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                <Plus size={18} />
                Create Budget
              </button>
            </div>

          ) : (

            /* BUDGET CARDS */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">

              {budgets.map((budget) => {
                const spent = Number(
                  budget.spent || 0
                );

                const budgetAmount = Number(
                  budget.amount || 0
                );

                const percentage =
                  budgetAmount > 0
                    ? (spent / budgetAmount) * 100
                    : 0;

                const remaining =
                  budgetAmount - spent;

                const status =
                  getBudgetStatus(
                    spent,
                    budgetAmount
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <div
                    key={budget.id}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
                  >

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-gray-900">
                            {budget.category ||
                              "Uncategorized"}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon
                              size={13}
                            />

                            {status.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {
                            monthNames[
                              budget.month - 1
                            ]
                          }{" "}
                          {budget.year}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-1">

                        <button
                          onClick={() =>
                            openEditForm(
                              budget
                            )
                          }
                          title="Edit budget"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              budget.id
                            )
                          }
                          title="Delete budget"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    {/* AMOUNTS */}
                    <div className="grid grid-cols-2 gap-4 mt-6">

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Budget
                        </p>

                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ₹
                          {formatAmount(
                            budgetAmount
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Spent
                        </p>

                        <p className="text-lg font-bold text-red-600 mt-1">
                          ₹
                          {formatAmount(
                            spent
                          )}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-5">

                      <div className="flex justify-between text-sm mb-2">

                        <span className="text-gray-500">
                          Spending progress
                        </span>

                        <span className="font-semibold text-gray-700">
                          {percentage.toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage > 100
                              ? "bg-red-500"
                              : percentage >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width:
                              getProgressWidth(
                                spent,
                                budgetAmount
                              ),
                          }}
                        />
                      </div>
                    </div>

                    {/* BOTTOM */}
                    <div className="mt-4 flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        {remaining >= 0
                          ? "Remaining"
                          : "Exceeded by"}
                      </span>

                      <span
                        className={`font-bold ${
                          remaining >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹
                        {formatAmount(
                          Math.abs(
                            remaining
                          )
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
