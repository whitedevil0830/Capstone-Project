"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./PersonalDetailsPage.css"
import myIcon from "../assets/icons/logo.png"
import { useEffect } from "react"

const PersonalDetailsPage = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        age: "",
        gender: "",
        height_cm: "",
        weight_kg: "",
        smoking:"",
        alcohol_consumption:"",
        blood_type: "",
        emergency_contact: "",
        emergency_phone: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
            const response = await fetch("/users/me", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (!response.ok) {
                throw new Error("Failed to fetch user profile")
            }
            const data = await response.json()
            setFormData({
                full_name: data.full_name || "",
                age: data.age || "",
                gender: data.gender || "",
                height_cm: data.height_cm || "",
                weight_kg: data.weight_kg || "",
                smoking: data.smoking || "",
                alcohol_consumption: data.alcohol_consumption || "",
                blood_type: data.blood_type || "",
                emergency_contact: data.emergency_contact || "",
                emergency_phone: data.emergency_phone || "",
            })
            } catch (err) {
                setError(err.message)
            }
        }
        fetchUserProfile()
    }, [])

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/users/me/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    age: Number(formData.age),
                    gender: formData.gender,
                    height_cm: Number(formData.height_cm),
                    weight_kg: Number(formData.weight_kg),
                    smoking: formData.smoking,
                    alcohol_consumption: formData.alcohol_consumption,
                    blood_type: formData.blood_type,
                    emergency_contact: formData.emergency_contact,
                    emergency_phone: formData.emergency_phone,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to update profile")
            }

            setIsLoading(false)
            navigate("/dashboard")
        } catch (err) {
            setIsLoading(false)
            setError(err.message)
        }
    }

    return (
        <div className="personal-details-page">
            <div className="details-container">
                {/* Header */}
                <div className="details-header">
                    <Link to="/" className="logo">
                        <img src={myIcon} alt="Icon" width={32} height={32}/>
                        <span className="logo-text">GoHealthy</span>
                    </Link>
                </div>

                <div className="details-card">
                    <div className="details-card-header">
                        <div className="back-button-container">
                            <button className="back-button" onClick={() => navigate(-1)}>
                                ← Back
                            </button>
                        </div>
                        <h1 className="details-title">Complete Your Health Profile</h1>
                        <p className="details-description">Help us provide personalized health insights by sharing your details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="details-form">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h3 className="section-title">Basic Information</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="age" className="form-label">
                                        Age
                                    </label>
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        placeholder="Enter your age (e.g. 25)"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="gender" className="form-label">
                                        Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    >
                                        <option value="">Select your gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="height" className="form-label">
                                        Height (cm)
                                    </label>
                                    <input
                                        id="height"
                                        name="height_cm"
                                        type="number"
                                        placeholder="Enter your height in cm (e.g. 170)"
                                        value={formData.height_cm}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="weight" className="form-label">
                                        Weight (kg)
                                    </label>
                                    <input
                                        id="weight"
                                        name="weight_kg"
                                        type="number"
                                        placeholder="Enter your weight in kg (e.g. 65)"
                                        value={formData.weight_kg}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="smoking" className="form-label">
                                        Smoking
                                    </label>
                                    <select
                                        id="smoking"
                                        name="smoking"
                                        value={formData.smoking}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="">Select your smoking level</option>
                                        <option value="Never">Never</option>
                                        <option value="Current">Current</option>
                                        <option value="Former">Former</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="alcohol" className="form-label">
                                        Alcohol Consumption
                                    </label>
                                    <select
                                        id="alcohol"
                                        name="alcohol"
                                        value={formData.alcohol}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="">Select your consumption level</option>
                                        <option value="Never">Never</option>
                                        <option value="Social">Social</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Heavy">Heavy</option>                                       
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="bloodType" className="form-label">
                                    Blood Type
                                </label>
                                <select
                                    id="bloodType"
                                    name="blood_type"
                                    value={formData.blood_type}
                                    onChange={handleInputChange}
                                    className="form-input"
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

                        {/* Emergency Contact */}
                        <div className="form-section">
                            <h3 className="section-title">Emergency Contact</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="emergencyContact" className="form-label">
                                        Contact Name
                                    </label>
                                    <input
                                        id="emergencyContact"
                                        name="emergencyContact"
                                        placeholder="Emergency contact name"
                                        value={formData.emergencyContact}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="emergencyPhone" className="form-label">
                                        Phone Number
                                    </label>
                                    <input
                                        id="emergencyPhone"
                                        name="emergencyPhone"
                                        type="tel"
                                        placeholder="Emergency contact phone"
                                        value={formData.emergencyPhone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                            {isLoading ? "Saving Profile..." : "Complete Profile"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PersonalDetailsPage