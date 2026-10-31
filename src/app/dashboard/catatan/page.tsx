'use client'

import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import QuickNotes from '@/components/QuickNotes'

export default function CatatanPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Halaman */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} className="text-[#1E3A5F]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F] flex items-center gap-2">
              <Pencil className="text-[#4A90D9]" /> Catatan Cepat
            </h1>
            <p className="text-sm text-gray-500">Papan tulis dan catatan ide-idemu di sini.</p>
          </div>
        </div>

        {/* Panggil Komponen Papan Tulis */}
        <QuickNotes />

      </div>
    </div>
  )
}