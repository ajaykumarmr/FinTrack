import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  const getNavClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) => {
    return `font-medium transition ${
      isActive
        ? "text-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-16 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-blue-600 shrink-0"
          >
            FinTrack
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-7">

            <NavLink
              to="/dashboard"
              className={getNavClass}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/transactions"
              className={getNavClass}
            >
              Transactions
            </NavLink>

            <NavLink
              to="/budgets"
              className={getNavClass}
            >
              Budgets
            </NavLink>

          </div>

          {/* USER + LOGOUT */}
          <div className="flex items-center gap-3">

            {user && (
              <span className="hidden sm:block text-sm text-gray-600">
                Hi,{" "}
                <span className="font-semibold text-gray-800">
                  {user.name}
                </span>
              </span>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
            >
              Logout
            </button>

          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="md:hidden flex items-center gap-5 pb-3 overflow-x-auto">

          <NavLink
            to="/dashboard"
            className={getNavClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/transactions"
            className={getNavClass}
          >
            Transactions
          </NavLink>

          <NavLink
            to="/budgets"
            className={getNavClass}
          >
            Budgets
          </NavLink>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;