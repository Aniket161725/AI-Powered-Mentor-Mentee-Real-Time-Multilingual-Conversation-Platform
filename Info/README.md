AI-Powered-Mentor-Mentee-Real-Time-Multilingual-Conversation-Platform


AI-Powered-Mentor-Mentee-Real-Time-Multilingual-Conversation-Platform/
│
├── my-app/                  # Frontend (Next.js + Tailwind + React)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/                 # Backend (Node.js + Express + MongoDB + Socket.io)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── ai-services/             # AI Microservices (Python + FastAPI)
│   ├── requirements.txt
│   ├── main.py
│   └── ...
│
└── README.md



Tools & Technologies Used


Frontend (my-app/package.json)
Framework & Libraries: Next.js, React
Styling: TailwindCSS, Tw-Animate-CSS
UI Components: Radix UI (Avatar, Label, Tabs, Radio, Select)
Icons & Utilities: Lucide-React, clsx, class-variance-authority
State & Communication: Axios, Socket.IO-client
Notifications: Sonner


Backend (backend/package.json)
Server Framework: Node.js, Express
Database: MongoDB (mongoose, motor for AI microservices)
Authentication: jsonwebtoken, bcrypt
File Uploads: multer
Real-Time Communication: Socket.io
Other Utilities: dotenv, validator, uuid, body-parse


AI Services (ai-services/requirements.txt)
Framework: FastAPI, Uvicorn
Machine Learning & NLP: scikit-learn, numpy, pandas, scipy
Audio & Text Processing: pydantic, python-multipart, pillow
Database: pymongo, motor
Translation & Voice: anyio, click, argostranslate (if used)


How to Run the Project
1. Frontend (my-app)
# Navigate to frontend
cd my-app
# Install dependencies
npm install
# Run in development mode
npm run dev

The frontend will run at http://localhost:3000


2. Backend (backend)
# Navigate to backend
cd backend
# Install dependencies
npm install
# Run in development mode
npm run dev

The backend server will run at http://localhost:5000


3. AI Services (ai-services)
# Activate Python virtual environment
.\venv\Scripts\activate      # Windows
# OR
source venv/bin/activate     # Mac/Linux
# Install dependencies
pip install -r requirements.txt
# Run FastAPI server
uvicorn main:app --reload

The AI services will run at http://localhost:8000
