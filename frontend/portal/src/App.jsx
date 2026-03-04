import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/SignUp';
import EmployerDashboard from './pages/Employer/EmployerDashboard';
import ManageJobs from './pages/Employer/ManageJobs';
import ApplicationViewer from './pages/Employer/ApplicationViewer';
import EmployerProfilePage from './pages/Employer/EmployerProfile';
import ProtectedRoute from './routes/ProtectedRoute';
import JobDetails from './pages/JobSeeker/JobDetails';
import SavedJobs from './pages/JobSeeker/SavedJobs';
import UserProfile from './pages/JobSeeker/UserProfile';
import JobSeekerDashboard from './pages/JobSeeker/JobSeekerDashboard';
import JobPostingForm from './pages/Employer/JobPostingForm';
import Events from './pages/Events/Events';
import EventDetails from './pages/Events/EventDetails';
import Search from './pages/Search/Search';
import CompanyProfile from './pages/Employer/CompanyProfile';
import PublicUserProfile from './pages/JobSeeker/PublicUserProfile';
import Settings from './pages/Settings/Settings';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/search" element={<Search />} />

        {/* Job Seeker Routes */}
        <Route path="/dashboard" element={<JobSeekerDashboard />} />
        <Route path="/job/:jobId" element={<JobDetails />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/company/:id" element={<CompanyProfile />} />
        <Route path="/user/:id" element={<PublicUserProfile />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute requiredRole="Employer" />}>
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/post-job" element={<JobPostingForm />} />
          <Route path="/manage-jobs" element={<ManageJobs />} />
          <Route path="/applicants" element={<ApplicationViewer />} />
          <Route path="/company-profile" element={<EmployerProfilePage />} />
        </Route>

        <Route path="/settings" element={<Settings />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        toastOptions={{
          style: { fontSize: "13px" },
        }}
      />
    </div>
  )
}

export default App;

