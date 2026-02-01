from huggingface_hub import hf_hub_download
import os

def download_marthen_brain():
    # Modern ve güçlü bir model: Llama-3.2-3B-Instruct
    # Bu model hem hızlıdır hem de çok zekidir.
    repo_id = "bartowski/Llama-3.2-3B-Instruct-GGUF"
    filename = "Llama-3.2-3B-Instruct-Q4_K_M.gguf"
    
    print(f"🧠 Marthen'in beyni indiriliyor: {filename}")
    print("Bu işlem internet hızına bağlı olarak birkaç dakika sürebilir...")
    
    model_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir="backend/models",
        local_dir_use_symlinks=False
    )
    
    print(f"✅ Başarılı! Marthen'in beyni burada: {model_path}")
    return model_path

if __name__ == "__main__":
    download_marthen_brain()
