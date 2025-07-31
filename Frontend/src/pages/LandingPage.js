import { useEffect } from 'react';
import { Link } from "react-router-dom"
import "./LandingPage.css"
import Typed from 'typed.js';
import myIcon from '../assets/icons/logo.png';
import stethoscopeIcon from "../assets/icons/icons8-stethoscope-96.png"
import reminderIcon from "../assets/icons/icons8-timesheet-96.png"
import medGuidanceIcon from "../assets/icons/icons8-secured-file-96.png"
import healthProfileIcon from "../assets/icons/icons8-profile-96.png"
import chatMessageIcon from "../assets/icons/icons8-chat-message-96.png"
import healthMonitoringIcon from "../assets/icons/icons8-heart-with-pulse-96.png"

const LandingPage = () => {
    useEffect(() => {
        const typed = new Typed('.typewriter', {
            strings: ['Your AI-Powered Health Companion', 'Co-Powered by Navikenz'],
            typeSpeed: 90,
            backSpeed: 90,
            loop: true,
        });

        // Cleanup on component unmount
        return () => {
            typed.destroy();
        };
    }, []);

    const features = [
        {
            icon: <img src={stethoscopeIcon} alt="Icon" height={50} width={50}/>,
            title: "AI Symptom Analysis",
            description: "Advanced AI analyzes your symptoms to provide potential health insights",
        },
        {
            icon: <img src={medGuidanceIcon} alt="Icon" height={50} width={50} />,
            title: "Medication Guidance",
            description: "Get detailed information about medications and proper usage guidelines",
        },
        {
            icon: <img src={reminderIcon} alt="Icon" height={50} width={50} />,
            title: "Smart Reminders",
            description: "Upload prescriptions and get automated medication reminders",
        },
        {
            icon: <img src={healthProfileIcon} alt="Icon" height={50} width={50} />,
            title: "Personal Health Profile",
            description: "Track your health history and get personalized recommendations",
        },
        {
            icon: <img src={chatMessageIcon} alt="Icon" height={50} width={50} />,
            title: "Expert AI Chat",
            description: "Chat with our AI for detailed drug information and health guidance",
        },
        {
            icon: <img src={healthMonitoringIcon} alt="Icon" height={50} width={50} />,
            title: "Health Monitoring",
            description: "Keep track of your vital statistics and health metrics over time",
        },
    ]

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <img src={myIcon} alt="Icon" width={32} height={32} />
                            <span className="logo-text">GoHealthy</span>
                        </div>
                        <div className="header-buttons">
                            <Link to="/login" className="btn btn-secondary btn-outline" style={{ height: '50px'}}>
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary" style={{ height: '50px' }}>
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title"><span className="typewriter"></span></h1>
                        <p className="hero-description">
                            Get instant health insights, symptom analysis, and personalized medication guidance with our advanced AI
                            technology. Your health journey starts here.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/signup" className="btn btn-primary btn-large">
                                Let's Get Started
                            </Link>
                            <a href="#features" className="btn btn-secondary btn-large" >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Comprehensive Health Management</h2>
                        <p className="section-description">Everything you need to monitor and manage your health in one place</p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-description">Simple steps to better health management</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3 className="step-title">Sign Up</h3>
                            <p className="step-description">Create your account and complete your health profile</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3 className="step-title">Input Symptoms</h3>
                            <p className="step-description">Describe your symptoms for AI analysis</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3 className="step-title">Get Insights</h3>
                            <p className="step-description">Receive AI-powered health insights and recommendations</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3 className="step-title">Chat & Track</h3>
                            <p className="step-description">Chat with AI for detailed guidance and track your health</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Take Control of Your Health?</h2>
                        <p className="cta-description">
                            Join thousands of users who trust GoHealthy for their health management needs
                        </p>
                        <Link to="/signup" className="btn btn-secondary btn-large">
                            Start Your Health Journey
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo">
                                <img src={myIcon} alt="Icon" width={32} height={32} style={{borderRadius:"50"}} />
                                <span className="logo-text" style={{color:"white"}}>GoHealthy</span>
                            </div>
                            <p className="footer-description">
                                Your trusted AI-powered health companion for better health management.
                            </p>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-title">Features</h3>
                            <Link to={"/login"}>
                                <ul className="footer-links">
                                    <li>Symptom Analysis</li>
                                    <li>Medication Guidance</li>
                                    <li>Health Tracking</li>
                                    <li>AI Chat Support</li>
                                </ul>
                            </Link>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-title">Support</h3>
                            <ul className="footer-links">
                                <li>Help Center</li>
                                <li>Contact Us</li>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-title">Company</h3>
                            <ul className="footer-links">
                                <li>About Us</li>
                                <li>Careers</li>
                                <li>Blog</li>
                                <li>Press</li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 GoHealthy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage