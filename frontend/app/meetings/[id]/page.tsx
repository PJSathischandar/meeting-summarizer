'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Download, Send, Trash2, CheckCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '@/components/layout/Navbar'
import { meetingApi, Meeting } from '@/lib/api'

export default function MeetingDetail() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const router = useRouter()
  const params = useParams()
  const meetingId = Number(params.id)
  
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [slackWebhook, setSlackWebhook] = useState('')
  const [showSlackModal, setShowSlackModal] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    } else if (isSignedIn) {
      loadMeeting()
    }
  }, [isLoaded, isSignedIn, meetingId])

  const loadMeeting = async () => {
    try {
      const token = await getToken()
      if (!token) return
      
      const data = await meetingApi.getMeeting(meetingId, token)
      setMeeting(data)
    } catch (error) {
      console.error('Failed to load meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportJson = async () => {
    try {
      const token = await getToken()
      if (!token) return
      
      const jsonData = await meetingApi.exportToJson(meetingId, token)
      
      // Download as file
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting-${meetingId}-summary.json`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleExportSlack = async () => {
    if (!slackWebhook) return
    
    try {
      const token = await getToken()
      if (!token) return
      
      await meetingApi.exportToSlack(meetingId, slackWebhook, token)
      setShowSlackModal(false)
      setSlackWebhook('')
      alert('Successfully exported to Slack!')
    } catch (error) {
      console.error('Slack export failed:', error)
      alert('Failed to export to Slack')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    
    try {
      const token = await getToken()
      if (!token) return
      
      await meetingApi.deleteMeeting(meetingId, token)
      router.push('/dashboard')
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Meeting not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
              <p className="text-gray-600">
                Created on {format(new Date(meeting.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportJson}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Export as JSON"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setShowSlackModal(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Export to Slack"
              >
                <Send size={20} />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                title="Delete meeting"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {meeting.status !== 'completed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Loader className="animate-spin text-blue-600 mr-3" size={20} />
                <p className="text-blue-900">
                  {meeting.status === 'transcribing' && 'Transcribing audio...'}
                  {meeting.status === 'summarizing' && 'Generating summary...'}
                  {meeting.status === 'uploaded' && 'Processing...'}
                  {meeting.status === 'failed' && 'Processing failed'}
                </p>
              </div>
            </div>
          )}

          {meeting.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {meeting.summary}
              </p>
            </div>
          )}

          {meeting.action_items && meeting.action_items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Action Items</h2>
              <div className="space-y-3">
                {meeting.action_items.map((item, index) => (
                  <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4">
                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{item.task}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        {item.assignee && <span>Assignee: {item.assignee}</span>}
                        {item.priority && (
                          <span className={`px-2 py-1 rounded ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {meeting.metadata?.key_points && meeting.metadata.key_points.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Points</h2>
              <ul className="list-disc list-inside space-y-2">
                {meeting.metadata.key_points.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {meeting.metadata?.participants && meeting.metadata.participants.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Participants</h2>
              <div className="flex flex-wrap gap-2">
                {meeting.metadata.participants.map((participant, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {participant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meeting.transcript && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Full Transcript</h2>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {meeting.transcript}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slack Export Modal */}
      {showSlackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Export to Slack</h3>
            <p className="text-gray-600 mb-4">
              Enter your Slack webhook URL to send this meeting summary to a channel.
            </p>
            <input
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="https://hooks.slack.com/services/..."
            />
            <div className="flex space-x-4">
              <button
                onClick={handleExportSlack}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                disabled={!slackWebhook}
              >
                Send to Slack
              </button>
              <button
                onClick={() => setShowSlackModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
