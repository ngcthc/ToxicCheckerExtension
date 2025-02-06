import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import re
import string
from underthesea import word_tokenize

app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đọc và xử lý file teencode
def load_teencode(teencode_path):
    teencode_df = pd.read_csv(teencode_path, names=['teencode', 'map'], sep='\t')
    return dict(zip(teencode_df['teencode'], teencode_df['map']))

# Đọc stopwords
def load_stopwords(stopwords_path):
    with open(stopwords_path, 'r', encoding='utf-8') as f:
        stopwords = f.read().splitlines()
    return stopwords

# Tải model và tokenizer
def load_model_and_tokenizer(model_path):
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    return tokenizer, model

# Hàm xử lý văn bản
def process_text(text, teencode_dict, stopwords, config):
    # Thay thế teencode
    if config.get('replace_teencode', False):
        text = ' '.join([teencode_dict.get(word, word) for word in text.strip().split()])
    # Xóa URL
    text = re.sub(r'https?://\S+|www\.\S+', 'link', text)
    # Xóa dấu câu
    if config.get('remove_punctuation', False):
        text = text.translate(str.maketrans('', '', string.punctuation))
    # Xóa chữ số
    if config.get('remove_digits', False):
        text = re.sub(r'\d+', ' ', text)
    # Chuẩn hóa khoảng trắng
    text = re.sub(r'\s+', ' ', text).strip()
    # Chuyển thành chữ thường
    if config.get('to_lowercase', False):
        text = text.lower()
    # Tách từ
    text = word_tokenize(text, format="text")
    # Xóa stopwords
    if config.get('remove_stopwords', False):
        text = ' '.join([word for word in text.split() if word not in stopwords])
    return text

# Hàm dự đoán
def predict(text, model, tokenizer, teencode_dict, stopwords, config, threshold=0.5):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    text = process_text(text, teencode_dict, stopwords, config)
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=256).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)  # Xác suất cho từng lớp
        prediction = 1 if probabilities[0, 1] >= threshold else 0
    return probabilities[0,1], prediction

# Tải dữ liệu và mô hình
teencode_dict = load_teencode("teencode.txt")
stopwords_list = load_stopwords("stopwords.txt")
tokenizer, model = load_model_and_tokenizer("models/phobert_finetuned_2.1")
config = {'replace_teencode': False, 'remove_punctuation': False, 'remove_digits': False, 'to_lowercase': False, 'remove_stopwords': False}

# Request Body
class TextRequest(BaseModel):
    text: str

# API endpoint
@app.post("/predict")
async def predict_text(request: TextRequest):
    try:
        probabilities, prediction = predict(request.text, model, tokenizer, teencode_dict, stopwords_list, config, threshold=0.3)
        return {"probability": probabilities.item(),
                "prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/health")
async def health_check():
    """
    Endpoint để kiểm tra trạng thái ứng dụng.
    Trả về "OK" nếu server đang chạy.
    """
    return {"status": "OK"}

# Chạy server
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
