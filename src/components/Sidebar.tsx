'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  ListTodo, 
  Link as LinkIcon, 
  GraduationCap, 
  PlusCircle, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lihat Tugas', href: '/dashboard/tugas', icon: ListTodo },
    { name: 'Pusat Referensi', href: '/dashboard/referensi', icon: LinkIcon },
    { name: 'Catatan Cepat', href: '/dashboard/catatan', icon: FileText },
    { name: 'Ruang Skripsi', href: '/thesis', icon: GraduationCap },
    { name: 'Tambah Mata Kuliah', href: '/courses/add', icon: PlusCircle },
  ]

  return (
    <>
      {/* Tombol Menu untuk Mobile */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-[#1E3A5F]"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Utama */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8A] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap size={22} />
            </div>
            <span className="font-extrabold text-xl text-[#1E3A5F] tracking-tight">KuliahHub</span>
          </Link>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Menu Utama</p>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-[#1E3A5F] text-white shadow-md shadow-blue-900/10' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1E3A5F]'}
                `}
              >
                {/* Garis Aksen Aktif (hanya muncul di kiri) */}
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#4A90D9] rounded-r-full"></div>
                )}
                
                <div className={`
                  ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#1E3A5F] group-hover:scale-110 transition-transform'}
                `}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                  {item.name}
                </span>

                {/* Panah kecil saat hover */}
                {!isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-300" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Profil & Logout Area */}
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors group border border-gray-100 hover:border-red-100"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow-none transition-shadow">
                <LogOut size={16} />
              </div>
              <span className="font-bold text-sm">Keluar Akun</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}