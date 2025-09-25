import Chat from "../model/chatModel.js";

import path from "path";
import fs from "fs";
import multer from "multer";
import {
  v4 as uuidv4
} from "uuid";
import axios from "axios";


// Configure multer storage manually (outside socket block)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/voice/";
    fs.mkdirSync(dest, {
      recursive: true
    });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage
}).single("voice");



// Map to store userId → socketId
const userSocketMap = {};

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Register user to socket mapping
    socket.on("register", (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });

    // Join room (optional if you use rooms)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`📌 User ${socket.id} joined room ${roomId}`);
    });

    // Leave room
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`📌 User ${socket.id} left room ${roomId}`);
    });

    // Handle sending message
    socket.on("send-message", async (data) => {
      try {
        const {
          sender,
          receiver,
          messageType,
          text,
          audioUrl,
          senderLang,
          receiverLang,
        } = data;

        let chatData = {
          sender,
          receiver,
          messageType,
          senderLang,
          receiverLang,
        };

        // 📄 TEXT MESSAGE
        if (messageType === "text") {
          console.log("📥 Text message received:", senderLang, receiverLang);
          if (senderLang === receiverLang) {
            chatData.text = text;
            console.log("✅ Same language, no translation needed:", text);
          } else {
            // Translate via FastAPI
            const res = await axios.post("http://localhost:8000/send-message", {
              text,
              source_lang: senderLang,
              target_lang: receiverLang,
            });

            console.log("🌐 Translated text:", res.data);
            chatData.text = text;
            chatData.translatedText = res.data.translated_message;
          }
        }

        // 🎤 VOICE MESSAGE
        if (messageType === "voice") {
          if (!data.audioBase64) throw new Error("No audio data received");

          // 1️⃣ Convert Base64 → Buffer
          const buffer = Buffer.from(data.audioBase64, "base64");

          // 2️⃣ Ensure upload directory exists
          const uploadDir = path.resolve("uploads/voice/"); // absolute path for storage
          fs.mkdirSync(uploadDir, {
            recursive: true
          });

          // 3️⃣ Generate unique file name and save
          const fileName = `${uuidv4()}.webm`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);

          console.log("🎤 Voice message saved at:", filePath);

          // 4️⃣ This path is stored in DB for frontend playback (relative path)
          chatData.originalAudioUrl = `/uploads/voice/${fileName}`;

          // 5️⃣ If languages are different, call FastAPI
          if (senderLang !== receiverLang) {
            console.log(`🌐 Translating voice message: ${senderLang} ➝ ${receiverLang}`);

            // ✅ Send absolute path so FastAPI can access file
            const res = await axios.post("http://localhost:8000/Voice-msg-translate", {
              file: filePath,
              source_lang: senderLang,
              target_lang: receiverLang,
            });

            console.log("✅ FastAPI response:", res.data);

            chatData.originalText = res.data.original_text;
            chatData.translatedText = res.data.translated_text;
            chatData.translatedAudioUrl = res.data.audio_path;
            // chatData.originalAudioUrl = res.data.original_audio_path;
            
          }
        }

        console.log("💾 Saving chat data:", chatData);

        // Save in DB
        const newMessage = await Chat.create(chatData);

        // 📤 Send to both sender & receiver in real time
        if (userSocketMap[receiver]) {
          io.to(userSocketMap[receiver]).emit("receiveMessage", newMessage);
        }
        if (userSocketMap[sender]) {
          io.to(userSocketMap[sender]).emit("receiveMessage", newMessage);
        }

      } catch (err) {
        console.error("❌ Error handling send-message:", err);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id);

      // Remove user from map
      for (let userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          console.log(`🗑 Removed user ${userId} from socket map`);
          break;
        }
      }
    });
  });
};