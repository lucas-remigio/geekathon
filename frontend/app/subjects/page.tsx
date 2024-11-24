'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

// Importing the arrow icon from react-icons
import { FaArrowRight } from 'react-icons/fa';

export default function SubjectsPage() {

  const isClient = typeof window !== 'undefined';

  const [subjects, setSubjects] = useState<any[]>([]); // state to store fetched subjects
  const [loading, setLoading] = useState<boolean>(true); // loading state

  const getSubjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/subjects');
      const data = await response.json();
      setSubjects(data); // set the fetched subjects in state
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false); // set loading to false after fetching data
    }
  }

  // Fetch subjects from API on component mount
  useEffect(() => {
    if (isClient) {
      document.title = 'Subjects';
    }
    getSubjects();
  }, [isClient]);

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
            <TabsContent value='subjects' className='space-y-4'>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-t-transparent border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                    role="status"
                  >
                    <span
                      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                    >
                      Loading...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject: any, index: number) => (
                    <Link
                      key={index}
                      href={{
                        pathname: `/subjects/${subject.id}`
                      }}
                      passHref
                    >
                      <Card className="cursor-pointer hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors duration-300 ease-in-out p-4 rounded-lg relative">
                        <div className="absolute right-2 mr-2 text-l text-black dark:text-white">
                          <FaArrowRight />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold"></div>
                          <p className="text-xs text-muted-foreground">{subject.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
