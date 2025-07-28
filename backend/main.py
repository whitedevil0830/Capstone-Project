from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.auth_routes import router as auth_router
from routes.user import router as user_router
from routes.symptoms import router as symptoms_router
from routes.predictions import router as prediction_router
from routes.prescriptions import router as prescription_router
from routes.reminders import router as reminder_router
from routes.chat import router as chat_router
from routes.symptoms_list import router as symptoms_list_router
from routes.stats import router as stats_router

from db.database import Base, engine

app = FastAPI(
    title="GoHealthy Backend",
    description="Symptom analysis → Disease prediction → Drug recommendation → Guideline chatbot → Alerts",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://172.16.0.2:3000"],  # frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(symptoms_router)
app.include_router(symptoms_list_router)
app.include_router(prediction_router)
app.include_router(prescription_router)
app.include_router(reminder_router)
app.include_router(chat_router)
app.include_router(stats_router)

@app.get("/")
def root():
    return {"message": "GoHealthy Backend is Live!"}