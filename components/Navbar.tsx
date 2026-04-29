import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <div className="w-full fixed z-50 bg-('--bg-primary') text-('--text-primary')">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link className='flex gap-0.5 items-center' href='/'>
           <Image src='/assets/logo.png' alt='bookilied' width={46} height={26} />
        </Link>
      </div>
    </div>
  )
}

export default Navbar