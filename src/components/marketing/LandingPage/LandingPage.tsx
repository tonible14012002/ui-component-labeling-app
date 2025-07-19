'use client'

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  FileText,
  Brain,
  Zap,
  Star,
  ArrowRight,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";

const LandingPage = () => {
    const router = useRouter();
    const navigate = (path: string) => {
    router.push(path);
    }

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Feedback",
      description:
        "Get real-time insights on pacing, clarity, and filler words to improve your delivery.",
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Smart Script Editor",
      description:
        "Rich text editor with AI completion suggestions and version control.",
    },
    {
      icon: <Mic className="w-8 h-8 text-purple-600" />,
      title: "Voice Simulation",
      description:
        "Hear how your script sounds with AI voice simulation before you practice.",
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: "Import Content",
      description:
        "Convert YouTube videos and PDFs into editable speech scripts instantly.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Public Speaker",
      content:
        "SpeechCraft transformed my presentation skills. The AI feedback is incredibly accurate!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Content Creator",
      content:
        "The YouTube import feature saves me hours of work. Perfect for creating video scripts.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Business Executive",
      content:
        "Finally, a tool that helps me practice speeches without the anxiety. Love the calming interface.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              SpeechCraft
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="outline">Sign In</Button>
            <Button onClick={() => navigate("/app")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            🎯 AI-Powered Speech Coaching
          </Badge>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Perfect Your Speech
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              With AI Guidance
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Transform your speaking skills with our AI-powered platform. Get
            real-time feedback, practice with confidence, and deliver speeches
            that captivate your audience.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => navigate("/app")}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Start Creating <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="flex items-center">
              <Play className="mr-2 w-4 h-4" /> Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-slate-600">
            Powerful features designed to make you a confident speaker
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Loved by Speakers Worldwide
            </h2>
            <p className="text-lg text-slate-600">
              See what our users have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Speaking?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of speakers who&apos;ve improved their delivery with
              SpeechCraft
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/app")}
            >
              Start Your Journey <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">SpeechCraft</span>
              </div>
              <p className="text-slate-400">
                AI-powered speech coaching for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SpeechCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
