import type { Metadata, Viewport } from "next"
import "./globals.css"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

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
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
