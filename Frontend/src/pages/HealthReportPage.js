import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";
import myIcon from '../assets/icons/logo.png';

import "./HealthReportPage.css"
const HealthReportPage = () => {
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        console.log(data)
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUserQueries = async () => {
      try {
        const response = await fetch("/predictions/user_queries", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user queries");
        }
        const data = await response.json();
        setQueries(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
    fetchUserQueries();
  }, []);

  const generatePDF = () => {
    if (!user) {
      alert("User data not loaded yet");
      return;
    }
    const doc = new jsPDF();

    // Company name at top
    doc.setFontSize(18);
    doc.text("GoHealthy", 105, 20, null, null, "center");
    // Bold line under company name
    doc.setLineWidth(0.8);
    doc.line(20, 25, 190, 25);

    // User personal details section
    doc.setFontSize(14);
    doc.text("Personal Details", 10, 40);
    // Simple line under personal details
    doc.setLineWidth(0.3);
    doc.line(10, 43, 190, 43);
    doc.setFontSize(12);
    const bmi =
      user.weight_kg && user.height_cm
        ? (user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(2)
        : "N/A";
    const personalDetails = [
      `Name: ${user.full_name || "N/A"}`,
      `Age: ${user.age || "N/A"}`,
      `Gender: ${user.gender || "N/A"}`,
      `Height: ${user.height_cm || "N/A"} cm`,
      `Weight: ${user.weight_kg || "N/A"} kg`,
      `BMI: ${bmi}`,
      `Smoking: ${user.smoking || "N/A"}`,
      `Alcohol Consumption: ${user.alcohol_consumption || "N/A"}`,
    ];
    personalDetails.forEach((line, index) => {
      doc.text(line, 10, 50 + index * 7);
    });

    // Symptoms and predictions section
    doc.setFontSize(14);
    doc.text("Symptoms and Predictions", 10, 50 + personalDetails.length * 7 + 10);
    doc.setFontSize(12);
    if (queries.length === 0) {
      doc.text("No queries found.", 10, 50 + personalDetails.length * 7 + 20);
    } else {
      let y = 50 + personalDetails.length * 7 + 20;
      queries.forEach((query, idx) => {
        const symptoms = Object.entries(query.symptoms)
          .filter(([symptom, value]) => value === 1)
          .map(([symptom]) => symptom)
          .join(", ");
        // Wrap long text lines to avoid cutting off
        const splitSymptoms = doc.splitTextToSize(`Symptoms: ${symptoms}`, 180);
        doc.text(`Query ${idx + 1}:`, 10, y);
        y += 7;
        doc.text(splitSymptoms, 20, y);
        y += splitSymptoms.length * 7;
        doc.text(`Prediction: ${query.prediction}`, 20, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    // Generate PDF blob and create URL for preview
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  return (
    <div className="health-report-page">
      <header className="health-header-content">
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
      <div className="welcome-section">
        <h1 className="welcome-title">
          Congratulations {user ? user.full_name.split(" ")[0] : "User"} on taking a step towards maintaining a good health.
        </h1>
        <p className="welcome-description">
          You're on right the track by keeping the track of your health.
          Click on the button below to get your health report ready just with a blink of an eye.
        </p>
      {!pdfUrl && (
        <button className="btn btn-primary" onClick={generatePDF}>
          Generate your health report
        </button>
      )}

      {pdfUrl && (
      <div className="pdf-preview-container">
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            title="Health Report Preview"
            width="100%"
            height="600px"
          />
          <div className="pdf-actions">
            <button className="btn btn-outline" onClick={() => setPdfUrl(null)}>
              Close Preview
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HealthReportPage;
