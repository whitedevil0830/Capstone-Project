from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
import shutil, os, json
from datetime import datetime

from db.database import get_db
from db.models import Prescription, MedicationReminder, User
from schemas.schemas import PrescriptionOut
from auth.auth_routes import get_current_user
from utils.ocr import extract_text_from_image, extract_text_from_pdf
from utils.pdf_img_parser import extract_prescription_data

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

UPLOAD_DIR = "uploads/prescriptions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=PrescriptionOut)
async def upload_prescription(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["png", "jpg", "jpeg", "pdf"]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload an image or PDF.")

    file_bytes = file.file.read()
    if file_ext == "pdf":
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        extracted_text = extract_text_from_image(file_bytes)

    # Save the file locally
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    file_name = f"{current_user.id}_{timestamp}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Save to DB
    prescription = Prescription(
        user_id=current_user.id,
        file_name=file_name,
        extracted_data={"text": extracted_text}
    )
    
    try:
        med_schedule_result = await extract_prescription_data(file_path)
        med_schedule = med_schedule_result.get("medications", [])
        # general_advice = med_schedule_result.get("general_advice", "")
        prescription.extracted_data = {
            "text": extracted_text,
            "medications": med_schedule,
            # "general_advice": general_advice
        }

        for item in med_schedule:
            # Convert start_date and end_date to date objects or None
            start_date_str = item.get("start_date")
            end_date_str = item.get("end_date")

            def parse_date(date_str):
                if date_str and date_str.strip():
                    try:
                        return datetime.strptime(date_str, "%Y-%m-%d").date()
                    except Exception:
                        return None
                return None

            reminder = MedicationReminder(
                user_id=current_user.id,
                drug_name=item.get("drug_name"),
                dosage=item.get("dosage"),
                timing=item.get("timing"),
                start_date=parse_date(start_date_str),
                end_date=parse_date(end_date_str)
            )
            db.add(reminder)
        db.commit()
    except Exception as e:
        print("⚠️ Failed to extract medication schedule:", str(e))
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return prescription
