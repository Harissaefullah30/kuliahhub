'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, BookOpen, User, Hash, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function AddCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [lecturer, setLecturer] = useState('')
  const [semester, setSemester] = useState('1')
  const [scheduleDay, setScheduleDay] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [duration, setDuration] = useState('100') 

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      lecturer,
      semester: parseInt(semester),
      schedule_day: scheduleDay,
      schedule_time: scheduleTime,
      duration: parseInt(duration)
    })

    if (!error) {
      router.push('/dashboard')
    } else {
      alert('Gagal menyimpan: ' + error.message)
      setLoading(false)
    }
  }

  // Helper untuk preview jam selesai
  const getEndTime = () => {
    if (!scheduleTime || !duration) return '--:--'
    const [h, m] = scheduleTime.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    date.setMinutes(date.getMinutes() + parseInt(duration))
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="w-full max-w-3xl mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1E3A5F] bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8A] p-8 text-white flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <BookOpen size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tambah Mata Kuliah Baru</h1>
            <p className="text-blue-100 text-sm mt-1">Isi detail mata kuliah untuk mengelola tugas dan materi.</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* SECTION 1: Info Utama */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs">1</span>
                Informasi Utama
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Mata Kuliah <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BookOpen size={18} className="text-gray-400" /></div>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Pemrograman Web" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Dosen</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                    <input type="text" value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Budi Santoso, M.Kom" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash size={18} className="text-gray-400" /></div>
                    <select required value={semester} onChange={e => setSemester(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 bg-white transition-all">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* SECTION 2: Jadwal */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs">2</span>
                Jadwal Rutin
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Hari Kuliah</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setScheduleDay(day)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        scheduleDay === day 
                          ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-md' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mulai</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock size={18} className="text-gray-400" /></div>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durasi (Menit)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock size={18} className="text-gray-400" /></div>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="100" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 transition-all" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <Calendar size={12}/> 
                {scheduleTime && duration 
                  ? `Kuliah akan berakhir sekitar pukul ${getEndTime()} WIB.` 
                  : '*Jadwal ini akan muncul di Dashboard.'}
              </p>
            </div>

            <div className="pt-6 flex justify-end">
              <button type="submit" disabled={loading} className="bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                <CheckCircle2 size={20} /> {loading ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}