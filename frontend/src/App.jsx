import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

// Existing pages
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Mission from './pages/Mission'
import Blog from './pages/Blog'
import Events from './pages/Events'
import JobProgress from './pages/JobProgress'

// New enterprise pages
import HrDashboardNew from './pages/HrDashboardNew'
import EmployeeDashboardNew from './pages/EmployeeDashboardNew'
import AttendanceNew from './pages/AttendanceNew'
import EmployeeProfile from './pages/EmployeeProfile'
import Notifications from './pages/Notifications'
import HrReports from './pages/HrReports'

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* HR routes */}
          <Route path="/hr-dashboard" element={<HrDashboardNew />} />
          <Route path="/hr-reports" element={<HrReports />} />

          {/* Employee routes */}
          <Route path="/employee-dashboard" element={<EmployeeDashboardNew />} />
          <Route path="/employee-profile" element={<EmployeeProfile />} />

          {/* Shared routes */}
          <Route path="/attendance" element={<AttendanceNew />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/job-progress" element={<JobProgress />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App