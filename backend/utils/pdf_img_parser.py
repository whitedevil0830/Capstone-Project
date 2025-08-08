# utils/pdf_parser.py

from utils.ocr import extract_text_from_image, extract_text_from_pdf
import os, httpx, json, re
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-70b-8192"

async def extract_prescription_data(filepath: str) -> dict:
    # Step 1: Load file
    with open(filepath, "rb") as f:
        file_bytes = f.read()

    # Step 2: Run OCR
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_image(file_bytes)

    # Step 3: Ask Groq to extract structured data
    prompt = f"""You're a medical assistant. Extract structured prescription info from this text in such 
    a way that you even can rectify the typos, also remember that for dosage if the medicine is in
    tablets or pills etc then rather than just "1" just add "1 tab" as the dosage or if its present 
    in amounts like 10mg, 5ml etc then keep it as those amounts only in dosage and also (if any)
    find and extract the additional (general) advices given to the user.

            Text: {raw_text}

            Return a JSON list like:
            [
                {{
                    "drug_name": "Paracetamol",
                    "dosage": "500mg",
                    "timing": "08:00, 14:00, 20:00",
                    "start_date": "16-07-2025",
                    "end_date": "20-07-2025",
                    "advice": "after food, before food",
                }},
                ...
            ]
            """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a helpful medical assistant."},
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        if response.status_code != 200:
            raise Exception("Groq API failed: " + response.text)
        content = response.json()["choices"][0]["message"]["content"]

    try:
        # Log raw content for debugging
        print("Groq LLM raw response content:", content)
        # Extract JSON part from the content by finding the first '[' and last ']'
        start_idx = content.find('[')
        end_idx = content.rfind(']')
        if start_idx == -1 or end_idx == -1:
            raise ValueError("No JSON array found in LLM response")
        json_str = content[start_idx:end_idx+1]

        # Remove comments and trailing commas to make JSON valid
        json_str = re.sub(r'//.*', '', json_str)  # remove line comments
        json_str = re.sub(r',\s*([\]}])', r'\1', json_str)  # remove trailing commas

        medications = json.loads(json_str)

        # Extract general additional advice from the content outside the JSON array
        # additional_advice_match = re.search(r'additional_advice"\s*:\s*"([^"]*)"', content, re.DOTALL)
        # additional_advice = ""
        # if additional_advice_match:
        #     # Clean the extracted advice string to remove invalid control characters
        #     raw_advice = additional_advice_match.group(1)
        #     additional_advice = re.sub(r'[\x00-\x1F\x7F]', '', raw_advice).strip()
        return {
            "raw_text": raw_text,
            "medications": medications
            # "general_advice": additional_advice
        }

    except Exception as e:
        print("Error parsing LLM response content:", content)
        raise ValueError("Failed to parse prescription structure from LLM: " + str(e))
