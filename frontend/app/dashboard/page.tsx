'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'
import Navbar from '@/components/layout/Navbar'
import UploadModal from '@/components/ui/UploadModal'
import { meetingApi, Meeting } from '@/lib/api'

export default function Dashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    } else if (isSignedIn) {
      loadMeetings()
    }
  }, [isLoaded, isSignedIn])

  const loadMeetings = async () => {
    try {
      const token = await getToken()
      if (!token) return
      
      const data = await meetingApi.listMeetings(token)
      setMeetings(data)
    } catch (error) {
      console.error('Failed to load meetings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File | null, title: string, transcript: string) => {
    const token = await getToken()
    if (!token) return

    if (file) {
      await meetingApi.uploadFile(file, title, token)
    } else {
      await meetingApi.uploadTranscript(title, transcript, token)
    }

    await loadMeetings()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'failed':
        return <XCircle className="text-red-500" size={20} />
      case 'transcribing':
      case 'summarizing':
        return <Loader className="text-blue-500 animate-spin" size={20} />
      default:
        return <Clock className="text-gray-500" size={20} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded'
      case 'transcribing':
        return 'Transcribing...'
      case 'summarizing':
        return 'Summarizing...'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
            <p className="text-gray-600 mt-1">Manage and review your meeting summaries</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No meetings yet</h2>
            <p className="text-gray-600 mb-6">
              Upload your first meeting to get started with AI-powered summaries
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Upload Meeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => router.push(`/meetings/${meeting.id}`)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {meeting.title}
                  </h3>
                  {getStatusIcon(meeting.status)}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium">{getStatusText(meeting.status)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Created: {format(new Date(meeting.created_at), 'MMM d, yyyy')}
                  </p>
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Action Items: <span className="font-medium">{meeting.action_items.length}</span>
                    </p>
                  )}
                </div>

                {meeting.summary && (
                  <p className="mt-4 text-sm text-gray-700 line-clamp-3">
                    {meeting.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}
