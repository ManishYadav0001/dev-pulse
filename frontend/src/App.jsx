import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/login"
import Signup from "./pages/signup"
import ManagerDashboard from "./pages/managerDashboard"
import AdminUserAnalytics from "./pages/AdminUserAnalytics.jsx"
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx"
import Overview from "./pages/dashboard/Overview.jsx"
import Repos from "./pages/dashboard/Repos.jsx"
import TopContributors from "./pages/dashboard/TopContributors.jsx"
import { Navigate } from "react-router-dom"

function App() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="repos" element={<Repos />} />
          <Route path="contributors" element={<TopContributors />} />
        </Route>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/admin/user/:id" element={<AdminUserAnalytics />} />
         <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  )
}

export default App