import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="h-40 bg-gray-100 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[#6967ec]"
        >
          <Image src="/logo.svg" alt="Drive logo" width={30} height={30} />
          FileDrive
        </Link>

        <Link className="text-blue-400 hover:text-blue-500" href="#">
          Privacy Policy
        </Link>
        <Link className="text-blue-400 hover:text-blue-500" href="#">
          Terms of Service
        </Link>
        <Link className="text-blue-400 hover:text-blue-500" href="#">
          About
        </Link>
      </div>
    </footer>
  )
}
