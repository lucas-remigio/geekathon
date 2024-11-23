'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
} from '@/components/ui/carousel';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import UploadPdfModal from './UploadPdfModal';

export default function SubjectDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const params = useParams();

  // Prevent SSR errors by ensuring router-dependent code runs on the client
  const isClient = typeof window !== 'undefined';

  const handleRedirect = () => {
    if (!isClient || !params) return;
    const currentPath = `/subjects/${params.name}`;
    router.push(`${currentPath}/test`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getPdfs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/pdfs');
      const data = await response.json();
      setPdfs(data)
      setIsLoading(false); 
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      document.title = 'Subject Details';
    }

    getPdfs();

  }, [isClient]);


  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 pr-40 pl-40">
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('.carousel-button') ||
                      target.closest('.carousel-item') ||
                      target.closest('#btn-upload')
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
                    onValueChange={(value) => setAccordionOpen(value === 'item-1')}
                  >
                    <AccordionItem value="item-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-6">
                        <CardTitle className="text-2xl font-bold">
                          Chapter 1 - LLM
                        </CardTitle>
                        <AccordionTrigger className="ml-4 text-m font-medium" />
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="flex flex-col items-start justify-start h-full l-6">
                        <div className="text-xl font-medium text-left mb-4">Content</div>
                        <Carousel className="w-full overflow-hidden pl-10 pr-10 pt-5 pb-5">
                          {isLoading ? (
                            <div className="flex items-center justify-center w-full"> {/* Ensures the container has height and centers content */}
                              <div className="text-center text-xl">Loading PDFs...</div>
                            </div>
                          ) : pdfs.length === 0 ? (
                            <div className="flex items-center justify-center w-full">
                              <div className="text-center text-xl">No PDFs available</div>
                            </div>
                          ) : (
                            <CarouselContent className="flex gap-2 -ml-2 md:-ml-4">
                              {pdfs.map((pdf, index) => (
                                <CarouselItem
                                  key={index}
                                  className="flex-grow md:basis-1/3 lg:basis-1/3 pl-2 md:pl-4 max-w-sm carousel-item"
                                  style={{ maxWidth: "12rem" }}
                                >
                                  <div className="p-1">
                                    <Card>
                                      <CardContent className="flex flex-col items-center justify-center p-6">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="w-[40%] h-[20%]"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                          />
                                        </svg>
                                        <div className="mt-2 text-center font-medium overflow-hidden text-ellipsis whitespace-nowrap w-full max-w-[200px] text-xs sm:text-sm md:text-sm lg:text-base">
                                          {pdf.file_name.slice(pdf.file_name.indexOf('_') + 1)}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                          )}
                          <CarouselPrevious className="ml-12 carousel-button" />
                          <CarouselNext className="mr-12 carousel-button" />
                        </Carousel>
                        <div className="flex justify-start space-x-4 mt-4">
                          <Button id="btn-upload" onClick={handleOpenModal}>
                            Open Upload Modal
                          </Button>
                          <Button onClick={handleRedirect} className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            Test
                          </Button>
                        </div>
                      </CardContent>
                    </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz 1</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Quiz Content</div>
                  <p className="text-xs text-muted-foreground">
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
  );
}
