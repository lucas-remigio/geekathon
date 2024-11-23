'use client'

import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SubjectDetailPage() {
  const { name } = useParams()

  const [isModalOpen, setIsModalOpen] = useState(false) // State to control modal visibility

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Selected file:', file.name)
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    alert('File uploaded successfully!')
    handleCloseModal()
  }

  return (
    <>
      <div className='hidden flex-col md:flex'>
        <div className='border-b'>
          <div className='flex h-16 items-center px-4'>
            <MainNav className='mx-6' />
            <div className='ml-auto flex items-center space-x-4'>
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </div>
        <div className='flex-1 space-y-4 p-8 pt-6'>
          <Tabs defaultValue='subjects' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='subjects'>Subjects</TabsTrigger>
              <TabsTrigger value='history' disabled>
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value='subjects' className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-1'>
                <Card className='cursor-pointer transition-shadow hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Capítulo 1 - LLM
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='h-4 w-4 text-muted-foreground'
                    >
                      <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'></div>
                    <p className='text-xs text-muted-foreground'></p>
                    <Button onClick={handleOpenModal} className='mt-4'>
                      Open Upload Modal
                    </Button>
                  </CardContent>
                  {/* Modal */}
                  {isModalOpen && (
                    <div
                      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
                      onClick={handleCloseModal} // Close modal when clicking on the overlay
                    >
                      <div
                        className='rounded-md bg-white p-6 shadow-lg'
                        onClick={e => e.stopPropagation()} // Prevent click events from propagating to the overlay
                      >
                        <h2 className='mb-4 text-lg font-bold'>Upload File</h2>
                        <form onSubmit={handleUpload}>
                          <div className='mb-4'>
                            <label
                              htmlFor='file'
                              className='block text-sm font-medium text-gray-700'
                            >
                              Select File
                            </label>
                            <input
                              type='file'
                              id='file'
                              onChange={handleFileChange}
                              className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                            />
                          </div>
                          <div className='flex justify-end space-x-2'>
                            <Button type='button' onClick={handleCloseModal}>
                              Cancel
                            </Button>
                            <Button type='submit'>Upload</Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
