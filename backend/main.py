from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Marthen AI Backend")

# CORS ayarları (React frontend'in bağlanabilmesi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "marthen-v1"

@app.get("/")
async def root():
    return {"status": "online", "message": "Marthen AI Backend is running"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Şimdilik basit bir yanıt dönelim, model entegrasyonunu bir sonraki adımda yapacağız
        user_input = request.messages[-1].content
        
        # Burası ileride Ollama veya Transformers ile bağlanacak
        response = f"Merhaba! Ben Marthen'in Python beyni. Şimdilik bağlantımız hazır, yakında modelimi buraya yükleyeceğiz. Yazdığın mesaj: {user_input}"
        
        return {"role": "assistant", "content": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
