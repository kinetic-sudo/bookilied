import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const steps = [
    { title: 'Upload PDF', description: 'Add your book file' },
    { title: 'AI Processing', description: 'We analyze the content' },
    { title: 'Voice Chat', description: 'Discuss with AI' },
  ]

const HomePageSection = () => {
  return (
    <>
    <section className='wrapper pt-28 mb-10 md:mb-16'>
      <div className='library-hero-card'>
        <div className='library-hero-content  lg:items-center'>
          <div className='library-hero-text'>
            <h1 className='library-hero-title'>Your Library</h1>
            <p className='library-hero-description max-w-[370px]'>
              Convert your books into interactive AI conversations. Listen, learn, and discuss your
              favorite reads.
            </p>
            <Link href='/books/new' className='library-cta-primary w-fit px-6 py-3.5'>
              <span className='text-2xl leading-none'>+</span>
              <span>Add new book</span>
            </Link>
          </div>

          <div className='library-hero-illustration-desktop max-w-[360px]'>
            <Image
              src='/assets/hero-illustration.png'
              alt='Vintage books and globe'
              width={362}
              height={232}
              className='w-full h-auto object-contain'
              priority
            />
          </div>

          <div className='library-hero-illustration'>
            <Image
              src='/assets/hero-illustration.png'
              alt='Vintage books and globe'
              width={300}
              height={190}
              className='w-full max-w-[300px] h-auto object-contain'
              priority
            />
          </div>

          <div className='library-steps-card w-full lg:w-[250px] space-y-5 shrink-0'>
            {steps.map((step, index) => (
              <div className='library-step-item' key={step.title}>
                <span className='library-step-number'>{index + 1}</span>
                <div>
                  <p className='library-step-title'>{step.title}</p>
                  <p className='library-step-description'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <div className='library-hero-grid'>

    </div>
    </>
  )
}

export default HomePageSection