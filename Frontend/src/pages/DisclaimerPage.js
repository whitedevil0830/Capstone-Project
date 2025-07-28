import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./DisclaimerPage.css"
import myIcon from '../assets/icons/logo.png';

const DisclaimerPage = () => {
    const [acknowledged, setAcknowledged] = useState(false)
    const navigate = useNavigate()

    const handleProceed = () => {
        if (acknowledged) {
            navigate("/chat")
        }
    }

    return (
        <div className="disclaimer-page">
            {/* Header */}
            <header className="disclaimer-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/prediction" className="back-link">
                            ← Back to Results
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

            <div className="disclaimer-content">
                <div className="container">
                    <div className="disclaimer-card">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Disclaimer</h2>
                                <p className="card-description">Please read and acknowledge this disclaimer before proceeding to medication information</p>
                            </div>

                            <div className="disclaimer-alert">
                                <div className="alert-icon">⚠️</div>
                                <div className="alert-content">
                                    <strong>Important:</strong> The information provided by GoHealthy is for informational and educational
                                    purposes only and should not be considered as a final medical advice, diagnosis, or treatment
                                    recommendations.
                                </div>
                            </div>

                            <div className="disclaimer-points">
                                <h3 className="points-title">Key Points to Understand:</h3>

                                <div className="points-list">
                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Not a Substitute for Professional Medical Care</h4>
                                            <p className="point-description">
                                                This AI system cannot replace the expertise, judgment, and personalized care provided by
                                                qualified healthcare professionals.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Medication Information Only</h4>
                                            <p className="point-description">
                                                Any medication information provided is general in nature and may not be suitable for your
                                                specific condition, medical history, or current medications.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Consult Healthcare Providers</h4>
                                            <p className="point-description">
                                                Always consult with your doctor, pharmacist, or other qualified healthcare provider before
                                                starting, stopping, or changing any medication or treatment.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Emergency Situations</h4>
                                            <p className="point-description">
                                                In case of medical emergencies, contact emergency services immediately. Do not rely on this
                                                system for urgent medical decisions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Individual Variations</h4>
                                            <p className="point-description">
                                                Medical conditions and responses to treatments vary greatly between individuals. What works for
                                                one person may not work for another.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="point-item">
                                        <div className="point-icon">{">"}</div>
                                        <div className="point-content">
                                            <h4 className="point-title">Accuracy Limitations</h4>
                                            <p className="point-description">
                                                While our AI strives for accuracy, it may not always provide complete or up-to-date
                                                information. Medical knowledge is constantly evolving.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="liability-section">
                                <h4 className="liability-title">Liability Disclaimer</h4>
                                <p className="liability-text">
                                    GoHealthy and its developers are not liable for any decisions made based on the information provided.
                                    Users assume full responsibility for any actions taken based on this information.
                                </p>
                            </div>

                            <div className="help-section">
                                <h4 className="help-title">When to Seek Professional Help</h4>
                                <ul className="help-list">
                                    <li>• Before starting any new medication or treatment</li>
                                    <li>• If symptoms worsen or don't improve</li>
                                    <li>• For personalized medical advice</li>
                                    <li>• If you have questions about drug interactions</li>
                                    <li>• For proper dosage and administration guidance</li>
                                </ul>
                            </div>
                        </div>

                        <div className="acknowledgment-section">
                            <div className="card">
                                <div className="acknowledgment-content">
                                    <div className="checkbox-group-disclaimer">
                                        <input
                                            id="acknowledge"
                                            type="checkbox"
                                            checked={acknowledged}
                                            onChange={(e) => setAcknowledged(e.target.checked)}
                                            className="checkbox"
                                        />
                                        <label htmlFor="acknowledge" className="checkbox-label">
                                            <strong>I acknowledge and understand</strong> that the medication information provided by GoHealthy
                                            is for educational purposes only and should not replace professional medical advice. I understand
                                            that I should consult with qualified healthcare providers for proper medical guidance and before
                                            making any decisions about medications or treatments.
                                        </label>
                                    </div>

                                    <div className="action-buttons">
                                        <Link to="/prediction" className="btn-cancel btn-outline">
                                            Cancel
                                        </Link>
                                        <button onClick={handleProceed} disabled={!acknowledged} className="btn-submit btn-primary">
                                            I Understand - Proceed to Chat
                                        </button>
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

export default DisclaimerPage