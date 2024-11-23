'use client';

import Link from 'next/link'
import React, { useState } from 'react';
import PopUp from './popup';

import { cn } from '@/lib/utils'

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link
        href='/subjects'
        className='text-3xl font-bold tracking-tight transition-colors hover:text-primary'
      >
        SubjectsMate
      </Link>
      <button onClick={togglePopup} className='btn'>
        Open Popup
      </button>
      <PopUp isOpen={isPopupOpen} onClose={togglePopup} />
    </nav>
  )
}
