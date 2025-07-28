from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from schemas.schemas import UserOut, UserUpdate
from auth.utils import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me/update", response_model=UserOut)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    print("Received update data:", user_update.dict(exclude_unset=True))  # Debug log
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    print("Updated user:", current_user)  # Debug log
    return current_user
