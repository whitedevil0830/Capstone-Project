from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from uuid import UUID
from db.database import get_db
from db.models import Prediction, UserQuery, SymptomDataset, User
from schemas.schemas import PredictionCreate, PredictionOut, UserQueryOut, PredictionCreate
from services.prediction import prepare_model_input, predict_disease
from auth.auth_routes import get_current_user
from typing import List, Dict
import json

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict")
def predict_disease_endpoint(
    symptoms: Dict[str, int] = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    # Fetch user personal details from database
    user_details = db.query(User).filter(User.id == user.id).first()
    if not user_details:
        raise HTTPException(status_code=404, detail="User details not found")

    def prepareGenderInput(gender):
        if gender == "male":
            return "M"
        elif gender == "female":
            return "F"
        else:
            return "Any"
    print(user_details)
    # Prepare model input
    input_df = prepare_model_input(
        symptom_list=[symptom for symptom, val in symptoms.items() if val == 1],
        gender=prepareGenderInput(user_details.gender),
        smoking=user_details.smoking,
        age=user_details.age,
        alcohol=user_details.alcohol_consumption,
        height_cm=user_details.height_cm,
        weight_kg=user_details.weight_kg
    )
    # Predict disease
    predicted_disease, confidence, top_3 = predict_disease(input_df)

    # Update symptoms record with predicted disease
    symptom_record = db.query(SymptomDataset).filter(
        SymptomDataset.symptoms == symptoms,
        SymptomDataset.source == "user"
    ).order_by(SymptomDataset.id.desc()).first()

    if symptom_record:
        symptom_record.disease = predicted_disease
        db.commit()
        db.refresh(symptom_record)

    # Validate symptoms JSON
    try:
        symptoms_json = json.loads(json.dumps(symptoms))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid symptoms data: {e}")

    # Create user query record
    user_query = UserQuery(
        user_id=user.id,
        symptoms=symptoms_json
    )
    
    print(f"UserQuery before commit: id={user_query.user_id}, symptoms={user_query.symptoms}")
    
    db.add(user_query)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database commit error: {e}")
    db.refresh(user_query)

    # Create prediction record
    prediction_data = PredictionCreate(
        top_prediction=predicted_disease,
        confidence=confidence,
        top_3=[{label: conf} for label, conf in top_3],
        query_id=user_query.id
    )
    db_prediction = Prediction(**prediction_data.dict())
    db.add(db_prediction)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database commit error: {e}")
    db.refresh(db_prediction)

    return {
        "predicted_disease": predicted_disease,
        "confidence": confidence,
        "top_3": top_3
    }

@router.get("/user/{user_id}", response_model=List[PredictionOut])
def get_user_predictions(user_id: UUID, db: Session = Depends(get_db)):
    user_queries = db.query(UserQuery).filter(UserQuery.user_id == user_id).all()
    query_ids = [q.id for q in user_queries]
    predictions = db.query(Prediction).filter(Prediction.query_id.in_(query_ids)).all()
    return predictions

@router.get("/user_queries", response_model=List[UserQueryOut])
async def get_user_queries_with_predictions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Check if user is authenticated
    if not user:
        return HTTPException(status_code=401, detail="Not authenticated")

    user_queries = db.query(UserQuery).filter(UserQuery.user_id == user.id).all()
    results = []
    for query in user_queries:
        prediction = db.query(Prediction).filter(Prediction.query_id == query.id).first()
        try:
            # Add logging for submitted_at and symptoms
            print(f"UserQuery id={query.id} submitted_at={query.submitted_at} symptoms={query.symptoms}")
            user_query_out = UserQueryOut(
                id=query.id,
                user_id=query.user_id,
                symptoms=query.symptoms,
                submitted_at=query.submitted_at,
                prediction=prediction.top_prediction if prediction else "N/A"
            )
            results.append(user_query_out)
        except Exception as e:
            # Log and skip invalid entries
            print(f"Skipping invalid user query {query.id} due to error: {e}")
    return results

@router.get("/query/{query_id}", response_model=PredictionOut)
def get_prediction_by_query(query_id: UUID, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.query_id == query_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction