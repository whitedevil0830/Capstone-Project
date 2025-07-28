import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import "./UploadPage.css"
import myIcon from '../assets/icons/logo.png';

const UploadPage = () => {
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingProgress, setProcessingProgress] = useState(0)
    const [extractedData, setExtractedData] = useState([])
    const [isProcessed, setIsProcessed] = useState(false)
    const [additionalNotes, setAdditionalNotes] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setIsProcessed(false)
            setExtractedData([])
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
            setUploadedFile(file)
            setIsProcessed(false)
            setExtractedData([])
        }
    }, [])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
    }, [])

    const processDocument = async () => {
        console.log("Processing started...");
        if (!uploadedFile) {
            console.log("No uploaded file found.");
            return;
        }
        console.log("File to process:", uploadedFile.name);
        setIsProcessing(true)
        setProcessingProgress(0)

        // Simulate processing with progress updates
        const progressInterval = setInterval(() => {
            setProcessingProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            const formData = new FormData()
            formData.append("file", uploadedFile)

            const response = await fetch("/prescriptions/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error("Failed to process document")
            }

            const data = await response.json()
            console.log("Parsed API Response:", data);

            // Set extracted medications without selection property
            const meds = (data.extracted_data.medications || [])
            setExtractedData(meds)
            console.log("Updated extractedData state:", meds)
            setIsProcessed(true)
        } catch (error) {
            setErrorMessage(error.message || "Error processing document")
        } finally {
            clearInterval(progressInterval)
            setProcessingProgress(100)
            setIsProcessing(false)
            console.log("Processing finished (finally block)");
        }
    }

    const setupReminders = async () => {
        if (extractedData.length === 0) {
            alert("No medications found to set reminders.")
            return
        }
        try {
            for (const med of extractedData) {
                const response = await fetch("/reminders/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },

                    body: JSON.stringify({
                        drug_name: med.drug_name,
                        dosage: med.dosage,
                        timing: med.timing,
                        start_date: med.start_date ? new Date(med.start_date).toISOString().split('T')[0] : null,
                        end_date: med.end_date ? new Date(med.end_date).toISOString().split('T')[0] : null,
                        status: "active"
                    })
                })
                console.log("Body:", med)
                if (!response.ok) {
                    throw new Error(`Failed to set reminder for ${med.drug_name}`)
                }
            }
            alert("Medication reminders set successfully for all drugs in the prescription uploaded.")
        } catch (error) {
            alert(error.message)
        }
    }

    const removeFile = () => {
        setUploadedFile(null)
        setIsProcessed(false)
        setExtractedData([])
        setProcessingProgress(0)
    }

    return (
        <div className="upload-page">
            {/* Header */}
            <header className="upload-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/dashboard" className="back-link">
                            ← Back to Dashboard
                        </Link>
                        <div className="logo">
                            <img src={myIcon} alt="Icon" width={32} height={32} />
                            <span className="logo-text">GoHealthy</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="upload-content">
                <div className="container">
                    <div className="upload-header-section">
                        <h1 className="upload-title">Upload Prescription</h1>
                        <p className="upload-description">
                            Upload your prescription or medical document to set up automated medication reminders
                        </p>
                    </div>

                    <div className="upload-grid">
                        {/* Main Upload Section */}
                        <div className="upload-main">
                            {!uploadedFile ? (
                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">Upload Document</h2>
                                        <p className="card-description">
                                            Upload a prescription, medical document, or photo of your medication instructions
                                        </p>
                                    </div>
                                    <div
                                        className="upload-zone"
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => document.getElementById("file-upload")?.click()}
                                    >
                                        <div className="upload-content-inner">
                                            <div className="upload-text">
                                                <p className="upload-main-text">Drop your file here or click to browse</p>
                                                <p className="upload-sub-text">Supports: JPG, PNG, PDF files up to 10MB</p>
                                            </div>
                                        </div>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleFileUpload}
                                            className="file-input"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="card">
                                    <div className="card-header">
                                        <div className="file-header">
                                            <h2 className="card-title">Uploaded Document</h2>
                                            <button className="remove-button" onClick={removeFile}>
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="file-info">
                                        <div className="file-details">
                                            <span className="file-icon">📋</span>
                                            <div className="file-meta">
                                                <p className="file-name">{uploadedFile.name}</p>
                                                <p className="file-size">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <span className="file-status">Ready</span>
                                        </div>

                                        {!isProcessed && !isProcessing && (
                                            <div className="process-section">
                                                <button onClick={processDocument} className="btn btn-primary w-full">
                                                    Process Document
                                                </button>
                                            </div>
                                        )}

                                        {isProcessing && (
                                            <div className="processing-section">
                                                <div className="progress-info">
                                                    <span>Processing document...</span>
                                                    <span>{processingProgress}%</span>
                                                </div>
                                                <div className="progress">
                                                    <div className="progress-bar" style={{ width: `${processingProgress}%` }}></div>
                                                </div>
                                                <p className="progress-description">AI is extracting medication information from your document</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Extracted Information */}
                            {isProcessed && extractedData.length > 0 && (
                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">Extracted Medication Information</h2>
                                        <p className="card-description">Review the information extracted from your document</p>
                                    </div>
                                    <div className="extracted-medications horizontal-scroll">
                                        {extractedData.map((medication, index) => (
                                            <div key={index} className="medication-card">
                                                <div className="medication-header">
                                                    <h3 className="medication-name">{medication.drug_name}</h3>
                                                    <span className="dosage-badge">{medication.dosage}</span>
                                                </div>

                                                <div className="medication-details">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Timing</span>
                                                        <span className="detail-value">{medication.timing || "-"}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Start Date</span>
                                                        <span className="detail-value">{medication.start_date || "-"}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">End Date</span>
                                                        <span className="detail-value">{medication.end_date || "-"}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Advice:</span>
                                                        <span className="detail-value">{medication.advice || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="notes-section">
                                        <div className="form-group">
                                            <label htmlFor="notes" className="form-label">
                                                Additional Notes (Optional)
                                            </label>
                                            <textarea
                                                id="notes"
                                                placeholder="Add any additional notes about your medication schedule or special instructions..."
                                                value={additionalNotes}
                                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                                className="form-textarea"
                                                rows="3"
                                            />
                                        </div>

                                        <button onClick={setupReminders} className="btn btn-primary w-full">
                                            Set Medication Reminders
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="upload-sidebar">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">How It Works</h3>
                                </div>
                                <div className="how-it-works-upload">
                                    <div className="step-item">
                                        <div className="step-content">
                                            <h4 className="step-title">1. Upload Document</h4>
                                            <p className="step-description">Upload your prescription or medication instructions</p>
                                        </div>
                                    </div>

                                    <div className="step-item">
                                        <div className="step-content">
                                            <h4 className="step-title">2. AI Processing</h4>
                                            <p className="step-description">Our AI extracts medication details automatically</p>
                                        </div>
                                    </div>

                                    <div className="step-item">
                                        <div className="step-content">
                                            <h4 className="step-title">3. Set Reminders</h4>
                                            <p className="step-description">Automated reminders based on your schedule</p>
                                        </div>
                                    </div>

                                    <div className="step-item">
                                        <div className="step-content">
                                            <h4 className="step-title">4. Get Notified</h4>
                                            <p className="step-description">Receive timely medication reminders</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <div className="alert-icon">🔒</div>
                                <div className="alert-content">
                                    <strong>Privacy Notice:</strong> Your documents are processed securely and are not stored permanently.
                                    All data is encrypted and handled according to healthcare privacy standards.
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Supported Documents</h3>
                                </div>
                                <div className="supported-docs">
                                    <div className="doc-item">
                                        <span className="doc-icon">✅</span>
                                        <span>Prescription forms</span>
                                    </div>
                                    <div className="doc-item">
                                        <span className="doc-icon">✅</span>
                                        <span>Medication labels</span>
                                    </div>
                                    <div className="doc-item">
                                        <span className="doc-icon">✅</span>
                                        <span>Doctor's instructions</span>
                                    </div>
                                    <div className="doc-item">
                                        <span className="doc-icon">✅</span>
                                        <span>Hospital discharge papers</span>
                                    </div>
                                    <div className="doc-item">
                                        <span className="doc-icon">✅</span>
                                        <span>Medication schedules</span>
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

export default UploadPage
