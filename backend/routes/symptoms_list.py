from fastapi import APIRouter, HTTPException
import pickle
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/symptoms_list", tags=["SymptomsList"])

@router.get("/")
def get_symptoms_list():
    file_path = "./data/Model Artifacts/Saved Assets/symptoms_list.pkl"
    try:
        with open(file_path, 'rb') as file:
            symptoms_list = pickle.load(file)
        return JSONResponse(content=symptoms_list)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Symptoms list file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
