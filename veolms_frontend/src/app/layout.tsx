import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/navbar/Navbar';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'OpenLMS - Next-Gen Modern Learning Platform',
  description: 'Empower your skills with high-definition video courses, interactive progress tracking, and expert-led instructor paths.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Razorpay Checkout SDK Script */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <footer className="w-full border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 bg-slate-950/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="font-semibold text-slate-400">
                OpenLMS Platform &copy; {new Date().getFullYear()} — Built for scale & high performance.
              </span>
              <div className="flex items-center gap-4 text-slate-400">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
