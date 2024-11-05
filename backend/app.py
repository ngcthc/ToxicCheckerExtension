from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and vectorizer
with open('model/svm_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('model/vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# Define the request model using Pydantic


class TextInput(BaseModel):
    text: str


@app.get("/")
async def home():
    return {"message": "Welcome to the FastAPI prediction API"}


@app.post("/predict")
async def predict(input_data: TextInput):
    text = input_data.text

    if text:
        text_transformed = vectorizer.transform([text])
        prediction = model.predict(text_transformed)[0]
        return {"prediction": int(prediction)}
    else:
        raise HTTPException(status_code=400, detail="Input text not provided")

# Run the app when executing `python main.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
