from motor.motor_asyncio import AsyncIOMotorClient

# Connection URL (Use your real MongoDB URI here)
MONGO_URI = "mongodb+srv://Aniket:Ani@cluster0.kdihk33.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"  # Or your Atlas URL

# Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URI)

# Choose database name
db = client.Try  # Example DB name

# Aniket Ani