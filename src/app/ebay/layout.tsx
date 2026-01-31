import Sidebar from '@/components/Sidebar'

export default function EbayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar platform="ebay" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
