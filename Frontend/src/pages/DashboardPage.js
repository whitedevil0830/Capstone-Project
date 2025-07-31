"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "./DashboardPage.css"
import myIcon from "../assets/icons/logo.png"
import reminderAlertIcon from "../assets/icons/Remainder-icon.png"
import chatIcon from "../assets/icons/icons8-chat-96.png"
import healthQueriesIcon from "../assets/icons/icons8-heart-health-96.png"
import profileIcon from "../assets/icons/icons8-profile-96.png"
import stethoscopeIcon from "../assets/icons/icons8-stethoscope-96.png"
import reminderIcon from "../assets/icons/icons8-timesheet-96.png"
import uploadIcon from "../assets/icons/icons8-upload-96.png"
import healthStatsIcon from "../assets/icons/icons8-combo-chart-96.png"
import listIcon from '../assets/icons/icons8-list-32.png';

const DashboardPage = () => {
    const [user, setUser] = useState(null)
    const [recentQueries, setRecentQueries] = useState([])
    const [upcomingReminders, setUpcomingReminders] = useState([])
    const [healthStats, setHealthStats] = useState({
        queries_resolved: 0,
        active_medications: 0,
        reminders_set: 0
    })
    const [selectedQueryDetails, setSelectedQueryDetails] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

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
                    smoking: data.smoking,
                    alcohol_consumption: data.alcohol_consumption,
                    emergency_contact: data.emergency_contact,
                    emergency_phone: data.emergency_phone,
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
        smoking: "",
        alcohol_consumption: "",
        emergency_contact: "",
        emergency_phone: "",
    }

    // Helper function to get initials safely
    const getInitials = (name) => {
        if (!name) return ""
        const parts = name.split(" ")
        if (parts.length === 1) return parts[0][0]
        return parts[0][0] + parts[1][0]
    }

    const openDetailsModal = async (queryId) => {
        try {
            const response = await fetch(`/predictions/query/${queryId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch query details");
            }
            const data = await response.json();
            setSelectedQueryDetails(data);
            setShowDetailsModal(true);
        } catch (error) {
            alert(error.message);
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedQueryDetails(null);
    };

    const handleCancelReminder = async (reminderId) => {
        try {
            const response = await fetch(`/reminders/${reminderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to cancel reminder");
            }
            // Update the upcomingReminders state by removing the canceled reminder
            setUpcomingReminders((prevReminders) =>
                prevReminders.filter((reminder) => reminder.id !== reminderId)
            );
            // Optionally, update healthStats to decrease active_medications count
            setHealthStats((prevStats) => ({
                ...prevStats,
                active_medications: prevStats.active_medications > 0 ? prevStats.active_medications - 1 : 0,
                // Do not decrease reminders_set count on cancel
                reminders_set: prevStats.reminders_set,
            }));
            alert("Reminder canceled successfully.");
        } catch (error) {
            alert(error.message);
        }
    }

    // New state for edit profile modal visibility and form data
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({
        age: "",
        height_cm: "",
        weight_kg: "",
        smoking: "",
        alcohol_consumption: "",
        blood_type: "",
        emergency_contact: "",
        emergency_phone: "",
    });
    const [editProfileErrors, setEditProfileErrors] = useState({});

    // Function to open edit profile modal and prefill data
    const openEditProfileModal = () => {
        setEditProfileData({
            age: user?.age || "",
            height_cm: user?.height_cm || "",
            weight_kg: user?.weight_kg || "",
            smoking: user?.smoking || "",
            alcohol_consumption: user?.alcohol_consumption || "",
            blood_type: user?.blood_type || "",
            emergency_contact: user?.emergency_contact || "",
            emergency_phone: user?.emergency_phone || "",
        });
        setEditProfileErrors({});
        setEditProfileModalOpen(true);
    };

    // Function to close edit profile modal
    const closeEditProfileModal = () => {
        setEditProfileModalOpen(false);
    };

    // Validation function for edit profile form
    const validateEditProfile = () => {
        const errors = {};
        if (!editProfileData.age || isNaN(editProfileData.age) || editProfileData.age <= 0) {
            errors.age = "Please enter a valid age";
        }
        if (!editProfileData.height_cm || isNaN(editProfileData.height_cm) || editProfileData.height_cm <= 0) {
            errors.height_cm = "Please enter a valid height";
        }
        if (!editProfileData.weight_kg || isNaN(editProfileData.weight_kg) || editProfileData.weight_kg <= 0) {
            errors.weight_kg = "Please enter a valid weight";
        }
        if (!editProfileData.emergency_contact) {
            errors.emergency_contact = "Emergency contact is required";
        }
        if (!editProfileData.emergency_phone) {
            errors.emergency_phone = "Emergency phone is required";
        }
        setEditProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle input change in edit profile form
    const handleEditProfileChange = (e) => {
        const { name, value } = e.target;
        setEditProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit handler for edit profile form
    const handleEditProfileSubmit = async (e) => {
        e.preventDefault();
        if (!validateEditProfile()) {
            return;
        }
        try {
            const response = await fetch("/users/me/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    age: Number(editProfileData.age),
                    height_cm: Number(editProfileData.height_cm),
                    weight_kg: Number(editProfileData.weight_kg),
                    smoking: editProfileData.smoking,
                    alcohol_consumption: editProfileData.alcohol_consumption,
                    blood_type: editProfileData.blood_type,
                    emergency_contact: editProfileData.emergency_contact,
                    emergency_phone: editProfileData.emergency_phone,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update profile");
            }
            const updatedUser = await response.json();
            setUser((prev) => ({
                ...prev,
                age: updatedUser.age,
                height_cm: updatedUser.height_cm,
                weight_kg: updatedUser.weight_kg,
                smoking: updatedUser.smoking,
                alcohol_consumption: updatedUser.alcohol_consumption,
                blood_type: updatedUser.blood_type,
                emergency_contact: updatedUser.emergency_contact,
                emergency_phone: updatedUser.emergency_phone,
            }));
            closeEditProfileModal();
        } catch (error) {
            alert(error.message);
        }
    };

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
                            <div className="user-avatar">
                                <span>{getInitials(displayUser.name)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Details Modal */}
            {showDetailsModal && selectedQueryDetails && (
                <div className="modal-overlay" onClick={closeDetailsModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: "58%" }}>
                            <h3>Query Details</h3>
                            <button className="cancel-btn " onClick={closeDetailsModal} title="Cancel Reminder">
                                x
                            </button>
                        </div>
                        <p>
                            <strong>Prediction:</strong> {selectedQueryDetails.top_prediction || "N/A"}
                        </p>
                        <p>
                            <strong>Alternate Possibilities:</strong>
                        </p>
                        <ul style={{ paddingLeft: "20px" }}>
                            {selectedQueryDetails.top_3
                                ? selectedQueryDetails.top_3.map((item, index) => {
                                    const key = Object.keys(item)[0];
                                    const value = item[key];
                                    return (
                                        <li key={index} style={{ marginLeft: "8px" }}>
                                            {key}: {(value * 100).toFixed(0)}%
                                        </li>
                                    );
                                })
                                : <li>N/A</li>}
                        </ul>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1 className="welcome-title">Welcome back, {displayUser.name ? displayUser.name.split(" ")[0] : "User"}!</h1>
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
                        <Link to="/health-report" className="action-card action-card-orange">
                            <div>
                                <div className="action-icon">
                                    <img src={listIcon} alt="Icon" width={32} height={32}/>
                                </div>
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
                                        Profile Overview
                                    </h3>
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
                                            <span className="stat-value">
                                                {displayUser.weight_kg && displayUser.height_cm
                                                    ? (displayUser.weight_kg / ((displayUser.height_cm / 100) ** 2)).toFixed(2)
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>

                                    <button className="btn btn-outline w-full" onClick={openEditProfileModal}>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Reminders */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <img src={reminderIcon} alt="Icon" width={32} height={32} />
                                        Upcoming Reminders
                                    </h3>
                                </div>
                                <div className="reminders-list">
                                    {upcomingReminders.map((reminder) => (
                                        <div key={reminder.id} className="reminder-item">
                                            <div className="reminder-icon">
                                                <img src={reminderAlertIcon} alt="remainder-icon" width={16} height={16} />
                                            </div>
                                            <div className="reminder-info">
                                                <p className="reminder-medication">{reminder.medication}</p>
                                                <p className="reminder-medication">Dosage: {reminder.dosage}</p>
                                                <p className="reminder-time">
                                                    Start Date: {reminder.date} <br />
                                                    Daily at: {reminder.time}
                                                </p>
                                            </div>
                                            <button
                                                className="cancel-btn "
                                                style={{ marginLeft: "10px" }}
                                                onClick={() => handleCancelReminder(reminder.id)}
                                                title="Cancel Reminder"
                                            >
                                                x
                                            </button>
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
                                        Recent Health Queries
                                    </h3>
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
                                                    <strong>Symptoms:</strong>{" "}
                                                    {Object.entries(query.symptoms)
                                                        .filter(([symptom, value]) => value === 1)
                                                        .map(([symptom]) => symptom)
                                                        .join(", ")}
                                                </p>
                                                <p className="query-prediction">
                                                    <strong>Prediction:</strong> {query.prediction}
                                                </p>
                                            </div>
                                            <button
                                                className="btn btn-outline btn-small"
                                                onClick={() => openDetailsModal(query.id)}
                                            >
                                                View Details
                                            </button>
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
                                        <img src={healthStatsIcon} alt="Icon" width={32} height={32} />
                                        Health Statistics
                                    </h3>
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

            {/* Edit Profile Modal */}
            {editProfileModalOpen && (
                <div className="modal-overlay" onClick={closeEditProfileModal}>
                    <div className="modal-content-update" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Profile</h2>
                        <form onSubmit={handleEditProfileSubmit} noValidate>
                            <div class="form-row-update">
                                <div className="form-group">
                                    <label htmlFor="age">Age</label>
                                    <input
                                        id="age"
                                        class="form-input"
                                        name="age"
                                        type="number"
                                        value={editProfileData.age}
                                        onChange={handleEditProfileChange}
                                        required
                                    />
                                    {editProfileErrors.age && <span className="error">{editProfileErrors.age}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="height_cm">Height (cm)</label>
                                    <input
                                        id="height_cm"
                                        class="form-input"
                                        name="height_cm"
                                        type="number"
                                        value={editProfileData.height_cm}
                                        onChange={handleEditProfileChange}
                                        required
                                    />
                                    {editProfileErrors.height_cm && <span className="error">{editProfileErrors.height_cm}</span>}
                                </div>
                            </div>
                            <div class="form-row-update">
                                <div className="form-group">
                                    <label htmlFor="weight_kg">Weight (kg)</label>
                                    <input
                                        id="weight_kg"
                                        class="form-input"
                                        name="weight_kg"
                                        type="number"
                                        value={editProfileData.weight_kg}
                                        onChange={handleEditProfileChange}
                                        required
                                    />
                                    {editProfileErrors.weight_kg && <span className="error">{editProfileErrors.weight_kg}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="smoking">Smoking</label>
                                    <select
                                        id="smoking"
                                        class="form-input"
                                        name="smoking"
                                        value={editProfileData.smoking}
                                        onChange={handleEditProfileChange}
                                    >
                                        <option value="">Select your smoking level</option>
                                        <option value="Never">Never</option>
                                        <option value="Current">Current</option>
                                        <option value="Former">Former</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row-update">
                                <div className="form-group">
                                    <label htmlFor="alcohol_consumption">Alcohol Consumption</label>
                                    <select
                                        id="alcohol_consumption"
                                        class="form-input"
                                        name="alcohol_consumption"
                                        value={editProfileData.alcohol_consumption}
                                        onChange={handleEditProfileChange}
                                    >
                                        <option value="">Select your consumption level</option>
                                        <option value="Never">Never</option>
                                        <option value="Social">Social</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Heavy">Heavy</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="blood_type">Blood Type</label>
                                    <select
                                        id="blood_type"
                                        class="form-input"
                                        name="blood_type"
                                        value={editProfileData.blood_type}
                                        onChange={handleEditProfileChange}
                                    >
                                        <option value="">Select your blood type</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="unknown">Unknown</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row-update">
                                <div className="form-group">
                                    <label htmlFor="emergency_contact">Emergency Contact</label>
                                    <input
                                        id="emergency_contact"
                                        class="form-input"
                                        name="emergency_contact"
                                        type="text"
                                        value={editProfileData.emergency_contact}
                                        onChange={handleEditProfileChange}
                                        required
                                    />
                                    {editProfileErrors.emergency_contact && (
                                        <span className="error">{editProfileErrors.emergency_contact}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emergency_phone">Emergency Phone</label>
                                    <input
                                        id="emergency_phone"
                                        class="form-input"
                                        name="emergency_phone"
                                        type="tel"
                                        value={editProfileData.emergency_phone}
                                        onChange={handleEditProfileChange}
                                        required
                                    />
                                    {editProfileErrors.emergency_phone && (
                                        <span className="error">{editProfileErrors.emergency_phone}</span>
                                    )}
                                </div>
                            </div>
                            <div class="submit-section">
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeEditProfileModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardPage