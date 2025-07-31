import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import "./ChatPage.css"
import myIcon from '../assets/icons/logo.png';
import assistantIcon from "../assets/icons/icons8-assistant-32.png"
import userIcon from "../assets/icons/icons8-user-32.png"
import sentButtonIcon from "../assets/icons/icons8-sent-32.png"
import uploadIcon from "../assets/icons/icons8-upload-96.png"
import dashboardIcon from "../assets/icons/icons8-dashboard-layout-16.png"
const ChatPage = () => {
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const sendInitialMessage = async () => {
            setIsTyping(true)
            try {
                // Read prediction data from localStorage if any
                const predictionData = localStorage.getItem("predictionResult")
                // let drug = null
                let disease = null
                if (predictionData) {
                    const prediction = JSON.parse(predictionData)
                    disease = prediction.predicted_disease
                }
                console.log(disease)
                const response = await fetch("/chat/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        message: "start",
                        disease: disease
                    })
                })

                if (!response.ok) {
                    throw new Error("Failed to get initial AI message")
                }

                const data = await response.json()

                const initialMessage = {
                    id: 1,
                    type: "ai",
                    content: data.bot || "Hello! How can I assist you today?",
                    timestamp: new Date(),
                }
                setMessages([initialMessage])
            } catch (error) {
                const errorMessage = {
                    id: 1,
                    type: "ai",
                    content: "Error: Unable to get response from AI service.",
                    timestamp: new Date(),
                }
                setMessages([errorMessage])
            } finally {
                setIsTyping(false)
            }
        }
        sendInitialMessage()
    }, [])

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return

        const userMessage = {
            id: messages.length + 1,
            type: "user",
            content: inputMessage,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputMessage("")
        setIsTyping(true)

        const predictionData = localStorage.getItem("predictionResult")
        // let drug = null
        let disease = null
        if (predictionData) {
            const prediction = JSON.parse(predictionData)
            disease = prediction.predicted_disease
        }

        try {
            const response = await fetch("/chat/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ message: inputMessage, disease: disease, drug: inputMessage })
            })

            if (!response.ok) {
                throw new Error("Failed to get AI response")
            }

            const data = await response.json()

            const aiResponse = {
                id: messages.length + 2,
                type: "ai",
                content: data.bot || data.answer || "Sorry, I couldn't understand that.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiResponse])
        } catch (error) {
            const errorResponse = {
                id: messages.length + 2,
                type: "ai",
                content: "Error: Unable to get response from AI service.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorResponse])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }


    return (
        <div className="chat-page">
            {/* Header */}
            <header className="chat-header">
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

            <div className="chat-container">
                <div className="chat-main">
                    {/* Chat Header */}
                    <div className="chat-info">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Medication Information Assistant</h2>
                                <div className="warning-notice">
                                    <span>For educational purposes only - Always consult healthcare providers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="messages-container">
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type === "user" ? "message-user" : "message-ai"}`}>
                                <div className="message-content">
                                    <div className="message-avatar">
                                        {message.type === "user" ? (
                                            <div className="avatar">
                                                <img src={userIcon} alt="Icon" width={25} height={25} />
                                            </div>
                                        ) : (
                                            <div className="avatar ai-avatar">
                                                <img src={assistantIcon} alt="Icon" width={32} height={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="message-bubble">
                                        <div className="message-text">{message.content}</div>
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="message message-ai">
                                <div className="message-content">
                                    <div className="message-avatar">
                                        <div className="avatar ai-avatar">🤖</div>
                                    </div>
                                    <div className="message-bubble">
                                        <div className="typing-indicator">
                                            <div className="loading-dots">
                                                <div className="loading-dot"></div>
                                                <div className="loading-dot"></div>
                                                <div className="loading-dot"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="chat-input">
                        <div className="card">
                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Ask about medication dosages, side effects, about your any drug..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="message-input"
                                />
                                <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} className="send-button">
                                    <img src={sentButtonIcon} alt="Icon" width={32} height={32} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="chat-sidebar">
                    <div className="sidebar-content">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Important Reminders</h3>
                            </div>
                            <div className="reminders">
                                <div className="reminder-item reminder-warning">
                                    <p>
                                        <strong>Always consult</strong> your healthcare provider before starting any new medication.
                                    </p>
                                </div>
                                <div className="reminder-item reminder-info">
                                    <p>
                                        <strong>Keep records</strong> of all medications and dosages you take.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Next Steps</h3>
                            </div>
                            <div className="next-steps">
                                <Link to="/upload" className="btn btn-outline w-full">
                                    <img src={uploadIcon} alt="Icon" width={20} height={20} style={{fontWeight:"bold"}}/>
                                    Upload Prescription
                                </Link>
                                <Link to="/dashboard" className="btn btn-outline w-full">
                                    <img src={dashboardIcon} alt="Icon" width={16} height={16} />
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage