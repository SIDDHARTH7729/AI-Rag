'use client'
import React from 'react'
import { Upload, CheckCircle } from 'lucide-react'

const FileUpload: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)

  const handleFileUploadButton = () => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', '.pdf');
    
    fileInput.addEventListener('change', async (ev) => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files.item(0);
        if (file) {
          setIsUploading(true)
          setUploadSuccess(false)
          
          try {
            const formData = new FormData();
            formData.append('pdf', file)
            
            const response = await fetch('http://localhost:8000/upload/pdf', {
              method: 'POST',
              body: formData
            })
            
            if (response.ok) {
              console.log('File uploaded successfully');
              setUploadSuccess(true)
              setTimeout(() => setUploadSuccess(false), 3000) // Reset after 3 seconds
            } else {
              console.error('Upload failed')
            }
          } catch (error) {
            console.error('Upload error:', error)
          } finally {
            setIsUploading(false)
          }
        }
      }
    })
    
    fileInput.click();
  }

  return (
    <div className="w-full max-w-sm">
      <div 
        onClick={!isUploading ? handleFileUploadButton : undefined}
        className={`
          bg-slate-800 text-white shadow-lg flex justify-center items-center 
          p-6 rounded-lg border-2 border-slate-600 transition-all duration-200
          ${!isUploading ? 'hover:bg-slate-700 hover:border-slate-500 cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-75'}
        `}
      >
        <div className="flex justify-center items-center flex-col space-y-3">
          <h3 className="text-lg font-medium text-center">
            {isUploading ? 'Uploading...' : uploadSuccess ? 'Upload Successful!' : 'Upload PDF File'}
          </h3>
          
          <div className="flex justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : uploadSuccess ? (
              <CheckCircle className="h-8 w-8 text-green-400" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>
          
          {!isUploading && !uploadSuccess && (
            <p className="text-sm text-gray-300 text-center">
              Click to select a PDF file
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileUpload