"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./AuthPages.css"
import myIcon from '../assets/icons/logo.png';
import eyeHide from '../assets/icons/eye-hide.png';
import eyeOpen from '../assets/icons/eye-open.png';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

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
            const formBody = new URLSearchParams();
            formBody.append("username", formData.email);
            formBody.append("password", formData.password);

            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formBody.toString(),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Login failed")
            }

            const data = await response.json()
            localStorage.setItem("token", data.access_token)
            navigate("/dashboard")
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Header */}
                <div className="auth-header">
                    <Link to="/" className="logo">
                        <img src={myIcon} alt="Icon" width={32} height={32} />
                        <span className="logo-text">GoHealthy</span>
                    </Link>
                </div>

                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-description">Sign in to your account to continue your health journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="password-input-container">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? 
                                        <img src={eyeOpen} alt="Icon" /> : <img src={eyeHide} alt="Icon" />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-links">
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/signup" className="auth-link">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage