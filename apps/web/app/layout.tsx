import Footer from '@/components/ui/footer';
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />

        <Footer />
      </body>
    </html>
  );
}


