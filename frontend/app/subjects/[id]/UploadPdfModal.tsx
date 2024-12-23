'use client'

import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'

interface UploadPdfModalProps {
  isOpen: boolean
  onClose: () => void
  chapter_id: number // Add chapter_id as a prop
  subjectId: any,
  getPdfs: (id: number) => void // Expecting chapter_id type as number
}

export default function UploadPdfModal({
  isOpen,
  onClose,
  chapter_id,
  subjectId,
  getPdfs
}: UploadPdfModalProps) {
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
    formData.append('chapter_id', chapter_id.toString()) // Correctly append chapter_id

    try {
      const response = await fetch('http://127.0.0.1:8000/api/pdfs', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        },
        mode: 'cors' // Enables CORS
      })

      console.log('Response:', response)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response text:', errorText)
        throw new Error(`Failed to upload files: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Uploaded files:', result.files)
      alert('Files uploaded successfully!')

      // Fetch the PDFs again after upload is successful
      getPdfs(subjectId)
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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black-500 bg-opacity-50'
      onClick={onClose} // Close modal when clicking on the overlay
    >
      <div
        className='rounded-md bg-white dark:bg-zinc-800 p-6 shadow-lg border-solid dark:border-white'
        onClick={e => e.stopPropagation()} // Prevents click events from propagating to the overlay
      >
        <h2 className='mb-4 text-lg font-bold'>Upload Files</h2>
        <form onSubmit={handleUpload}>
          <div className='mb-4'>
            <label
              htmlFor='file'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300'
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
              <p className='text-sm text-gray-500 dark:text-gray-300'>No files selected.</p>
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
