'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Globe, User, GraduationCap, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' }
];

const skillCategories = [
  'Programming', 'Web Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'DevOps', 'Cloud Computing', 'Cybersecurity',
  'UI/UX Design', 'Digital Marketing', 'Business Strategy', 'Finance'
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    preferredLanguage: '',
    userType: '',
    skills: [] as string[],
    newSkill: ''
  });
  const router = useRouter();

  const addSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: ''
      });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleNext = () => {
    if (step === 1 && !formData.preferredLanguage) {
      toast.error('Please select your preferred language');
      return;
    }
    if (step === 2 && !formData.userType) {
      toast.error('Please select if you are a mentor or mentee');
      return;
    }
    if (step === 3 && formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (step === 3) {
      toast.success('Onboarding completed!');
      router.push('/dashboard');
    } else {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="h-16 w-16 text-blue-600 mx-auto" />
              <h2 className="text-2xl font-bold">Choose Your Preferred Language</h2>
              <p className="text-gray-600">This will be your primary language for communication</p>
            </div>
            
            <div className="space-y-4">
              <Label>Select Language</Label>
              <Select value={formData.preferredLanguage} onValueChange={(value) => 
                setFormData({...formData, preferredLanguage: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose your language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="h-16 w-16 text-purple-600 mx-auto" />
              <h2 className="text-2xl font-bold">Are You a Mentor or Mentee?</h2>
              <p className="text-gray-600">This helps us connect you with the right people</p>
            </div>
            
            <RadioGroup value={formData.userType} onValueChange={(value) => 
              setFormData({...formData, userType: value})}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Mentor" id="mentor" />
                  <div className="flex-1">
                    <Label htmlFor="mentor" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Mentor</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Share your expertise with others</p>
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Mentee" id="mentee" />
                  <div className="flex-1">
                    <Label htmlFor="mentee" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Mentee</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Learn from experienced mentors</p>
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <GraduationCap className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">
                {formData.userType === 'Mentor' ? 'What Skills Do You Have?' : 'What Skills Do You Want to Learn?'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={formData.newSkill}
                  onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1"
                />
                <Button onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Popular Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skillCategories.map((skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.skills.includes(skill)) {
                          setFormData({
                            ...formData,
                            skills: [...formData.skills, skill]
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <p className="text-gray-600">Step {step} of 3</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {step === 3 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}