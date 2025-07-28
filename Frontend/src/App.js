import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import PersonalDetailsPage from "./pages/PersonalDetailsPage"
import DashboardPage from "./pages/DashboardPage"
import SymptomsPage from "./pages/SymptomsPage"
import PredictionPage from "./pages/PredictionPage"
import DisclaimerPage from "./pages/DisclaimerPage"
import ChatPage from "./pages/ChatPage"
import UploadPage from "./pages/UploadPage"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/details" element={<PersonalDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/symptoms" element={<SymptomsPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App