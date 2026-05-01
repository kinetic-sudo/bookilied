import React from 'react'
import { auth } from '@clerk/nextjs/server'

const page = async () => {
  const { userId } = await auth()

  return (
    <div>
      {/* {userId ? <p>Signed in</p> : <p>Signed out</p>} */}
      {/* <h1 className='text-2xl underline'>Bookilied</h1> */}
    </div>
  )
}

export default page