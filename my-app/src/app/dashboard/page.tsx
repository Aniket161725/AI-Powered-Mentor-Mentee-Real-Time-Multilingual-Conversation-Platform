"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageCircle,
  Bell,
  LogOut,
  User,
  Star,
  Send,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";
import VoiceRecorder from "@/components/VoiceRecorder";

interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  userType: string;
  skills: string[];
}

interface MentorProfile {
  _id: string;
  name: string;
  skills: string[];
  rating?: number;
  language?: string;
  bio?: string;
  avatar?: string;
}

interface ChatRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    preferredLanguage?: string;
    language?: string;
    bio?: string;
    avatar?: string;
    rating?: number;
  };
  receiverId?: {
    _id: string;
    name: string;
    email?: string;
    skills?: string[];
    preferredLanguage?: string;
    language?: string;
    bio?: string;
    avatar?: string;
    rating?: number;
  };
  skill: string;
  message?: string;
  timestamp?: Date;
  status: "pending" | "accepted" | "rejected";
}

interface SelectedUser {
  receiverId: string;
  senderId: MentorProfile;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<MentorProfile[]>([]);
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [acceptedMentors, setAcceptedMentors] = useState<MentorProfile[]>([]);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = localStorage.getItem("userId");
  }, []);

  // stable fetch function
  const fetchAcceptedMentors = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await axios.get(
        `http://localhost:5000/api/requests/accepted/${userId}`
      );
      console.log("Fetched accepted requests----------:", res.data);

      const mentors: MentorProfile[] = [];
      (res.data || []).forEach((req: any) => {
        const isSender = req.senderId?._id === userId;
        const other = isSender ? req.receiverId : req.senderId;
        const language = isSender
          ? req.receiverlanguage || req.senderlanguage
          : "en";

        if (!other?._id) return;

        console.log("other language:", res.data);

        mentors.push({
          _id: other._id,
          name: other.name || "Unknown",
          skills: Array.isArray(other.skills) ? other.skills : [],
          // rating: other.rating ?? 5,
          language: language || "en",
          // bio: other.bio || "",
          // avatar: other.avatar || undefined,
        });
      });

      setAcceptedMentors(mentors);
      console.log("Accepted Mentors (normalized):", mentors);
      console.log("Raw accepted requests:", res.data);
    } catch (err) {
      console.error("Error fetching accepted mentors:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!token || !userId) {
      router.push("/");
      return;
    }

    setUser({
      id: userId,
      name: "Current User", // You can fetch this from API
      email: "",
      preferredLanguage: "en",
      userType: role || "Mentee",
      skills: [],
    });

    loadMentors();
    loadRequests();
    fetchAcceptedMentors();
  }, [router, fetchAcceptedMentors]);

  // refetch when switching to chats tab
  useEffect(() => {
    if (activeTab === "chats") {
      fetchAcceptedMentors();
    }
  }, [activeTab, fetchAcceptedMentors]);

  const loadMentors = async () => {
    try {
      console.log("Fetching mentors from backend...");
      const response = await axios.get(
        "http://localhost:5000/api/users/mentors"
      );
      console.log("Mentors fetched:", response.data);
      setMentors(response.data);
      setFilteredMentors(response.data);
    } catch (error) {
      console.error("Error loading mentors:", error);
    }
  };

  const handleSendVoice = async (audioData: any) => {
    if (!selectedUser || !socketRef.current) return;

    try {
      // Convert Blob → ArrayBuffer → Base64
      const arrayBuffer = await audioData.blob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const userId = localStorage.getItem("userId");

    let language = localStorage.getItem("language") || "en";
    let recieverLang = "";
    if (language == "Hindi") {
      language = "hi";
      recieverLang = "en";
    }else{
      language = "en";
      recieverLang = "hi";
    }
      console.log("----->" + audioData.senderLang, audioData.receiverLang);

      const msg = {
        sender: audioData.sender,
        receiver: selectedUser.senderId._id,
        messageType: "voice",
        audioBase64: base64Audio,
        senderLang: language,
        receiverLang: recieverLang,
      };

      socketRef.current.emit("send-message", msg);

      // Optimistically update UI
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          sender: msg.sender,
          messageType: "voice",
          originalAudioUrl: URL.createObjectURL(audioData.blob), // preview locally
          pending: true, // you can use this flag to show "sending..."
        },
      ]);
    } catch (error) {
      console.error("Error sending voice message:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:5000/api/requests/received/${userId}`
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMentors(mentors);
      return;
    }

    const filtered = mentors.filter(
      (mentor) =>
        mentor.skills.some((skill) =>
          skill.toLowerCase().includes(query.toLowerCase())
        ) || mentor.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredMentors(filtered);
  };

  const sendConnectionRequest = async (mentorId: string, language: string) => {
    try {
      console.log(
        "Sending request to mentor:",
        mentorId,
        "with language:",
        language
      );
      const userId = localStorage.getItem("userId");
      await axios.post("http://localhost:5000/api/requests/send", {
        senderId: userId,
        receiverId: mentorId,
        skill: "General Mentorship",
        senderlanguage: localStorage.getItem("language") || "en",
        receiverlanguage: language || "en",
      });
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      await axios.put(
        `http://localhost:5000/api/requests/status/${requestId}`,
        {
          status: action === "accept" ? "accepted" : "rejected",
        }
      );

      setRequests((prev) => prev.filter((req) => req._id !== requestId));

      if (action === "accept") {
        toast.success("Request accepted! You can now start chatting.");
        await fetchAcceptedMentors(); // <--- refresh accepted mentors immediately
      } else {
        toast.success("Request declined.");
      }
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const handleUserClick = (mentor: MentorProfile) => {
    const selectedUserData: SelectedUser = {
      receiverId: mentor._id,
      senderId: mentor,
    };
    setSelectedUser(selectedUserData);
    setShowChat(true);
    setActiveTab("chats");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    router.push("/");
  };

  // Socket logic for chat
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");

      // When connected to socket
      socketRef.current.on("connect", () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
          socketRef.current.emit("register", userId); // register userId with backend
          console.log("✅ Registered user with socket:", userId);
        }
      });

      // Listen for incoming messages
      socketRef.current.on("receiveMessage", (msg: any) => {
        const userId = userIdRef.current;
        if (!userId || !selectedUser) return;

        const isChatMatch =
          (msg.sender === userId && msg.receiver === selectedUser.receiverId) ||
          (msg.sender === selectedUser.receiverId && msg.receiver === userId);

        if (isChatMatch) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedUser]);

  // ✅ Join room + fetch chat history when user changes
  useEffect(() => {
    const userId = userIdRef.current;
    if (!selectedUser || !userId || !socketRef.current) return;

    // Join a unique room for this chat pair
    socketRef.current.emit("joinRoom", {
      userId,
      receiverId: selectedUser.receiverId,
    });

    // Clear messages and load chat history
    setMessages([]);
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/chat/${userId}/${selectedUser.senderId._id}`
        );
        setMessages(data);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

 const handleSendText = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const userId = localStorage.getItem("userId");
    let language = localStorage.getItem("language") || "en";
    let recieverLang = "";
    if (language == "Hindi") {
      language = "hi";
      recieverLang = "en";
    }else{
      language = "en";
      recieverLang = "hi";
    }
    if (!userId || !socketRef.current) return;

    const msg = {
      sender: userId,
      receiver: selectedUser.senderId._id,
      messageType: "text",
      text: newMessage,
      senderLang: language,
      receiverLang: recieverLang,
    };

    socketRef.current.emit("send-message", msg);
    //   setMessages((prev) => [...prev, { ...msg, _id: Date.now() }]);
    setNewMessage("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VoiceBridge</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setActiveTab("requests")}
              >
                <Bell className="h-5 w-5" />
                {user.userType === "Mentor" &&
                  requests.filter((r) => r.status === "pending").length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {requests.filter((r) => r.status === "pending").length}
                    </span>
                  )}
              </Button>

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {user.userType}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showChat && selectedUser ? (
          // Chat Interface
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.senderId.avatar ||
                        selectedUser.senderId.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-semibold text-gray-900">
                      {selectedUser.senderId.name}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      EN
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.sender === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md p-4 rounded-lg space-y-2 ${
                      msg.sender === user.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {/* TEXT MESSAGE */}
                    {msg.messageType === "text" && (
                      <>
                        <p className="text-sm">{msg.text}</p>
                        {msg.translatedText && (
                          <p className="text-xs mt-1 opacity-75">
                            Translation: {msg.translatedText}
                          </p>
                        )}
                      </>
                    )}

                    {/* VOICE MESSAGE */}
                    {msg.messageType === "voice" && (
                      <div className="space-y-2">
                        {/* 🎤 Original Voice */}
                        {msg.originalAudioUrl && (
                          <audio controls className="w-full">
                            <source
                              src={`http://localhost:5000${msg.originalAudioUrl}`}
                              type="audio/webm"
                            />
                            Your browser does not support the audio element.
                          </audio>
                        )}

                        {/* 📝 Original Transcription (optional) */}
                        {msg.originalText && (
                          <p className="text-xs opacity-70">
                            {msg.originalText}
                          </p>
                        )}

                        {/* 🌐 Translated Voice (if exists) */}
                        {msg.translatedAudioUrl && (
                          <audio controls>
                            <source
                              src={`http://localhost:8000/${msg.translatedAudioUrl}`}
                              type="audio/mp3"
                            />
                          </audio>
                        )}

                        {/* 📝 Translated Text (optional) */}
                        {msg.translatedText && (
                          <p className="text-xs opacity-75">
                            Translation: {msg.translatedText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <VoiceRecorder onSendAudio={handleSendVoice} />
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                  className="flex-1"
                />
                <Button onClick={handleSendText} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard Tabs
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">
                {user.userType === "Mentee" ? "Find Mentors" : "Browse Mentees"}
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Requests
                {user.userType === "Mentor" &&
                  requests.filter((r) => r.status === "pending").length > 0 && (
                    <span className="ml-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {requests.filter((r) => r.status === "pending").length}
                    </span>
                  )}
              </TabsTrigger>
              <TabsTrigger value="chats">My Chats</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {user.userType === "Mentee"
                      ? "Find Your Perfect Mentor"
                      : "Discover Learning Opportunities"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Search by skills (e.g., React, Python, Marketing)..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map((mentor) => (
                      <Card
                        key={mentor._id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleUserClick(mentor)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {mentor.avatar ||
                                    mentor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {mentor.name}
                                </h3>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(mentor.language || "EN").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {mentor.language}
                          </p>

                          <p className="text-sm text-gray-600 mb-4">
                            {mentor.bio || "Experienced professional"}
                          </p>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                Skills:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {mentor.skills.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Button
                              className="w-full"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                sendConnectionRequest(
                                  mentor._id,
                                  mentor.language || "en"
                                );
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Request
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.userType === "Mentor"
                      ? "Mentorship Requests"
                      : "Sent Requests"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <Card
                          key={request._id}
                          className="border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Avatar>
                                  <AvatarFallback>
                                    {request.senderId.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {request.senderId.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      EN
                                    </Badge>
                                    <Badge
                                      variant={
                                        request.status === "accepted"
                                          ? "default"
                                          : request.status === "rejected"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {request.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    Skill: {request.skill}
                                  </p>
                                </div>
                              </div>

                              {user.userType === "Mentor" &&
                                request.status === "pending" && (
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleRequest(request._id, "accept")
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRequest(request._id, "reject")
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  {acceptedMentors.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active chats yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Accept mentorship requests to start chatting
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {acceptedMentors.map((mentor) => (
                        <Card
                          key={mentor._id}
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleUserClick(mentor)}
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {
                                    // mentor.avatar ||
                                    mentor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {mentor.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {mentor.language}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {(mentor.language || "EN").toUpperCase()}
                              </Badge>
                              <Send className="h-5 w-5 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
