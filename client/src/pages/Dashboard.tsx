import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../api/api";

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

interface CategoryData {
  category: string;
  amount: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface RecentTransaction {
  id: number;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  transaction_date: string;
  category: string | null;
}

interface Analytics {
  incomeExpense: IncomeExpenseData[];
  expensesByCategory: CategoryData[];
  monthly: MonthlyData[];
  recentTransactions: RecentTransaction[];
}

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });

  const [analytics, setAnalytics] = useState<Analytics>({
    incomeExpense: [],
    expensesByCategory: [],
    monthly: [],
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, analyticsResponse] =
        await Promise.all([
          api.get("/dashboard"),
          api.get("/dashboard/analytics"),
        ]);

      const summaryData =
        summaryResponse.data;

      const analyticsData =
        analyticsResponse.data;

      setSummary({
        totalIncome: Number(
          summaryData.totalIncome || 0
        ),
        totalExpenses: Number(
          summaryData.totalExpenses || 0
        ),
        balance: Number(
          summaryData.balance || 0
        ),
        transactionCount: Number(
          summaryData.transactionCount || 0
        ),
      });

      setAnalytics({
        incomeExpense:
          analyticsData.incomeExpense || [],
        expensesByCategory:
          analyticsData.expensesByCategory || [],
        monthly:
          analyticsData.monthly || [],
        recentTransactions:
          analyticsData.recentTransactions || [],
      });
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatAmount = (amount: number) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    const dateOnly = date.substring(0, 10);
    const [year, month, day] =
      dateOnly.split("-");

    return `${day}/${month}/${year}`;
  };

  const getUserName = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      return user?.name || "User";
    } catch {
      return "User";
    }
  };

  const pieData =
    analytics.expensesByCategory.map((item) => ({
      name: item.category,
      value: Number(item.amount),
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Financial Overview
            </p>

            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              Welcome back, {getUserName()} 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Here's a summary of your financial activity.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {/* Balance */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Balance
                </p>

                <p
                  className={`text-2xl font-bold mt-2 ${
                    summary.balance >= 0
                      ? "text-gray-900"
                      : "text-red-600"
                  }`}
                >
                  ₹
                  {formatAmount(
                    summary.balance
                  )}
                </p>
              </div>

              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Wallet
                  size={21}
                  className="text-blue-600"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Income minus expenses
            </p>
          </div>

          {/* Income */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Income
                </p>

                <p className="text-2xl font-bold text-green-600 mt-2">
                  ₹
                  {formatAmount(
                    summary.totalIncome
                  )}
                </p>
              </div>

              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp
                  size={21}
                  className="text-green-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-green-600 mt-4">
              <ArrowUpRight size={14} />
              Money received
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Expenses
                </p>

                <p className="text-2xl font-bold text-red-600 mt-2">
                  ₹
                  {formatAmount(
                    summary.totalExpenses
                  )}
                </p>
              </div>

              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown
                  size={21}
                  className="text-red-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-red-600 mt-4">
              <ArrowDownRight size={14} />
              Money spent
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Transactions
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {summary.transactionCount}
                </p>
              </div>

              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
                <RefreshCw
                  size={21}
                  className="text-purple-600"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Total recorded transactions
            </p>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm py-20 text-center">
            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-gray-500 mt-4">
              Loading dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Income Expense Trend */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Income vs Expenses
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Track how your income and expenses change over time.
                </p>
              </div>

              {analytics.incomeExpense.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  No chart data available yet.
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={
                        analytics.incomeExpense
                      }
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis dataKey="month" />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Two Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

              {/* Bar Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Monthly Overview
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Monthly income and expense comparison.
                  </p>
                </div>

                {analytics.monthly.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-gray-400">
                    No monthly data available.
                  </div>
                ) : (
                  <div className="w-full h-80">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={analytics.monthly}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#16a34a"
                          radius={[
                            5,
                            5,
                            0,
                            0,
                          ]}
                        />

                        <Bar
                          dataKey="expenses"
                          name="Expenses"
                          fill="#dc2626"
                          radius={[
                            5,
                            5,
                            0,
                            0,
                          ]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Expenses by Category
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    See where your money is being spent.
                  </p>
                </div>

                {pieData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-gray-400">
                    No expense data available.
                  </div>
                ) : (
                  <div className="w-full h-80">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                          label
                        >
                          {pieData.map(
                            (_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  [
                                    "#2563eb",
                                    "#16a34a",
                                    "#dc2626",
                                    "#9333ea",
                                    "#ea580c",
                                    "#0891b2",
                                  ][
                                    index %
                                      6
                                  ]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Transactions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Your latest financial activity.
                </p>
              </div>

              {analytics.recentTransactions.length ===
              0 ? (
                <div className="py-16 text-center px-6">
                  <Wallet
                    size={28}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="text-lg font-bold text-gray-900 mt-4">
                    No transactions yet
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Add a transaction to see it here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
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
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {analytics.recentTransactions.map(
                          (transaction) => (
                            <tr
                              key={transaction.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {formatDate(
                                  transaction.transaction_date
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="font-semibold text-gray-900">
                                  {transaction.description ||
                                    "No description"}
                                </span>
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
                                  Number(
                                    transaction.amount
                                  )
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {analytics.recentTransactions.map(
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
                                Number(
                                  transaction.amount
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;