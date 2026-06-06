import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6 py-24"
        style={{ background: 'linear-gradient(160deg, #fdf6f0 0%, #f5e6d8 50%, #ede0d4 100%)' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">🍞</span>
              <span className="font-playfair text-2xl font-bold text-[#3d2b1f]">Bless Your Loaf</span>
            </Link>
            <h1 className="font-playfair text-3xl font-bold text-[#3d2b1f] mb-2">Welcome back, sugar.</h1>
            <p className="font-lora italic text-[#9a7060]">Your starter missed you.</p>
          </div>
          <LoginForm />
        </div>
      </div>
      <Footer />
    </>
  )
}
