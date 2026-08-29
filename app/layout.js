import './globals.css'

export const metadata = {
  title: 'Zámočnícka správa',
  description: 'Správa zámočníckych zákaziek a projektov',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  )
}
