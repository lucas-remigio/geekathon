'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import UploadPdfModal from './UploadPdfModal'

export default function SubjectDetailPage() {
  const { name } = useParams()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
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
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleOpenModal} className='mt-4'>
                      Open Upload Modal
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal Component */}
      <UploadPdfModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}
