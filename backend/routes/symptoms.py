from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from db.database import get_db
from db.models import SymptomDataset
from schemas.schemas import SymptomDatasetIn, SymptomDatasetOut
from auth.auth_routes import get_current_user

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])

@router.post("/add", response_model=SymptomDatasetOut)
def add_symptom_data(
    symptom_data: SymptomDatasetIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    new_data = SymptomDataset(
        symptoms=symptom_data.symptoms,
        disease=symptom_data.disease,
        source=symptom_data.source or "user"
    )
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

@router.get("/all", response_model=list[SymptomDatasetOut])
def get_all_symptom_data(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(SymptomDataset).all()