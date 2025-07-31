import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "./PredictionPage.css"
import myIcon from '../assets/icons/logo.png';

const PredictionPage = () => {
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userName, setUserName] = useState("")

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
                setUserName(data.full_name || "User")
            } catch (err) {
                console.error(err)
            }
        }
        fetchUserData()

        const predictionData = localStorage.getItem("predictionResult")
        if (predictionData) {
            setPrediction(JSON.parse(predictionData))
        } else {
            setError("No prediction data found. Please submit symptoms first.")
        }
        setLoading(false)
    }, [])

    if (loading) {
        return <div className="prediction-page"><p>Loading prediction...</p></div>
    }

    if (error) {
        return (
            <div className="prediction-page">
                <p className="error-message">{error}</p>
                <Link to="/symptoms">Go to Symptoms Page</Link>
            </div>
        )
    }

    return (
        <div className="prediction-page">
            {/* Header */}
            <header className="prediction-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/symptoms" className="back-link">
                            ← Back to Symptoms
                        </Link>
                        <div className="logo">
                            <Link to="/" className="logo">
                                <img src={myIcon} alt="Icon" width={32} height={32} />
                                <span className="logo-text">GoHealthy</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="prediction-content">
                <div className="container">
                    <div className="prediction-header-section">
                        <h1 className="prediction-title">So, here are your symptoms analysis results {userName.split(" ")[0].toLowerCase()}</h1>
                    </div>

                    <div className="prediction-grid">
                        {/* Main Results */}
                        <div className="prediction-main">
                            {/* Primary Diagnosis */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title"> Primary Diagnosis</h2>
                                </div>
                                <div className="diagnosis-content">
                                    <div className="diagnosis-header">
                                        <h3 className="diagnosis-name">{prediction.predicted_disease}</h3>
                                        <span className="confidence-badge">{Math.round(prediction.confidence * 100)}% confidence</span>
                                    </div>

                                    <div className="confidence-bar">
                                        <div className="confidence-label">
                                            <span>Confidence Level</span>
                                            <span>{Math.round(prediction.confidence * 100)}%</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar" style={{ width: `${prediction.confidence * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="diagnosis-meta">
                                        <span className="analysis-time">Analysis completed just now</span>
                                    </div>

                                    <p className="diagnosis-description">
                                        {/* You can add a description here if available */}
                                        The analysis suggests the above primary diagnosis based on your symptoms.
                                    </p>
                                </div>
                            </div>

                            {/* Alternative Diagnoses */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title"> Alternative Possibilities</h2>
                                    <p className="card-description">Other conditions that could match your symptoms</p>
                                </div>
                                <div className="alternatives-list">
                                    {[prediction.top_3[1], prediction.top_3[2]].map(([name, probability], index) => (
                                        <div key={index} className="alternative-item">
                                            <span className="alternative-name">{name}</span>
                                            <div className="alternative-probability">
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: `${Math.round(probability * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="probability-text">{Math.round(probability * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="prediction-sidebar">
                            {/* Quick Actions */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Next Steps</h3>
                                </div>
                                <div className="next-actions">
                                    <Link to="/disclaimer" className="btn btn-primary w-full">
                                        Get Medication Info
                                    </Link>
                                    <button className="btn btn-outline w-full"> Save to Health Records</button>
                                    <button className="btn btn-outline w-full"> Find Nearby Doctors</button>
                                    <Link to="/symptoms" className="btn btn-outline w-full">
                                        Check New Symptoms
                                    </Link>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="alert alert-warning">
                                <div className="alert-icon">⚠️</div>
                                <div className="alert-content">
                                    <strong>Important:</strong> This AI analysis is for informational purposes only. Always consult with a
                                    healthcare professional for proper diagnosis and treatment.
                                    Contact a healthcare provider if you experience: Severe or worsening symptoms
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PredictionPage
