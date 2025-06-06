'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Download, Shield, Clock, Users } from 'lucide-react';
import { WorkflowChat } from '@/components/chat/WorkflowChat';

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <header className="bg-[#2f2f2f] border-b border-[#404040]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">n8n Workflow Generator</h1>
            </div>
            {!showChat && (
              <Button
                onClick={() => setShowChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.519L3 21l2.519-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Start Building
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!showChat && (
        <>
          <section className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              Create n8n Workflows with
              <span className="text-blue-500"> Natural Language</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              No coding required. Describe your automation needs in plain English, 
              and our AI generates production-ready n8n workflows in seconds.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                onClick={() => setShowChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Building Workflows
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-gray-500 text-gray-300 hover:bg-[#2f2f2f] hover:text-white">
                <Download className="mr-2 h-5 w-5" />
                View Examples
              </Button>
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto px-4 py-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-white">Why Choose Our Generator?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-[#2f2f2f] border-[#404040]">
                <CardHeader>
                  <Clock className="h-12 w-12 text-blue-500 mb-4" />
                  <CardTitle className="text-white">2-Minute Workflows</CardTitle>
                  <CardDescription className="text-gray-400">
                    From description to deployment in under 2 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Our AI understands your needs and creates complete workflows with 
                    error handling, documentation, and setup instructions.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2f2f2f] border-[#404040]">
                <CardHeader>
                  <Shield className="h-12 w-12 text-blue-500 mb-4" />
                  <CardTitle className="text-white">Production-Ready</CardTitle>
                  <CardDescription className="text-gray-400">
                    Every workflow includes error handling and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Generated workflows come with comprehensive setup instructions,
                    credential placeholders, and troubleshooting guides.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#2f2f2f] border-[#404040]">
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-500 mb-4" />
                  <CardTitle className="text-white">Beginner-Friendly</CardTitle>
                  <CardDescription className="text-gray-400">
                    No technical knowledge required
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Perfect for citizen developers, startup founders, and marketing 
                    teams who need automation without the complexity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-[#1a1a1a] py-16">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-500">1</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">Describe</h4>
                  <p className="text-gray-300">Tell us what you want to automate in plain English</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-500">2</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">Generate</h4>
                  <p className="text-gray-300">AI creates a complete n8n workflow with documentation</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-500">3</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">Preview</h4>
                  <p className="text-gray-300">Review your workflow and customize if needed</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-500">4</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">Deploy</h4>
                  <p className="text-gray-300">Download JSON or deploy directly to your n8n instance</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-16 text-center">
            <h3 className="text-3xl font-bold mb-6 text-white">Ready to Automate?</h3>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who&apos;ve simplified their workflow creation process
            </p>
            <Button 
              size="lg"
              onClick={() => setShowChat(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              Create Your First Workflow
            </Button>
          </section>
        </>
      )}

      {/* Chat Interface */}
      {showChat && (
        <WorkflowChat onBack={() => setShowChat(false)} />
      )}
    </div>
  );
}
