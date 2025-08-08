import os
import json
import httpx, pandas as pd
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session

from db.models import ChatLog, User

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-70b-8192"
GUIDELINE_FILE = "./data/drugs-Info.json"
mapping_file = "./data/Mapped_diseases.json"
INDEX_PATH = "./faiss_store"

# ✅ Use HF Embeddings
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ✅ Load FAISS index
vectorstore = FAISS.load_local(INDEX_PATH, embedding_model)


def load_guideline_data() -> Dict[str, Dict[str, str]]:
    try:
        with open(GUIDELINE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise Exception(f"Failed to load guidelines: {e}")

def mapped_disease():
    try:
        with open(mapping_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise Exception(f"Failed to load guidelines: {e}")
    
def mapped_drugs_list(disease):
    drug_df = pd.read_csv("./data/cleaned_drug_disease.csv")
    drugs_list = drug_df[drug_df['disease'] == disease]['drug'].unique().tolist()
    return drugs_list
    

async def query_llm(messages: List[Dict[str, str]]) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": messages
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        if res.status_code != 200:
            raise Exception("Groq API failed: " + res.text)

        return res.json()["choices"][0]["message"]["content"]


async def chat_about_drug(
    user: User,
    message: str,
    db: Session,
    disease: Optional[str],
    drug: Optional[str] = None,
    suggested_drugs: Optional[List[str]] = None,
    memory_limit: int = 10
) -> Dict[str, str]:

    user_name = user.full_name or "User"
    user_message = message.strip().lower()

    # ✅ Greeting logic
    if user_message in ["hi", "hii", "hello", "hey", "hy", "hyy", "start"]:
        user_short = user_name.split(" ")[0].lower()
        if suggested_drugs:
            drugs_str = "\n".join(suggested_drugs)
            return {
                "bot": f"Hello {user_short}! I see that based on your recent query about your symptoms, you got this condition as indicated: {disease}, according to that you are suggested these drugs below:\n{drugs_str}. \nWhich one would you like to ask about?"
            }
        return {
            "bot": f"Hello {user_short}! What would you like to know today?"
        }


    # ✅ Recent chat history (for memory)
    chat_history = (
        db.query(ChatLog)
        .filter(ChatLog.user_id == user.id)
        .order_by(ChatLog.timestamp.desc())
        .limit(memory_limit)
        .all()
    )
    chat_history.reverse()

    conversation = []
    for entry in chat_history:
        conversation.append({"role": "user", "content": entry.user_message + f"drug: {entry.drug_name}"})
        conversation.append({"role": "assistant", "content": entry.bot_response})

    # ✅ Semantic search via FAISS
    docs = vectorstore.similarity_search(user_message, k=5)
    context = "\n\n".join([doc.page_content for doc in docs])

    system_prompt = (
        "You are a helpful medical assistant.\n"
        "Use the following official drug guidelines to answer the question clearly, concisely, and safely:\n\n"
        f"{context}"
    )

    conversation.insert(0, {"role": "system", "content": system_prompt})
    conversation.append({"role": "user", "content": message})

    bot_reply = await query_llm(conversation)

    log_entry = ChatLog(
        user_id=user.id,
        drug_name=drug,
        user_message=message,
        bot_response=bot_reply,
        timestamp=datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()

    return {"answer": bot_reply}