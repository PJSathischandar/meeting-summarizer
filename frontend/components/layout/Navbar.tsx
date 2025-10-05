'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={isSignedIn ? "/dashboard" : "/"}>
          <h1 className="text-2xl font-bold text-primary-600">Meeting Summarizer</h1>
        </Link>
        
        <div className="flex items-center space-x-6">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600">
                Pricing
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
