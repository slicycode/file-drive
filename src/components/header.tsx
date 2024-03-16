import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'

const Header = () => {
  return (
    <div className="border-b py-4 bg-gray-50 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex gap-2 font-bold text-[#6967ec]">
          <Image src="/logo.svg" alt="Drive logo" width={30} height={30} />
          FileDrive
        </Link>

        <div className="flex items-center gap-2">
          <SignedIn>
            <Button variant="outline" className="mr-4">
              <Link href="/dashboard/files">Your Files</Link>
            </Button>
          </SignedIn>
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton
              afterSignUpUrl="/dashboard/files"
              afterSignInUrl="/dashboard/files"
            >
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  )
}

export default Header
