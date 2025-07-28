import numpy as np
import pandas as pd
import joblib
from typing import List, Tuple
from keras.models import load_model

model = load_model("./data/Model Artifacts/disease_model.keras")
label_encoder = joblib.load("./data/Model Artifacts/Saved Assets/label_encoder.pkl")
le_gender = joblib.load("./data/Model Artifacts/Saved Assets/le_gender.pkl")
le_smoking = joblib.load("./data/Model Artifacts/Saved Assets/le_smoking.pkl")
le_alcohol = joblib.load("./data/Model Artifacts/Saved Assets/le_alcohol.pkl")
scaler = joblib.load("./data/Model Artifacts/Saved Assets/scaler.pkl")

input_columns = joblib.load("./data/Model Artifacts/Saved Assets/input_columns.pkl")
non_symptom_cols = [
    'gender_enc', 'smoking_enc', 'alcohol_enc',
    'age_scaled', 'height_scaled', 'weight_scaled'
]

def prepare_model_input(symptom_list: List[str], 
                         gender: str,
                         smoking: str,
                         alcohol: str,
                         age: int,
                         height_cm: float,
                         weight_kg: float) -> pd.DataFrame:
    """
    Prepare model input from selected symptoms and user demographics.
    """
    inputs = {col: 0 for col in input_columns if col not in non_symptom_cols}

    for symptom in symptom_list:
        if symptom in inputs:
            inputs[symptom] = 1

    if gender and gender in le_gender.classes_:
        inputs['gender_enc'] = le_gender.transform([gender])[0]
    else:
        inputs['gender_enc'] = le_gender.transform([le_gender.classes_[0]])[0]
 
    # Handle missing or unknown smoking
    if smoking and smoking in le_smoking.classes_:
        inputs['smoking_enc'] = le_smoking.transform([smoking])[0]
    else:
        inputs['smoking_enc'] = le_smoking.transform([le_smoking.classes_[0]])[0]

    # Handle missing or unknown alcohol
    if alcohol and alcohol in le_alcohol.classes_:
       inputs['alcohol_enc'] = le_alcohol.transform([alcohol])[0]
    else:
        inputs['alcohol_enc'] = le_alcohol.transform([le_alcohol.classes_[0]])[0]
    
    scaled_values = scaler.transform([[age, height_cm, weight_kg]])
    inputs['age_scaled'] = scaled_values[0][0]
    inputs['height_scaled'] = scaled_values[0][1]
    inputs['weight_scaled'] = scaled_values[0][2]

    return pd.DataFrame([inputs])

def predict_disease(input_df: pd.DataFrame) -> Tuple[str, float, List[Tuple[str, float]]]:
    input_array = np.array(input_df).reshape(1, -1)
    predicted_probs = model.predict(input_array)[0]

    top_3_indices = np.argsort(predicted_probs)[-3:][::-1]
    top_3_labels = label_encoder.inverse_transform(top_3_indices)
    top_3_conf = predicted_probs[top_3_indices]

    top_prediction = top_3_labels[0]
    confidence = float(top_3_conf[0])
    top_3 = [(top_3_labels[i], float(top_3_conf[i])) for i in range(3)]

    return top_prediction, confidence, top_3