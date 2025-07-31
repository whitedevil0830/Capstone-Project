from sqlalchemy import Column, String, Integer, Float, Text, Date, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4())) 
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Integer, nullable=True)
    smoking = Column(String, nullable=True)
    alcohol_consumption = Column(String, nullable=True)
    blood_type = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    queries = relationship("UserQuery", back_populates="user", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete")
    reminders = relationship("MedicationReminder", back_populates="user", cascade="all, delete")
    chats = relationship("ChatLog", back_populates="user", cascade="all, delete")

class SymptomDataset(Base):
    __tablename__ = "symptoms_dataset"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    symptoms = Column(JSON, nullable=False)
    disease = Column(String, nullable=False)
    source = Column(String, default='original')

class UserQuery(Base):
    __tablename__ = "user_queries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    symptoms = Column(JSON, nullable=False)

    user = relationship("User", back_populates="queries")
    prediction = relationship("Prediction", back_populates="query", uselist=False, cascade="all, delete")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query_id = Column(String, ForeignKey("user_queries.id"))
    top_prediction = Column(String, nullable=False)
    confidence = Column(Float)
    top_3 = Column(JSON)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())

    query = relationship("UserQuery", back_populates="prediction")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    file_name = Column(String)
    extracted_data = Column(JSON)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prescriptions")

class MedicationReminder(Base):
    __tablename__ = "medication_reminders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    drug_name = Column(String)
    dosage = Column(String)
    timing = Column(String)  # e.g., "08:00, 14:00"
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String, default='active')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reminders")

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    drug_name = Column(String)
    user_message = Column(Text)
    bot_response = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chats")
