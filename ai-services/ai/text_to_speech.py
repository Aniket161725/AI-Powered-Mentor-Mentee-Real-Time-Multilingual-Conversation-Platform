

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