from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from db.models import User
from schemas.schemas import ChatRequest, DiseaseRequest
from db.database import get_db
from auth.auth_routes import get_current_user
from services.drug_info import chat_about_drug, mapped_disease, mapped_drugs_list

router = APIRouter(prefix="/chat", tags=["Chat with AI"])

def get_drugs_list(disease):
    mappinng_list = mapped_disease()
    mappedDisease = mappinng_list.get(disease)
    matched_drugs = mapped_drugs_list(mappedDisease)
    return matched_drugs


@router.post("/", tags=["AI Chat"])
async def chat_with_bot(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delegates all chat logic to the service layer.
    Handles:
    - Greeting + suggested drugs
    - Context-aware drug Q&A
    - DB logging (inside the service)
    """
    try:
        response = await chat_about_drug(
            user=current_user,
            message=body.message,
            db=db,
            disease=body.disease,
            drug=body.drug,
            suggested_drugs=get_drugs_list(disease=body.disease)
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))