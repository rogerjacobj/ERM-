import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Mission from './pages/Mission'
import Blog from './pages/Blog'
import Home from './pages/Home'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import HrDashboard from './pages/HrDashboard'
import Events from './pages/Events'
import Attendance from './pages/Attendance'
import JobProgress from './pages/JobProgress'

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/job-progress" element={<JobProgress />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/hr-dashboard" element={<HrDashboard />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> */} 
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App