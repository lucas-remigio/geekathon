'use client';

import { useParams } from 'next/navigation';

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

export default function SubjectDetailPage() {
  const { name } = useParams();

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
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Capítulo 1 - LLM</CardTitle>
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
                    <div className="text-2xl font-bold"></div>
                    <p className="text-xs text-muted-foreground"></p>
                  </CardContent>
                </Card>
            </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}