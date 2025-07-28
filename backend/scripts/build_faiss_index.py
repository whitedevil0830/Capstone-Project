import os, json
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

load_dotenv()

GUIDELINE_FILE = "C:/Users/KIIT/Navikenz/Capstone Project/guideline_app/backend/data/drugs-Info.json"
INDEX_PATH = "./faiss_store"

def build_index():
    with open(GUIDELINE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    docs = []
    for drug, sections in data.items():
        content = "\n".join([f"{k}: {v}" for k, v in sections.items() if v])
        docs.append(Document(page_content=content, metadata={"drug": drug}))

    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(docs, embedding=embeddings)
    vectorstore.save_local(INDEX_PATH)

    print(f"FAISS index built and saved to {INDEX_PATH}")

if __name__ == "__main__":
    build_index()