'use client';

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import UploadPdfModal from './UploadPdfModal'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubjectDetailPage() {

  const [isModalOpen, setIsModalOpen] = useState(false)

  const router = useRouter()
  const params = useParams()

  if (typeof window === 'undefined') {
    return null // Prevent using router during server-side rendering
  }

  const handleRedirect = () => {
    const currentPath = `/subjects/${params.name}` // Construct the current path dynamically
    router.push(`${currentPath}/test`) // Redirect to `/subjects/:name/test`
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    document.title = 'Subject Details'
  }, [])
    // State to manage the accordion's open/close status
  const [accordionOpen, setAccordionOpen] = useState(false);

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
      <div className="flex-1 space-y-4 p-8 pt-6 pr-40 pl-40">
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value='subjects'>Subjects</TabsTrigger>
            <TabsTrigger value='history'>History</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={(e) => {
                // Ensure the toggle logic only runs when clicking the card, not the carousel buttons
                const target = e.target as HTMLElement;
                if (
                  target.closest('.carousel-button') || // Carousel buttons
                  target.closest('.carousel-item') || // Carousel items
                  target.closest('#btn-upload') // Upload button
                ) {
                  return;
                }
                setAccordionOpen(!accordionOpen);
              }}
            >
              <Accordion
                type="single"
                collapsible
                value={accordionOpen ? 'item-1' : ''}
              >
                <AccordionItem value="item-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-6">
                    <CardTitle className="text-2xl font-bold">Chapter 1 - LLM</CardTitle>
                    <AccordionTrigger className="ml-4 text-m font-medium" />
                  </CardHeader>
                  <AccordionContent>
                    <CardContent>
                      <div className="text-xl font-medium">Content</div>
                      <Carousel className="w-full overflow-hidden pl-10 pr-10">
                        <CarouselContent className="flex gap-2 -ml-2 md:-ml-4">
                          {Array.from({ length: 10 }).map((_, index) => (
                            <CarouselItem
                              key={index}
                              className="flex-grow basis-[calc(20%-0.5rem)] max-w-[calc(20%-0.5rem)] carousel-item"
                            >
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-2xl font-semibold">{index + 1}</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {/* Add a class to distinguish the buttons */}
                        <CarouselPrevious
                          className="ml-12 carousel-button"
                        />
                        <CarouselNext
                          className="mr-12 carousel-button"
                        />
                      </Carousel>
                        <Button id="btn-upload" onClick={handleOpenModal} className="mt-4">
                                      Open Upload Modal
                        </Button>
                        <Button onClick={handleRedirect} className='flex items-center'>
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
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value='history' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-1'>
              <Card className='cursor-pointer transition-shadow hover:shadow-lg'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Quiz 1</CardTitle>
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
                  <div className='text-2xl font-bold'>Quiz Content</div>
                  <p className='text-xs text-muted-foreground'>
                    This is the quiz overview.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <UploadPdfModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
