from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from db.models import MedicationReminder
from datetime import datetime, date
import logging

scheduler = BackgroundScheduler()
scheduler.start()

# Logging setup
logger = logging.getLogger("medication_reminder")
logger.setLevel(logging.INFO)

# Function to simulate alert
def send_alert(user_id, drug_name, dosage):
    logger.info(f"[ALERT] User {user_id}: Time to take {drug_name} ({dosage})")


def schedule_medication_alerts(reminder: MedicationReminder):
    """
    Schedule alerts based on medication reminder object.
    """
    if reminder.status != "active":
        return

    # Only schedule alerts if start_date is present
    if not reminder.start_date or not reminder.end_date:
        logger.info(f"No start_date or end_date for reminder {reminder.id}, skipping scheduling.")
        return

    # Parse timing string: "08:00, 14:00" or "Morning, Night"
    times = [t.strip() for t in reminder.timing.split(",")]

    for t in times:
        try:
            # Schedule alert based on start_date only, ignoring time for scheduling
            trigger = CronTrigger(year=reminder.start_date.year,
                                  month=reminder.start_date.month,
                                  day=reminder.start_date.day,
                                  hour=0,
                                  minute=0)
            job_id = f"{reminder.id}-{t}"

            scheduler.add_job(
                func=send_alert,
                trigger=trigger,
                args=[reminder.user_id, reminder.drug_name, reminder.dosage or "-"],
                id=job_id,
                replace_existing=True,
            )

            logger.info(f"Scheduled alert for {reminder.drug_name} on {reminder.start_date} (Job ID: {job_id})")
        except Exception as e:
            logger.warning(f"Failed to schedule alert for time '{t}': {e}")


def cancel_scheduled_alerts(reminder_id: str):
    """
    Cancel all jobs associated with a reminder.
    """
    for job in scheduler.get_jobs():
        if job.id.startswith(str(reminder_id)):
            job.remove()
            logger.info(f"Cancelled alert job: {job.id}")


def check_and_cleanup_old_reminders(db: Session):
    """
    Mark reminders as completed if end date has passed.
    """
    today = date.today()
    reminders = db.query(MedicationReminder).filter(
        MedicationReminder.status == "active",
        MedicationReminder.end_date < today
    ).all()

    for rem in reminders:
        rem.status = "completed"
        db.commit()
        cancel_scheduled_alerts(rem.id)
        logger.info(f"Marked reminder {rem.id} as completed")
