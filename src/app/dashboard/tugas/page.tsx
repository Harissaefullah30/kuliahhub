'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Clock, Download, CheckCircle2, Circle, BookOpen, Search, AlertTriangle, ListTodo } from 'lucide-react'
import Link from 'next/link'

type Task = {
  id: string
  course_id: string
  title: string
  type: string
  deadline: string
  status: string
  file_url: string
  courses: { name: string }
}

function TaskListContent() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Semua') // Semua, Belum Selesai, Selesai
  const [search, setSearch] = useState('')

  const fetchTasks = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    // Ambil semua materials yang tipenya 'Tugas' atau 'Ujian' milik user ini
    const { data, error } = await supabase
      .from('materials')
      .select('*, courses(name)')
      .eq('user_id', user.id)
      .in('type', ['Tugas', 'Ujian'])
      .order('deadline', { ascending: true })

    if (!error && data) setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [router])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Selesai' ? 'Belum Selesai' : 'Selesai'
    
    // Ubah UI langsung (Optimistic Update)
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))

    // Simpan ke database
    await supabase.from('materials').update({ status: newStatus }).eq('id', id)
  }

  const filteredTasks = tasks.filter(task => {
    const matchFilter = filter === 'Semua' || task.status === filter
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                        (task.courses?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isOverdue = (deadline: string, status: string) => {
    if (!deadline || status === 'Selesai') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(deadline) < today
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] flex items-center gap-2">
                <ListTodo className="text-[#4A90D9]" /> Daftar Tugas & Ujian
              </h1>
              <p className="text-sm text-gray-500">Pantau semua tenggat waktu kamu di sini.</p>
            </div>
          </div>
        </div>

        {/* Toolbar Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari tugas atau mata kuliah..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:ring-2 focus:ring-[#4A90D9] outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['Semua', 'Belum Selesai', 'Selesai'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  filter === f ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List Tugas */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Memuat data tugas...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Tidak ada tugas ditemukan</h3>
            <p className="text-gray-500 text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => {
              const overdue = isOverdue(task.deadline, task.status)
              const isDone = task.status === 'Selesai'

              return (
                <div key={task.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 ${isDone ? 'border-green-100 opacity-60' : overdue ? 'border-red-200 shadow-red-100/50' : 'border-gray-100 hover:border-[#4A90D9] hover:shadow-md'}`}>
                  <div className="flex gap-4 items-start">
                    
                    {/* Tombol Checkbox Selesai */}
                    <button 
                      onClick={() => toggleStatus(task.id, task.status)}
                      className={`mt-1 shrink-0 transition-transform hover:scale-110 ${isDone ? 'text-green-500' : 'text-gray-300 hover:text-[#4A90D9]'}`}
                      title={isDone ? "Tandai Belum Selesai" : "Tandai Selesai"}
                    >
                      {isDone ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${task.type === 'Ujian' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#1E3A5F]'}`}>
                          {task.type}
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                          {task.courses?.name || 'Mata Kuliah Terhapus'}
                        </span>
                        {overdue && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md flex items-center gap-1">
                            <AlertTriangle size={12} /> Terlewat
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-lg font-bold transition-colors ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>

                      <div className="flex items-center gap-5 mt-3 text-sm">
                        <span className={`flex items-center gap-1.5 font-bold ${overdue ? 'text-red-500' : isDone ? 'text-gray-400' : 'text-orange-500'}`}>
                          <Clock size={16} />
                          {task.deadline ? `Tenggat: ${formatDate(task.deadline)}` : 'Tanpa Tenggat'}
                        </span>

                        {task.file_url && (
                          <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#4A90D9] hover:text-blue-700 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Download size={16} /> Lampiran
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TaskListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <TaskListContent />
    </Suspense>
  )
}