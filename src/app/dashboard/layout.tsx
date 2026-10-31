import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Panggil Sidebar di sini */}
      <Sidebar />
      
      {/* Area Konten Utama (diberi margin kiri agar tidak tertutup sidebar di desktop) */}
      <main className="md:ml-64 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  )
}