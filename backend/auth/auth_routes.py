from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from db.database import get_db
from db.models import User
from schemas.schemas import UserCreate, UserLogin, TokenResponse, UserOut, UserUpdate
from auth import utils

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/signup", response_model=TokenResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = User(
        email=user.email,
        full_name=user.full_name,
        password_hash=utils.hash_password(user.password),
        age=user.age,
        gender=user.gender,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg,
        smoking=user.smoking,
        alcohol_consumption=user.alcohol_consumption
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = utils.create_access_token({"sub": new_user.email})
    return {"access_token": token}

@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    data: UserLogin = None,
    db: Session = Depends(get_db)
):
    # Handle both OAuth2 form and JSON
    if form_data:
        email = form_data.username  # OAuth2 uses 'username' field
        password = form_data.password
    else:
        email = data.email
        password = data.password
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not utils.verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = utils.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = utils.decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token decode error")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.put("/me/update", response_model=UserOut)
def update_current_user(update_data: UserUpdate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = utils.decode_token(token)
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user