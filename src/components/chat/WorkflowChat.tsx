'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Download } from 'lucide-react';
import { WorkflowGenerationResponse } from '@/lib/claude';

// Types
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface WorkflowChatProps {
  onBack?: () => void;
}

export function WorkflowChat({ onBack }: WorkflowChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkflowGenerationResponse | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [n8nConnection, setN8nConnection] = useState<{url: string; apiKey: string} | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      autoResize(initialTextareaRef.current);
    } else {
      autoResize(chatTextareaRef.current);
    }
  }, [input, messages.length]);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });

      const result: WorkflowGenerationResponse = await response.json();

      if (result.success && result.workflow) {
        setGeneratedWorkflow(result);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Perfect! I've created a workflow called "${result.summary}". You can see the generated n8n workflow on the right. It includes:\n\n• Complete node configuration\n• Setup instructions\n• Error handling\n• Credential requirements\n\nYou can download the JSON file and import it directly into your n8n instance.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I encountered an error generating your workflow: ${result.error}\n\nPlease try describing your automation needs differently, or provide more specific details about what you want to accomplish.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was a network error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleDownloadWorkflow = () => {
    if (generatedWorkflow?.workflow) {
      const blob = new Blob([JSON.stringify(generatedWorkflow.workflow, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Generate filename from summary or use default
      const timestamp = new Date().toISOString().split('T')[0];
      const safeName = generatedWorkflow.summary 
        ? generatedWorkflow.summary.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase()
        : 'n8n_workflow';
      
      a.href = url;
      a.download = `${safeName}_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeployToN8n = async () => {
    if (!n8nConnection) {
      setShowConnectionModal(true);
      return;
    }

    if (!generatedWorkflow?.workflow) return;

    setIsDeploying(true);
    try {
      const response = await fetch('/api/deploy-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: generatedWorkflow.workflow,
          summary: generatedWorkflow.summary,
          n8nUrl: n8nConnection.url,
          apiKey: n8nConnection.apiKey,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success message and redirect option
        const assistantMessage: ChatMessage = {
          id: generateUniqueId(),
          role: 'assistant',
          content: `🎉 Workflow successfully deployed to your n8n instance!\n\nWorkflow ID: ${result.workflowId}\nYou can view it at: ${result.workflowUrl}\n\n• Configure any required credentials in n8n\n• Test the workflow\n• Activate when ready!`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `❌ Failed to deploy workflow to n8n: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your n8n connection details and try again, or download the JSON file instead.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsDeploying(false);
  };

  const N8nConnectionModal = () => {
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleConnect = () => {
      if (url && apiKey) {
        setN8nConnection({ url: url.replace(/\/$/, ''), apiKey });
        setShowConnectionModal(false);
      }
    };

    if (!showConnectionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#2f2f2f] rounded-lg p-6 max-w-md w-full mx-4 border border-[#404040]">
          <h3 className="text-lg font-semibold text-white mb-4">Connect to n8n</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                n8n Instance URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com"
                className="w-full px-3 py-2 bg-[#404040] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="n8n_api_key_..."
                className="w-full px-3 py-2 bg-[#404040] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Get this from Settings → API Keys in your n8n instance
              </p>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowConnectionModal(false)}
              variant="outline"
              className="flex-1 border-gray-500 text-gray-300 hover:bg-[#444444]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!url || !apiKey}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#212121] flex">
      {/* Chat Panel - Always centered like ChatGPT */}
      <div className={`flex flex-col transition-all duration-500 ${
        generatedWorkflow ? 'w-1/2' : 'w-full'
      }`}>
        {/* Chat Content - Always Centered Container */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 py-8">
          {/* Chat Header - Simple back button when messages exist */}
          {messages.length > 0 && (
            <div className="w-full max-w-3xl mb-6">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          )}

          {messages.length === 0 && !isLoading ? (
            /* Initial Centered View - ChatGPT Style */
            <>
              <div className="text-center mb-16 mt-32">
                <h1 className="text-5xl font-normal text-white mb-8">
                  n8n Workflow Generator
                </h1>
                <p className="text-lg text-gray-400 mb-12">
                  What do you want to automate today?
                </p>
              </div>

              {/* Input Area - Centered */}
              <div className="w-full max-w-3xl">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Message n8n Workflow Generator..."
                    className="w-full p-4 pr-16 bg-[#2f2f2f] border border-[#4d4d4d] rounded-lg resize-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-base leading-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    rows={3}
                    style={{ minHeight: '80px', maxHeight: '300px', overflow: 'auto' }}
                    disabled={isLoading}
                    ref={initialTextareaRef}
                  />
                  <Button
                    onClick={handleSubmit} 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 bg-white hover:bg-gray-200 text-black p-3 rounded-lg"
                    size="sm"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Claude 4 Opus can make mistakes. Check important information.
                </p>
              </div>
            </>
          ) : (
            /* Chat Messages View - Still Centered Container */
            <>
              {/* Title Area for Active Chat */}
              <div className="w-full max-w-3xl text-center mb-8">
                <h1 className="text-2xl font-semibold text-white mb-2">
                  n8n Workflow Generator
                </h1>
                <p className="text-sm text-gray-400">
                  What do you want to automate today?
                </p>
              </div>

              {/* Chat Messages - Contained */}
              <div className="w-full max-w-3xl flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-[#2f2f2f] text-white'
                        : 'bg-[#444444] text-white'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-3">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#444444] text-white rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="text-gray-300">Generating your n8n workflow...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area for Chat Mode - Contained */}
              <div className="w-full max-w-3xl">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message n8n Workflow Generator..."
                    className="w-full p-4 pr-16 bg-[#2f2f2f] border border-[#4d4d4d] rounded-lg resize-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 text-base leading-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    rows={3}
                    style={{ minHeight: '80px', maxHeight: '300px', overflow: 'auto' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    disabled={isLoading}
                    ref={chatTextareaRef}
                  />
                  <Button
                    onClick={handleSubmit} 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 bg-white hover:bg-gray-200 text-black p-3 rounded-lg"
                    size="sm"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Workflow Artifact Panel */}
      {generatedWorkflow && (
        <div className="w-1/2 bg-[#212121] border-l border-[#404040] flex flex-col animate-in slide-in-from-right duration-500">
          {/* Artifact Header */}
          <div className="border-b border-[#404040] px-6 py-4 bg-[#2f2f2f]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{generatedWorkflow.summary}</h3>
                <p className="text-sm text-gray-400">n8n Workflow • Ready to import</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-6 py-3 bg-blue-600/10 border-b border-[#404040]">
            <div className="flex items-center justify-center">
              <p className="text-sm text-blue-400">🚀 Ready to import into n8n</p>
            </div>
          </div>

          {/* Workflow Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#212121]">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                <p className="text-sm text-gray-300">{generatedWorkflow.documentation}</p>
              </div>

              {/* Required Credentials */}
              {generatedWorkflow.requiredCredentials && Object.keys(generatedWorkflow.requiredCredentials).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Required Credentials</h4>
                  <div className="space-y-2">
                    {Object.entries(generatedWorkflow.requiredCredentials).map(([key, cred]) => (
                      <div key={key} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-medium text-orange-400">{cred.type}:</span>
                        <span className="text-gray-300">{cred.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Section */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Get Your Workflow</h4>
                
                {/* Deploy to n8n Option */}
                <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-400">Deploy to n8n</p>
                      <p className="text-xs text-blue-300/70">One-click deployment to your n8n instance</p>
                      {n8nConnection && (
                        <p className="text-xs text-green-400 mt-1">✓ Connected to {n8nConnection.url}</p>
                      )}
                    </div>
                    <Button
                      onClick={handleDeployToN8n}
                      disabled={isDeploying}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                    >
                      {isDeploying ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{isDeploying ? 'Deploying...' : (n8nConnection ? 'Deploy Now' : 'Connect & Deploy')}</span>
                    </Button>
                  </div>
                </div>

                {/* Download JSON Option */}
                <div className="bg-green-600/10 rounded-lg p-4 border border-green-600/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-400">Download JSON</p>
                      <p className="text-xs text-green-300/70">Save file for manual import</p>
                    </div>
                    <Button
                      onClick={handleDownloadWorkflow}
                      className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Workflow JSON */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Workflow JSON</h4>
                <div className="bg-[#1a1a1a] rounded-lg border border-[#404040] overflow-hidden">
                  <pre className="p-4 text-xs overflow-x-auto text-gray-300 font-mono leading-relaxed max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {JSON.stringify(generatedWorkflow.workflow, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Usage Instructions */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">How to Use</h4>
                <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20">
                  <ol className="text-sm text-blue-300 space-y-2">
                    <li>1. Click &quot;Download&quot; to save the JSON file</li>
                    <li>2. Open your n8n instance</li>
                    <li>3. Go to &quot;Workflows&quot; and click &quot;Import from JSON&quot;</li>
                    <li>4. Upload the downloaded file</li>
                    <li>5. Configure any required credentials</li>
                    <li>6. Activate your workflow!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* N8n Connection Modal */}
      <N8nConnectionModal />
    </div>
  );
} 