from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import db
from ai.translate_utils import  load_translation_models,translate_message

from fastapi import  File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil,os, uuid
import numpy as np
import whisper
# from uuid import uuid4
# import traceback
import tempfile
import shutil, uuid, os
from pydub import AudioSegment

from fastapi.staticfiles import StaticFiles

# Serve media and temp folders for frontend access



from gtts import gTTS

# Load models on app start
# load_translation_models()
model = whisper.load_model("small")

# import subprocess
# print(subprocess.run(["ffmpeg", "-version"], capture_output=True).stdout.decode())


os.makedirs("media/sender", exist_ok=True)
os.makedirs("media/receiver", exist_ok=True)


# Load Whisper model once
# model = whisper.load_model("base")  # or "small", "medium", "large"




app = FastAPI()
# Enable CORS so your frontend (Next.js) can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/temp", StaticFiles(directory="temp"), name="temp")

collection = db.Try  # Example collection name
collection2 = db.Try2
collection3 = db.Try3



class ChatMessage(BaseModel):
    # sender: str
    # receiver: str
    text: str
    source_lang: str
    target_lang: str





@app.get("/")
def read_root():
    return {"message": "AI Backend is running"}








@app.post("/send-message/")
async def send_message(data: ChatMessage):
    try:
        print(f"Received message: {data.text} from {data.source_lang} to {data.target_lang}")


        translated_text =translate_message(data.text, data.source_lang, data.target_lang)

        print(f"Translated message: {translated_text}")


        # await collection2.insert_one(chat)
        return {"translated_message": translated_text}
    except Exception as e:
        return {"error": str(e)}
    




@app.post("/upload-voice/")
async def upload_voice(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}")
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"


        # temp_filename = f"{uuid.uuid4()}.webm"
        # temp_path = f"temp/{temp_filename}"


        # with open(temp_path, "wb") as buffer:
        #     shutil.copyfileobj(file.file, buffer)

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
           shutil.copyfileobj(file.file, temp_file)
           temp_file_path = temp_file.name
        
        print(f"Temporary file saved at: {temp_file_path}")

        audio = AudioSegment.from_file(temp_file_path, format="webm")
        wav_filename = temp_file_path.replace(".webm", ".wav")
        wav_path = f"media/sender/{unique_filename}"
        # audio.export(wav_path, format="wav")

        print(f"Converted audio saved at: {wav_path}")

        # Save to sender folder


        os.remove(temp_file_path)

        return {
            "message": "Voice file uploaded successfully",
            "file_path": wav_path,
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    



@app.post("/voice-to-text/")
async def voice_to_text(file: UploadFile = File(...)):
    try:
        # Save uploaded file to a temporary location with its original extension
        original_ext = file.filename.split(".")[-1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{original_ext}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        print(f"Uploaded file saved at: {temp_file_path}")

        # Convert to .wav if not already wav
        if original_ext != "wav":
            wav_path = f"temp/{uuid.uuid4()}.wav"
            os.makedirs("temp", exist_ok=True)
            print(f"Converting {original_ext} to wav...")
            AudioSegment.from_file(temp_file_path, format=original_ext).export(wav_path, format="wav")
            os.remove(temp_file_path)  # remove original temp file
            temp_file_path = wav_path
            print(f"Converted file saved at: {temp_file_path}")

        print("temp_file_path", temp_file_path )

        # Perform speech recognition
        result = model.transcribe(temp_file_path)
        text = result["text"]
        print(f"Transcribed text: {text}")

        # Clean up the temporary file
        os.remove(temp_file_path)

        return {"text": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/text-to-speech/")
def text_to_speech(text: str, lang: str, output_path: str ):
    try:
        # Create gTTS object
        tts = gTTS(text=text, lang=lang)

        # Save the audio file
        tts.save(output_path)

        print(f"Audio saved at: {output_path}")
        return output_path
    except Exception as e:
        print("Text-to-Speech Error:", str(e))
        return None

class VoiceMessage(BaseModel):
    file: str
    source_lang: str
    target_lang: str 


@app.post("/Voice-msg-translate/")
async def voice_msg_translate(data: VoiceMessage):
    try:
        print(f"Voice message translation request: {data.source_lang} to {data.target_lang}")
        file_location = data.file
        print(f"File location: {file_location}")

        if not os.path.isfile(file_location):
            raise HTTPException(status_code=400, detail=f"File not found at {file_location}")
        
        print(f"Using file: {file_location}")

        # Convert webm to wav (if needed)
        if file_location.endswith(".webm"):
            wav_path = f"temp/{uuid.uuid4()}.wav"
            os.makedirs("temp", exist_ok=True)

            # Convert
            AudioSegment.from_file(file_location, format="webm").export(wav_path, format="wav")
            file_location = wav_path
            print(f"Converted file to: {file_location}")

        # Step 1: Transcribe
        result = model.transcribe(file_location)
        text = result["text"]
        print(f"Transcribed text: {text}")

        # Step 2: Translate
        translated_text = translate_message(text, data.source_lang, data.target_lang)
        print(f"Translated text: {translated_text}")

        # Step 3: TTS
        output_path = f"media/receiver/{uuid.uuid4()}.mp3"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        audio_path = text_to_speech(translated_text, data.target_lang, output_path=output_path)
        if not audio_path:
            raise HTTPException(status_code=500, detail="Text-to-Speech conversion failed.")

        return {
            "original_text": text,
            "translated_text": translated_text,
            "original_audio_path": data.file,
            "audio_path": audio_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))