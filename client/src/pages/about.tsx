import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Brain, 
  Sparkles, 
  Users, 
  Code, 
  Heart, 
  MessageSquare, 
  FileCheck,
  Upload
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-purple-600">Roast My Resume</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make resume improvement fun, accessible, and effective using AI technology.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 mb-4">
                Resume Roaster was born from a simple idea: resume improvement doesn't have to be boring or intimidating. 
                We combine professional analysis with a touch of humor to make the process engaging and memorable.
              </p>
              <p className="text-lg text-gray-700">
                Our AI-powered platform provides instant feedback, actionable insights, and even a good laugh, 
                helping job seekers present their best selves to potential employers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>Smart resume evaluation</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our advanced AI analyzes your resume for clarity, impact, formatting, 
                  and ATS compatibility, providing comprehensive feedback.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Humorous Roasts</CardTitle>
                  <CardDescription>Fun yet insightful</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get entertaining and memorable feedback that points out improvement 
                  areas in a light-hearted way.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Professional Tips</CardTitle>
                  <CardDescription>Actionable advice</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive practical suggestions and professional insights to enhance 
                  your resume's effectiveness.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Empathy</CardTitle>
                  <CardDescription>We understand the job search journey</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We recognize that job hunting can be stressful and challenging. Our platform is designed 
                  to provide support and encouragement throughout your career journey.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Quality</CardTitle>
                  <CardDescription>We strive for excellence</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We're committed to providing high-quality, actionable feedback that genuinely helps you 
                  improve your resume and increase your chances of landing interviews.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to improve your resume?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 