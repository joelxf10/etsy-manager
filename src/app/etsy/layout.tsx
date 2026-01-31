import Sidebar from '@/components/Sidebar'

export default function EtsyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar platform="etsy" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
