from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import MedicationReminder, User
from schemas.schemas import MedicationReminderCreate, MedicationReminderOut, MedicationReminderBase
from services.alert_scheduler import cancel_scheduled_alerts, schedule_medication_alerts
from uuid import UUID
from datetime import datetime
from typing import List
from auth.auth_routes import get_current_user

router = APIRouter(prefix="/reminders", tags=["Medication Reminders"])

@router.post("/create", response_model=MedicationReminderOut)
async def create_reminder(
    data: MedicationReminderBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    new_reminder = MedicationReminder(
        user_id=current_user.id,
        drug_name=data.drug_name,
        dosage=data.dosage,
        timing=data.timing,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status or "active",
        created_at=datetime.utcnow()
    )
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    
    schedule_medication_alerts(new_reminder)
    return new_reminder

@router.get("/", response_model=List[MedicationReminderOut])
async def get_user_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(MedicationReminder)
        .filter(MedicationReminder.user_id == current_user.id)
        .order_by(MedicationReminder.start_date.desc())
        .all()
    )

@router.put("/{reminder_id}", response_model=MedicationReminderOut)
def update_reminder(
    reminder_id: UUID,
    updated_data: MedicationReminderBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = (
        db.query(MedicationReminder)
        .filter(MedicationReminder.id == reminder_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    if reminder.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized user.")

    for field, value in updated_data.dict().items():
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)
    return reminder

@router.delete("/{reminder_id}/cancel", response_model=MedicationReminderOut)
def cancel_reminder(
    reminder_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = (
        db.query(MedicationReminder)
        .filter(MedicationReminder.id == reminder_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    if reminder.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized user.")

    reminder.status = "cancelled"
    db.commit()
    
    cancel_scheduled_alerts(reminder_id)
    return reminder
