'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UploadPdfModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // State to store the list of files

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)])
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      alert('No files selected.')
      return
    }

    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files[]', file)
    })

    try {
      const response = await fetch('http://127.0.0.1:8000/api/pdfs', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload files')
      }

      const result = await response.json()
      console.log('Uploaded files:', result.files)
      alert('Files uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files.')
    } finally {
      onClose()
      setSelectedFiles([]) // Clear the file list
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  if (!isOpen) return null // Do not render the modal if it is not open

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={onClose} // Close modal when clicking on the overlay
    >
      <div
        className='rounded-md bg-white p-6 shadow-lg'
        onClick={e => e.stopPropagation()} // Prevent click events from propagating to the overlay
      >
        <h2 className='mb-4 text-lg font-bold'>Upload Files</h2>
        <form onSubmit={handleUpload}>
          <div className='mb-4'>
            <label
              htmlFor='file'
              className='block text-sm font-medium text-gray-700'
            >
              Select Files
            </label>
            <input
              type='file'
              id='file'
              multiple // Allow multiple file selection
              onChange={handleFileChange}
              className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            />
          </div>

          {/* List of Selected Files */}
          <div className='mb-4'>
            {selectedFiles.length > 0 ? (
              <ul className='space-y-2'>
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className='flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 shadow-sm'
                  >
                    <span className='text-sm text-gray-700'>{file.name}</span>
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => handleRemoveFile(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-gray-500'>No files selected.</p>
            )}
          </div>

          <div className='flex justify-end space-x-2'>
            <Button type='button' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Upload</Button>
          </div>
        </form>
      </div>
    </div>
  )
}