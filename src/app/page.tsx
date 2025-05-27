import Link from "next/link"
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-brand-light to-white">
      <div className="text-center space-y-8 ">
        <h1 className="text-4xl font-bold text-red-600">EazyMove Delivery</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">Moving made simple</p>
        <div className="flex gap-4 justify-center ">
          <Button asChild size="lg" className="text-lg px-8 bg-red-600 text-white">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 font-bold text-red-600">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
