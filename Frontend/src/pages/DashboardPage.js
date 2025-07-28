"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "./DashboardPage.css"
import myIcon from "../assets/icons/logo.png"
import reminderAlertIcon from "../assets/icons/Remainder-icon.png"
import chatIcon from "../assets/icons/icons8-chat-32.png"
import healthQueriesIcon from "../assets/icons/icons8-heart-health-32.png"
import profileIcon from "../assets/icons/icons8-profile-32.png"
import stethoscopeIcon from "../assets/icons/icons8-stethoscope-32.png"
import reminderIcon from "../assets/icons/icons8-timesheet-32.png"
import uploadIcon from "../assets/icons/icons8-upload-32.png"
import healthStatsIcon from "../assets/icons/icons8-combo-chart-32.png"

const DashboardPage = () => {
    const [user, setUser] = useState(null)
    const [recentQueries, setRecentQueries] = useState([])
    const [upcomingReminders, setUpcomingReminders] = useState([])
    const [healthStats, setHealthStats] = useState({
        queries_resolved: 0,
        active_medications: 0,
        reminders_set: 0
    })

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/users/me", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (!response.ok) {
                    throw new Error("Failed to fetch user data")
                }
                const data = await response.json()
                setUser({
                    name: data.full_name || "User",
                    email: data.email,
                    age: data.age,
                    gender: data.gender,
                    height_cm: data.height_cm,
                    weight_kg: data.weight_kg,
                    blood_type: data.blood_type,
                })
            } catch (err) {
                console.error(err)
            }
        }

        const fetchRecentQueries = async () => {
            try {
                const response = await fetch("/predictions/user_queries", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (!response.ok) {
                    throw new Error("Failed to fetch recent queries")
                }
                const data = await response.json()
                console.log("Data:", data)
                setRecentQueries(data)
            } catch (err) {
                console.error(err)
            }
        }

        const fetchUpcomingReminders = async () => {
            try {
                const response = await fetch("/reminders/", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (!response.ok) {
                    throw new Error("Failed to fetch reminders")
                }
                const data = await response.json()
                // Transform reminders to expected frontend format
                const transformed = data.map(reminder => ({
                    id: reminder.id,
                    medication: reminder.drug_name,
                    dosage: reminder.dosage,
                    date: reminder.start_date,
                    time: reminder.timing,
                    duration: reminder.end_date - reminder.start_date
                }))
                setUpcomingReminders(transformed)
            } catch (err) {
                console.error(err)
            }
        }

        const fetchHealthStats = async () => {
            try {
                const response = await fetch("/stats/user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (!response.ok) {
                    throw new Error("Failed to fetch health stats")
                }
                const data = await response.json()
                setHealthStats(data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchUserData()
        fetchRecentQueries()
        fetchUpcomingReminders()
        fetchHealthStats()
    }, [])

    // Fallback user data if not loaded yet
    const displayUser = user || {
        name: "Loading...",
        email: "",
        age: "",
        gender: "",
        height_cm: "",
        weight_kg: "",
        blood_type: "",
    }

    // Helper function to get initials safely
    const getInitials = (name) => {
        if (!name) return ""
        const parts = name.split(" ")
        if (parts.length === 1) return parts[0][0]
        return parts[0][0] + parts[1][0]
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <img src={myIcon} alt="Icon" width={32} height={32} />
                            <span className="logo-text">GoHealthy</span>
                        </div>
                        <div className="header-actions">
                            <button className="btn btn-outline btn-small">⚙️ Settings</button>
                            <div className="user-avatar">
                                <span>{getInitials(displayUser.name)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1 className="welcome-title">Welcome back, {displayUser.name ? displayUser.name.split(' ')[0] : 'User'}!</h1>
                        <p className="welcome-description">Here's your health overview and recent activity</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <Link to="/symptoms" className="action-card action-card-blue">
                            <div>
                                <div className="action-icon">
                                    <img src={stethoscopeIcon} alt="Icon" width={42} height={42} />
                                </div>
                                <h3 className="action-title">Check Symptoms</h3>
                                <p className="action-description">Get AI-powered health insights</p>
                            </div>
                        </Link>
                        <Link to="/disclaimer" className="action-card action-card-green">
                            <div>
                                <div className="action-icon">
                                    <img src={chatIcon} alt="Icon" width={42} height={42} />
                                </div>
                                <h3 className="action-title">AI Chat</h3>
                                <p className="action-description">Get medication guidance</p>
                            </div>
                        </Link>
                        <Link to="/upload" className="action-card action-card-purple">
                            <div>
                                <div className="action-icon">
                                    <img src={uploadIcon} alt="Icon" width={42} height={42} />
                                </div>
                                <h3 className="action-title">Upload Prescription</h3>
                                <p className="action-description">Set medication reminders</p>
                            </div>
                        </Link>
                        <Link to="#" className="action-card action-card-orange">
                            <div>
                                <div className="action-icon">📋</div>
                                <h3 className="action-title">Health Reports</h3>
                                <p className="action-description">View your health history</p>
                            </div>
                        </Link>
                    </div>

                    <div className="dashboard-grid">
                        {/* Profile Overview */}
                        <div className="dashboard-sidebar">
                            <div className="card">
                                <div className="card-header">                                    
                                    <h3 className="card-title">
                                        <img src={profileIcon} alt="Icon" width={38} height={38} />
                                        Profile Overview</h3>
                                </div>
                                <div className="profile-info">
                                    <div className="profile-avatar">
                                        <div className="profile-avatar-icon">{getInitials(displayUser.name)}</div>
                                        <div className="profile-details">
                                            <h4 className="profile-name">{displayUser.name}</h4>
                                            <p className="profile-email">{displayUser.email}</p>
                                        </div>
                                    </div>

                                    <div className="profile-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Age</span>
                                            <span className="stat-value">{displayUser.age} years</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Gender</span>
                                            <span className="stat-value">{displayUser.gender}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Height</span>
                                            <span className="stat-value">{displayUser.height_cm} cm</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Weight</span>
                                            <span className="stat-value">{displayUser.weight_kg} kg</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Blood Type</span>
                                            <span className="stat-value">{displayUser.blood_type}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">BMI</span>
                                            <span className="stat-value">{((displayUser.weight_kg) / ((displayUser.height_cm / 100) ** 2)).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button className="btn btn-outline w-full">Edit Profile</button>
                                </div>
                            </div>

                            {/* Upcoming Reminders */}
                            <div className="card">
                                <div className="card-header">                                    
                                    <h3 className="card-title">
                                        <img src={reminderIcon} alt="Icon" width={32} height={32} />
                                        Upcoming Reminders</h3>
                                </div>
                                <div className="reminders-list">
                                    {upcomingReminders.map((reminder) => (
                                        <div key={reminder.id} className="reminder-item">
                                            <div className="reminder-info">
                                                <p className="reminder-medication">{reminder.medication}</p>
                                                <p className="reminder-time">
                                                    {reminder.date} at {reminder.time}
                                                </p>
                                            </div>
                                            <div className="reminder-icon">
                                                <img src={reminderAlertIcon} alt="remainder-icon" width={16} height={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Health Queries */}
                        <div className="dashboard-main">
                            <div className="card">
                                <div className="card-header">                              
                                    <h3 className="card-title">
                                        <img src={healthQueriesIcon} alt="Icon" width={32} height={32} />
                                        Recent Health Queries</h3>
                                    <p className="card-description">Your recent symptom checks and AI predictions</p>
                                </div>
                                <div className="queries-list">
                                    {recentQueries.map((query) => (
                                        <div key={query.id} className="query-item">
                                            <div className="query-content">
                                                <div className="query-header">
                                                    <span className="query-date">{query.date}</span>
                                                </div>
                                                <p className="query-symptoms">
                                                    <strong>Symptoms:</strong> {Object.entries(query.symptoms).filter(([symptom, value]) => value === 1).map(([symptom]) => symptom).join(", ")}
                                                </p>
                                                <p className="query-prediction">
                                                    <strong>AI Prediction:</strong> {query.prediction}
                                                </p>
                                            </div>
                                            <button className="btn btn-outline btn-small" >View Details</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="queries-footer">
                                    <Link to="/symptoms" className="btn btn-primary">
                                        Check New Symptoms
                                    </Link>
                                </div>
                            </div>

                            {/* Health Stats */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <img src={healthStatsIcon} alt="Icon" width={32} height={32}/>
                                        Health Statistics</h3>
                                    <p className="card-description">Your health metrics over time</p>
                                </div>
                                <div className="health-stats">
                                    <div className="health-stat health-stat-green">
                                        <div className="stat-number">{healthStats.queries_resolved}</div>
                                        <div className="stat-label">Queries Resolved</div>
                                    </div>
                                    <div className="health-stat health-stat-blue">
                                        <div className="stat-number">{healthStats.active_medications}</div>
                                        <div className="stat-label">Active Medications</div>
                                    </div>
                                    <div className="health-stat health-stat-purple">
                                        <div className="stat-number">{healthStats.reminders_set}</div>
                                        <div className="stat-label">Reminders Set</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
