import React from 'react'
import UploadFormClient from './UploadFormClient'

const page = () => {
  return (
    <main className='wrapper container'>
        <div className="mx-auto max-w-180 space-y-10">
            <section className='flex flex-col gap-5'>
                <h1 className='page-title-xl'>Add a new book</h1>
                <p className='subtitle'>Upload a PDF to generate your interactive interview</p>
            </section>
            <UploadFormClient />
        </div>
    </main>
  )
}

export default page