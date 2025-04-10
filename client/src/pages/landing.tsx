import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Star, Award, FileCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Roast Your Resume with <span className="text-purple-600">AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Upload your resume for instant feedback, humor, and professional improvements. <br></br>Get roasted by AI.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link to="/upload">
              <Upload className="mr-2 h-5 w-5" />
              Upload Resume
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/about">
              <Info className="mr-2 h-5 w-5" />
              About Us
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-purple-100 p-3 rounded-full inline-flex">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Upload Your Resume</h3>
                <p className="text-gray-600">
                  Upload your resume in PDF or DOCX format. We'll extract the text and prepare it for analysis.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-100 p-3 rounded-full inline-flex">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Get Analyzed</h3>
                <p className="text-gray-600">
                  Our AI will roast your resume with humor, while also providing professional analysis and scores.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-green-100 p-3 rounded-full inline-flex">
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Improve & Share</h3>
                <p className="text-gray-600">
                  Get an enhanced, rewritten version of your resume and easily share your results on social media.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-purple-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get roasted?</h2>
        <p className="text-lg text-gray-600 mb-6">Upload your resume and know what you're in for...</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link to="/upload">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;