'use client'

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SkillsLanguagesCard() {
  const [formData, setFormData] = useState({
    skills: "",
    language: ""
  });
  const router = useRouter();

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Selected Data:", formData);
    const userId = localStorage.getItem("userId");
    alert(`Skills: ${formData.skills}, Language: ${formData.language}`);
    try {
    const res = await axios.put(
  "http://localhost:5000/api/users/details/update",
  {
    userId,
    skills: [formData.skills],
    language: formData.language,
  });
    } catch (error) {
      console.error("Error updating user details:", error); // Log the error for debugging
      alert("There was an error updating your details. Please try again."); // Notify the user
    }
    localStorage.setItem('skills', formData.skills);
    localStorage.setItem('language', formData.language);
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-100 to-blue-100">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            Select Your Skills & Language
          </CardTitle>
          <p className="text-gray-600">Help us know your strengths better</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <select
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a skill</option>
                <option value="Web Development">Web Development</option>
                <option value="AI/ML">AI / ML</option>
                <option value="Data Engineering">Data Engineering</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600"
            >
              Save Preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
