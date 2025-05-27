import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="bg-red-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image src="/logo.png" alt="EazyMove Logo" width={30} height={30} className="mr-2" />
            <span className="text-2xl font-semibold text-white">EazyMove</span>
          </div>
          <div>
            <Button asChild variant="secondary" className="bg-white text-red-600 hover:bg-red-50">
              <Link href="/auth/login">Logout</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
