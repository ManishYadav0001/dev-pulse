import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import Signup from "./pages/signup"
import ManagerDashboard from "./pages/managerDashboard"

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
         <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ManagerDashboard />} />
      </Routes>
    </div>
  )
}

export default App