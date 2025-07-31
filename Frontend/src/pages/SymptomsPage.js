"use client"

import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import myIcon from '../assets/icons/logo.png';
import "./SymptomsPage.css"
import Select from "react-select"

const SymptomsPage = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState([])
    const [fullSymptomsList, setFullSymptomsList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchSymptomsList = async () => {
            try {
                const response = await fetch("/symptoms_list/")
                if (!response.ok) {
                    throw new Error("Failed to fetch symptoms list")
                }
                const data = await response.json()
                setFullSymptomsList(data)
            } catch (err) {
                alert(err.message)
            }
        }
        fetchSymptomsList()
    }, [])

    const prepareSymptomsJson = (selectedList) => {
        const symptomsJson = {}
        fullSymptomsList.forEach(symptom => {
            symptomsJson[symptom] = selectedList.includes(symptom) ? 1 : 0
        })
        return symptomsJson
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const symptomsJson = prepareSymptomsJson(selectedSymptoms)

            // First submit symptoms data
            const responseSymptoms = await fetch("/symptoms/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    symptoms: symptomsJson,
                    disease: "", // backend will fill this after prediction
                    source: "user",
                }),
            })

            if (!responseSymptoms.ok) {
                const errorData = await responseSymptoms.json()
                throw new Error(errorData.detail || "Failed to submit symptoms")
            }

            // Then call prediction endpoint
            const responsePrediction = await fetch("/predictions/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(prepareSymptomsJson(selectedSymptoms)),
            })

            if (!responsePrediction.ok) {
                const errorData = await responsePrediction.json()
                throw new Error(errorData.detail || "Failed to get prediction")
            }

            setIsLoading(false)
            // Store prediction result in localStorage
            const predictionData = await responsePrediction.json()
            localStorage.setItem("predictionResult", JSON.stringify(predictionData))
            navigate("/prediction")
        } catch (err) {
            setIsLoading(false)
            alert(err.message)
        }
    }

    return (
        <div className="symptoms-page">
            {/* Header */}
            <header className="symptoms-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/dashboard" className="back-link">
                            ← Back to Dashboard
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

            <div className="symptoms-content">
                <div className="container">
                    <div className="symptoms-header-section">
                        <h1 className="symptoms-title">Symptom Analysis</h1>
                        <p className="symptoms-description">Describe your symptoms and get your health insights</p>
                    </div>

                    <div className="symptoms-grid">
                        {/* Main Form */}
                        <div className="symptoms-main">
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title"> Describe Your Symptoms</h2>
                                    <p className="card-description">Please provide detailed information about what you're experiencing</p>
                                </div>

                                <form onSubmit={handleSubmit} className="symptoms-form">
                                    {/* Primary Symptoms */}
                                    <div className="form-group">
                                        <label htmlFor="symptoms" className="form-label">
                                            Primary Symptoms *
                                        </label>
                                        <Select
                                            id="symptoms"
                                            isMulti
                                            options={fullSymptomsList.map((symptom) => ({
                                                value: symptom,
                                                label: symptom,
                                            }))}
                                            value={selectedSymptoms.map((symptom) => ({
                                                value: symptom,
                                                label: symptom,
                                            }))}
                                            onChange={(selectedOptions) =>
                                                setSelectedSymptoms(selectedOptions.map((option) => option.value))
                                            }
                                            classNamePrefix="react-select"
                                            placeholder="Select your symptoms..."
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading || selectedSymptoms.length === 0}>
                                        {isLoading ? "Analyzing Symptoms..." : "Analyze Symptoms"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="symptoms-sidebar">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Important Notes</h3>
                                </div>
                                <div className="sidebar-content">
                                    <div className="info-box info-box-warning">
                                        <h4 className="info-title">Disclaimer</h4>
                                        <p className="info-text">
                                            This AI analysis is for informational purposes only and should not replace professional medical
                                            advice.
                                        </p>
                                    </div>

                                    <div className="info-box info-box-danger">
                                        <h4 className="info-title">Seek Immediate Help If:</h4>
                                        <ul className="info-list">
                                            <li>• Severe chest pain</li>
                                            <li>• Difficulty breathing</li>
                                            <li>• Sudden severe headache</li>
                                            <li>• High fever with confusion</li>
                                            <li>• Loss of consciousness</li>
                                        </ul>
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

export default SymptomsPage