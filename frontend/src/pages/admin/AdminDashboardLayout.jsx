import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  FolderGit2,
  AlertTriangle,
  Activity,
  BarChart3,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  TrendingUp
} from "lucide-react";

function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard/overview",
      name: "Overview",
      icon: LayoutDashboard,
      description: "Team overview"
    },
    {
      path: "/admin/dashboard/team-insights",
      name: "Team Insights",
      icon: TrendingUp,
      description: "Analytics & insights"
    },
    {
      path: "/admin/dashboard/developers",
      name: "Developers",
      icon: Users,
      description: "Team member management"
    },
    {
      path: "/admin/dashboard/repositories",
      name: "Repositories",
      icon: FolderGit2,
      description: "Repo monitoring"
    },
    {
      path: "/admin/dashboard/alerts",
      name: "Alerts",
      icon: AlertTriangle,
      description: "System alerts & issues"
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1220] border-r border-slate-800
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:h-screen
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">Team Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Main Menu
              </h3>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mb-1
                      ${isActive
                        ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-6 mt-6">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                System
              </h3>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all mb-1"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-800 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 px-3">
              <div className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></div>
              <div className="text-xs text-slate-400 min-w-0">
                <div className="font-medium text-slate-300 truncate">System Online</div>
                <div className="truncate">All services operational</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0b1220] border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {menuItems.find(item => isActivePath(item.path))?.name || "Admin Dashboard"}
                </h2>
                <p className="text-xs text-slate-400 truncate">
                  {menuItems.find(item => isActivePath(item.path))?.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 flex-shrink-0">
              <BarChart3 className="h-4 w-4" />
              <span>Live</span>
            </div>
            
            <div className="h-8 w-px bg-slate-700 flex-shrink-0"></div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-slate-400">Manager</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#020617]">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
