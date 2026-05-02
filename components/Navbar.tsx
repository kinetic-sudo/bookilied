'use client'

import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const navItem = [
  {label: 'Liabrary', href: '/'},
  {label: 'Add new', href: '/books/new'}
]

const Navbar = () => {
  const pathName = usePathname()
  const { user } = useUser()

  return (
    <div className="w-full fixed z-50 bg-('--bg-primary') text-('--text-primary')">
      <div className="wrapper mt-3  navbar-height py-4 flex justify-between items-center border-2 border-black rounded-full bg-[#F3E4C7]">
        <Link className='flex gap-0.5 items-center' href='/'>
           <Image src='/assets/logo.png' alt='bookilied' width={46} height={26} />
           <span className='logo-text'>
            Bookilied
           </span>
        </Link>
        <nav className='w-fit flex gap-7 items-center'>
          {navItem.map(({label, href}) => {
            const isActive = pathName === href || (href != '/' && pathName.startsWith(href))

            return (
              <Link href={href} key={label} className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}>
                {label}
              </Link>
            )
          })}
          <div className='flex gap-7.5 items-center'>
          <Show when='signed-out'>
            <SignInButton mode='modal'/>
            <SignUpButton mode='modal'/>
          </Show>
          <Show when='signed-in'>
            <div className='nav-user-link'>
            <UserButton />
            {user?.firstName && (
              <Link href='/subscriptions' className='nav-user-name'>
                {user.firstName}
              </Link>
            )}
            </div>
          </Show>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Navbar