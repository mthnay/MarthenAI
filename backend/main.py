import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from llama_cpp import Llama

# Loglama ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("marthen-backend")

app = FastAPI(title="Marthen AI Independent Engine")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model değişkeni
llm = None
MODEL_PATH = "backend/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf"

def load_model():
    global llm
    if os.path.exists(MODEL_PATH):
        try:
            logger.info(f"Model yükleniyor: {MODEL_PATH}")
            # n_gpu_layers=-1 Mac (Metal) için tüm katmanları GPU'ya taşır
            llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=2048,
                n_gpu_layers=-1,
                verbose=False
            )
            logger.info("Model başarıyla yüklendi!")
        except Exception as e:
            logger.error(f"Model yüklenirken hata oluştu: {e}")
    else:
        logger.warning(f"Model dosyası bulunamadı: {MODEL_PATH}")

@app.on_event("startup")
async def startup_event():
    load_model()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.get("/")
async def root():
    status = "online" if llm else "model_missing"
    return {
        "status": status,
        "message": "Marthen AI Independent Engine is running",
        "model_loaded": llm is not None
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    global llm
    if not llm:
        # Eğer model yoksa tekrar yüklemeyi dene (belki o sırada inmiştir)
        load_model()
        if not llm:
            return {
                "role": "assistant", 
                "content": "Beynim (model dosyası) henüz hazır değil. Lütfen 'python backend/download_model.py' komutunu çalıştırarak beynimi indir."
            }

    try:
        # Mesaj geçmişini Llama formatına çevir
        prompt = ""
        for msg in request.messages:
            role = "Assistant" if msg.role == "assistant" else "User"
            prompt += f"{role}: {msg.content}\n"
        prompt += "Assistant: "

        # Yanıt üret
        output = llm(
            prompt,
            max_tokens=512,
            stop=["User:", "\n"],
            echo=False
        )
        
        response_text = output["choices"][0]["text"].strip()
        return {"role": "assistant", "content": response_text}
        
    except Exception as e:
        logger.error(f"Sohbet hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


