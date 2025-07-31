from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import UserQuery, MedicationReminder
from auth.auth_routes import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/user")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    queries_resolved = db.query(UserQuery).filter(UserQuery.user_id == current_user.id).count()
    active_medications = db.query(MedicationReminder).filter(
        MedicationReminder.user_id == current_user.id,
        MedicationReminder.status == "active"
    ).count()
    reminders_set = db.query(MedicationReminder).filter(MedicationReminder.user_id == current_user.id).count()

    return {
        "queries_resolved": queries_resolved,
        "active_medications": active_medications,
        "reminders_set": reminders_set
    }
