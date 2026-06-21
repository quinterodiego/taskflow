import type { Metadata, Viewport } from "next"
import "./globals.css"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

const themeScript = `
(function() {
  var t = localStorage.getItem('theme');
  if (t !== 'light') document.documentElement.classList.add('dark');
})();
`

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Simple task manager",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TaskFlow",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
