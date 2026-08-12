import CookieLocaleProvider from '@/components/providers/CookieLocaleProvider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <CookieLocaleProvider>{children}</CookieLocaleProvider>
}
