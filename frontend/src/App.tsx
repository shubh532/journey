import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import PlanJourneyPage from './pages/PlanJourneyPage'
import GenerationPage from './pages/GenerationPage'
import JourneyOverviewPage from './pages/JourneyOverviewPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/plan" element={<PlanJourneyPage />} />
        <Route path="/plan/generating" element={<GenerationPage />} />
        <Route path="/journey/preview" element={<JourneyOverviewPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
