# Capstone Project: AI-Based Disease Prediction and Report Generation

This project consists of a **ReactJS** frontend, a **FastAPI** backend integrated with **SQLite** Database, which together provides the following benefits or features to the user.

---

## Features

- Condition prediction from user-selected symptoms and user profile.
- Interaction with our Chatbot to chat about drugs related to that condition predicted.
- Upload prescription and get your reminders set for the medications in the prescription.
- Generate a Report based on your personal profile and the symptoms analysis.

---

## Project Structure
```bash
  CAPSTONE-PROJECT/
  ├── backend/
  │ ├── auth/
  │ ├── data/
  │ ├── db/
  │ ├── faiss_store/
  │ ├── routes/
  │ ├── schemas/
  │ ├── scripts/
  │ ├── services/
  │ ├── uploads/
  │ ├── utils/
  │ ├── id_map.json
  │ └── main.py
  │
  ├── frontend/
  │ ├── node_modules/
  │ ├── public/
  │ ├── src/
  │ ├── package.json
  │ └── package-lock.json
  │
  ├── Scripts/
  │ └── Disease_prediction.ipynb  <- The prediction model lives here!
  │
  ├── requirement.txt
  └── README.md
```

---

## Installation and Running:

### Alert!
- ***if you don't have npm in your system, follow the steps and install it using this link:*** [Install npm](https://www.geeksforgeeks.org/node-js/how-to-download-and-install-node-js-and-npm/)
- ***if you don't have pip in your system, follow the steps and install it using this link:*** [Install pip](https://www.geeksforgeeks.org/installation-guide/how-to-install-pip-on-windows/)

### Backend setup (In one terminal):

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   pip install -r ../requirement.txt
   ```
3. Run the backend application:
   ```bash
   uvicorn main:app --reload
   ```
### Frontend setup (In new terminal (let the other terminal with backend continue running))
   
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   npm install typed.js jspdf
   ```
3. Run the backend application:
   ```bash
   npm start
   ```
## Key insights on the approch of my project:
- PDF report generation with **jsPDF**.
- Typing animation using **typed.js**.
- Backend powered by FastAPI with FAISS for similarity search.
- Integrated Neural Network model for accurate predictions.
- Upload and process files securely.
- Clean and responsive ReactJS frontend. 
