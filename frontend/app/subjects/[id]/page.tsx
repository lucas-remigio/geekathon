'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import UploadPdfModal from './UploadPdfModal'
import PopUp from '@/components/popup';

interface responsePdfs {
  chapter_id: number
  pdfs: Pdf[]
}

interface Pdf {
  id: number
  chapter_id: number
  file_name: string
  file_path: string
  created_at: string
  updated_at: string
  deleted_at: null
}

export default function SubjectDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(
    null
  ) // Track which accordion is open
  const [chapters, setChapters] = useState<any[]>([]) // State for chapters
  const [pdfs, setPdfs] = useState<responsePdfs[]>([])
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(true)
  const [isLoadingChapters, setIsLoadingChapters] = useState(true)
  const [selectedChapterId, setSelectedChapterId] = useState(0)
  const [pdfsByChapter, setPdfsByChapter] = useState<any>({})
  const { id } = useParams()

  const router = useRouter()
  const params = useParams()

  // Prevent SSR errors by ensuring router-dependent code runs on the client
  const isClient = typeof window !== 'undefined'

  const handleRedirect = (chapterId: number) => {
    if (!isClient || !params) return
    const currentPath = `/subjects/${params.id}`
    router.push(`${currentPath}/test?chapterId=${chapterId}`)
  }

  const handleOpenModal = (chapter_id: number) => {
    setIsModalOpen(true)
    // Pass chapter_id to modal
    setSelectedChapterId(chapter_id)
  }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const getChapters = async (id: any) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/subjects/${id}/chapters`
      )
      const data = await response.json()
      setChapters(data)
      setIsLoadingChapters(false)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setIsLoadingChapters(false)
    }
  }

  const getPdfs = async (id: any) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/subjects/${id}/chapters/pdfs`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: responsePdfs[] = await response.json()

      // Ensure data is an array and contains the expected structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response: Data is not an array.')
      }

      setPdfs(data)
      setIsLoadingPdfs(false)

      // Flatten the array of chapters to organize PDFs by chapter
      const pdfsByChapter = data.reduce((acc: any, chapter) => {
        if (chapter.pdfs && Array.isArray(chapter.pdfs)) {
          chapter.pdfs.forEach(pdf => {
            if (!acc[chapter.chapter_id]) {
              acc[chapter.chapter_id] = []
            }
            acc[chapter.chapter_id].push(pdf)
          })
        }
        return acc
      }, {})

      console.log('pdfsByChapter:', pdfsByChapter)
      setPdfsByChapter(pdfsByChapter)
    } catch (error) {
      console.error('Error fetching PDFs:', error)
      setIsLoadingPdfs(false)
    }
  }

  const handleDownload = async (pdf: any, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      const response = await fetch(`http://localhost:8000/api/pdfs/${pdf.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch the PDF')
      }

      const pdfBlob = await response.blob()
      const pdfUrl = window.URL.createObjectURL(pdfBlob)

      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = pdf.file_name.slice(pdf.file_name.indexOf('_') + 1)
      link.click()
      window.URL.revokeObjectURL(pdfUrl)
    } catch (error) {
      console.error('Error downloading the PDF:', error)
    }
  }

  useEffect(() => {
    if (isClient) {
      document.title = 'Subject Details'
    }

    getChapters(id)
    getPdfs(id)
  }, [isClient])

  const handleCardClick = (index: number) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index)
  }

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
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
      <div className='flex-1 space-y-4 p-8 pl-40 pr-40 pt-6'>
        <Tabs defaultValue='subjects' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='subjects'>Subjects</TabsTrigger>
            <TabsTrigger value='history'>History</TabsTrigger>
          </TabsList>

          <TabsContent value='subjects' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-1'>
              {isLoadingChapters ? (
                <div className='text-center text-xl'>Loading chapters...</div>
              ) : chapters.length === 0 ? (
                <div className='text-center text-xl'>No chapters available</div>
              ) : (
                chapters.map((chapter, index) => (
                  <Card
                    key={index}
                    className='cursor-pointer transition-shadow hover:shadow-lg'
                    onClick={() => handleCardClick(index)}
                  >
                    <Accordion
                      type='single'
                      collapsible
                      value={
                        openAccordionIndex === index ? `item-${index}` : ''
                      }
                      onValueChange={value => {
                        setOpenAccordionIndex(
                          value === `item-${index}` ? index : null
                        )
                      }}
                    >
                      <AccordionItem value={`item-${index}`}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 px-6 py-4'>
                          <CardTitle className='text-2xl font-bold'>
                            {chapter.name}
                          </CardTitle>
                          <AccordionTrigger className='text-m ml-4 font-medium' />
                        </CardHeader>
                        <AccordionContent>
                          <CardContent className='l-6 flex h-full flex-col items-start justify-start'>
                            <div className='mb-4 text-left text-xl font-medium'>
                              Content
                            </div>
                            <Carousel className='w-full overflow-hidden pb-5 pl-10 pr-10 pt-5'>
                              {isLoadingPdfs ? (
                                <div className='flex w-full items-center justify-center'>
                                  <div className='text-center text-xl'>
                                    Loading PDFs...
                                  </div>
                                </div>
                              ) : !pdfsByChapter[chapter.id] ||
                                pdfsByChapter[chapter.id].length === 0 ? (
                                <div className='flex w-full items-center justify-center'>
                                  <div className='text-center text-xl'>
                                    No PDFs available
                                  </div>
                                </div>
                              ) : (
                                <CarouselContent className='-ml-2 flex gap-2 md:-ml-4'>
                                  {pdfsByChapter[chapter.id].map(
                                    (pdf: Pdf, pdfIndex: number) => (
                                      <CarouselItem
                                        key={pdfIndex}
                                        className='carousel-item max-w-sm flex-grow pl-2 md:basis-1/3 md:pl-4 lg:basis-1/3'
                                        style={{ maxWidth: '12rem' }}
                                        onClick={event =>
                                          handleDownload(pdf, event)
                                        }
                                      >
                                        <div className='p-1'>
                                          <Card>
                                            <CardContent className='flex flex-col items-center justify-center p-6'>
                                              <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth='1.5'
                                                stroke='currentColor'
                                                className='h-[20%] w-[40%]'
                                              >
                                                <path
                                                  strokeLinecap='round'
                                                  strokeLinejoin='round'
                                                  d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
                                                />
                                              </svg>
                                              <div className='mt-2 w-full max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs font-medium sm:text-sm md:text-sm lg:text-base'>
                                                {pdf.file_name.slice(
                                                  pdf.file_name.indexOf('_') + 1
                                                )}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      </CarouselItem>
                                    )
                                  )}
                                </CarouselContent>
                              )}
                            </Carousel>
                            <div className='mt-4 flex justify-start space-x-4'>
                              <Button
                                id='btn-upload'
                                onClick={event => {
                                  event.stopPropagation()
                                  handleOpenModal(index)
                                }}
                              >
                                Open Upload Modal
                              </Button>
                              <Button
                                onClick={event => {
                                  event.stopPropagation()
                                  handleRedirect(chapter.id)
                                }}
                                className='flex items-center'
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='2'
                                  className='mr-2 h-4 w-4'
                                >
                                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                                </svg>
                                Test
                              </Button>
                              <Button onClick={(event) => {
                                event.stopPropagation();
                                togglePopup();
                              }} className='btn'>
                                Summary
                              </Button>
                              {isPopupOpen && <PopUp isOpen={isPopupOpen} onClose={togglePopup} />}
                            </div>
                          </CardContent>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value='history'></TabsContent>
        </Tabs>
        <UploadPdfModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          chapter_id={selectedChapterId}
          getPdfs={getPdfs}
        />
      </div>
    </div >
  )
}
