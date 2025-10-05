'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File | null, title: string, transcript: string) => Promise<void>
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [uploadType, setUploadType] = useState<'file' | 'transcript'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.webm'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0])
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setIsUploading(true)
    try {
      if (uploadType === 'file' && selectedFile) {
        await onUpload(selectedFile, title, '')
      } else if (uploadType === 'transcript' && transcript) {
        await onUpload(null, title, transcript)
      }
      
      // Reset form
      setTitle('')
      setTranscript('')
      setSelectedFile(null)
      setUploadType('file')
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload Meeting</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Weekly Team Standup"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`px-4 py-2 rounded-lg ${
                  uploadType === 'file'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadType('transcript')}
                className={`px-4 py-2 rounded-lg ${
                  uploadType === 'transcript'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Paste Transcript
              </button>
            </div>

            {uploadType === 'file' ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="flex items-center justify-center">
                    <FileText className="text-primary-600 mr-2" size={24} />
                    <span className="text-gray-700">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-600">
                      {isDragActive
                        ? 'Drop the file here'
                        : 'Drag & drop audio/video file, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: MP3, MP4, WAV, M4A, WebM
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Transcript *
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={10}
                  placeholder="Paste your meeting transcript here..."
                  required={uploadType === 'transcript'}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isUploading || !title || (uploadType === 'file' && !selectedFile) || (uploadType === 'transcript' && !transcript)}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload & Process'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
