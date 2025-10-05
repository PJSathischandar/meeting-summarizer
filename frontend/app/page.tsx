import Link from 'next/link'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600">Meeting Summarizer</h1>
        <div className="space-x-4">
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-primary-600 hover:text-primary-700">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Transform Meetings into
          <span className="text-primary-600"> Actionable Insights</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Upload audio, video, or transcripts and get AI-powered summaries with action items in minutes.
        </p>
        
        <SignUpButton mode="modal">
          <button className="px-8 py-4 bg-primary-600 text-white text-lg rounded-lg hover:bg-primary-700 transition-colors">
            Start Free Trial
          </button>
        </SignUpButton>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold mb-2">Upload & Transcribe</h3>
            <p className="text-gray-600">
              Upload audio/video files or paste transcripts. We handle the rest with OpenAI Whisper.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Summarization</h3>
            <p className="text-gray-600">
              GPT-4o analyzes your meetings and extracts key insights, action items, and decisions.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-xl font-semibold mb-2">Export & Share</h3>
            <p className="text-gray-600">
              Export to JSON, share via email, or send directly to Slack channels.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
