from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, List, Dict, Union, Tuple
from uuid import UUID
from datetime import datetime, date

# -------------------- User --------------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    smoking: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    smoking: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None

class UserOut(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

# -------------------- Auth --------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str

# -------------------- Symptom Dataset --------------------
class SymptomDatasetIn(BaseModel):
    symptoms: dict  # JSON
    disease: str
    source: Optional[str] = "user"

class SymptomDatasetOut(SymptomDatasetIn):
    id: int

# -------------------- User Queries --------------------
class UserQueryIn(BaseModel):
    user_id: UUID
    symptoms: dict

class UserQueryOut(BaseModel):
    id: UUID
    user_id: UUID
    symptoms: dict
    submitted_at: datetime
    prediction: str = "N/A"  # Added prediction field to accommodate prediction data

    class Config:
        orm_mode = True

# -------------------- Prediction --------------------
class PredictionBase(BaseModel):
    top_prediction: str
    confidence: float
    top_3: List[Dict[str, float]]  # e.g., [{"Disease A": 0.91}, {"Disease B": 0.82}]

    class Config:
        orm_mode = True

# For inserting a prediction into DB
class PredictionCreate(PredictionBase):
    query_id: str

# For returning a prediction from DB
class PredictionOut(PredictionBase):
    id: str
    query_id: str
    predicted_at: datetime

# Input from user: symptoms + prediction result
class PredictionInput(BaseModel):
    data: List[int]

    class Config:
        schema_extra = {
            "example": {
                "data": [0, 1, 0, 1, ..., 23.2]
            }
        }

# Output returned after model prediction
class PredictionOutput(BaseModel):
    top_prediction: str
    confidence: float
    top_3: List[Dict[str, float]]  # e.g., [{"Flu": 0.91}, {"Cold": 0.81}, {"COVID-19": 0.77}]

    class Config:
        orm_mode = True

# -------------------- Prescription --------------------
class PrescriptionUpload(BaseModel):
    user_id: UUID
    file_name: str

class PrescriptionOut(BaseModel):
    id: UUID
    user_id: UUID
    file_name: str
    extracted_data: Optional[dict]
    uploaded_at: datetime

    class Config:
        orm_mode = True

# -------------------- Medication Reminder --------------------
class MedicationReminderBase(BaseModel):
    drug_name: str
    dosage: Optional[str]
    timing: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = 'active'

class MedicationReminderCreate(MedicationReminderBase):
    user_id: UUID

class MedicationReminderOut(MedicationReminderBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

# -------------------- Chat Logs --------------------
class ChatLogIn(BaseModel):
    user_id: UUID
    drug_name: str
    user_message: str
    bot_response: str

class ChatLogOut(ChatLogIn):
    id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True

# ---------- DRUG CHATBOT ----------
class DiseaseRequest(BaseModel):
    disease: str

class ChatRequest(BaseModel):
    message: str
    disease: Optional[str] = None
    drug: Optional[str] = None
    suggested_drugs: Optional[List[str]] = None

class ChatResponse(BaseModel):
    answer: str