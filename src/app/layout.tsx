import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}