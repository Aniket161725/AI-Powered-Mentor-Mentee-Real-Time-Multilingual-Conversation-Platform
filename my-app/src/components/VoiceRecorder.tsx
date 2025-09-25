"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Send } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onSendAudio: (audioData: any) => void;
}

export default function VoiceRecorder({ onSendAudio }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        audioChunksRef.current = []; // reset chunks
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      toast.success("Recording stopped.");
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const sendAudio = () => {
    if (!audioBlob) {
      toast.error("No audio to send!");
      return;
    }

    const audioData = {
      sender: localStorage.getItem("userId"),
      messageType: "voice",
      blob: audioBlob,
      originalAudioUrl: audioUrl,
      senderLang: "en",
      receiverLang: "hi",
      timestamp: new Date(),
    };

    onSendAudio(audioData); // ✅ Pass to parent
    toast.success("Voice message sent!");
    setAudioBlob(null);
    setAudioUrl(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Record/Stop Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "text-red-600" : ""}
      >
        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      {/* Play/Pause Button */}
      {audioUrl && (
        <Button variant="ghost" size="icon" onClick={playAudio}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs">Recording...</span>
        </div>
      )}

      {/* Send Button */}
      <Button onClick={sendAudio} disabled={!audioBlob}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
