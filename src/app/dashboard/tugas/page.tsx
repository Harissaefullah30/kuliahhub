'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Clock, Download, CheckCircle2, Circle, BookOpen, Search, AlertTriangle, ListTodo, Pencil, Trash2, X, Users, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

type Task = {
  id: string
  course_id: string
  title: string
  type: string
  deadline: string
  status: string
  file_url: string
  task_type: string
  group_name: string
  group_members: string
  courses: { name: string }
}

function TaskListContent() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

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

  // Fungsi Tandai Selesai (Ceklis)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Selesai' ? 'Belum Selesai' : 'Selesai'
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    await supabase.from('materials').update({ status: newStatus }).eq('id', id)
  }

  // Fungsi Buka Modal Edit
  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDeadline(task.deadline || '')
    setEditStatus(task.status)
    setIsEditModalOpen(true)
  }

  // Fungsi Simpan Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    setSavingEdit(true)
    
    const { error } = await supabase
      .from('materials')
      .update({ 
        title: editTitle, 
        deadline: editDeadline || null, 
        status: editStatus 
      })
      .eq('id', editingTask.id)

    if (!error) {
      setIsEditModalOpen(false)
      fetchTasks() // Refresh data
    } else {
      alert('Gagal mengedit: ' + error.message)
    }
    setSavingEdit(false)
  }

  // Fungsi Hapus Tugas
  const handleDelete = async (id: string, fileUrl: string) => {
    if (!window.confirm('Yakin ingin menghapus tugas ini?')) return

    // Hapus file dari storage jika ada
    if (fileUrl && fileUrl.includes('/storage/v1/object/public/')) {
      const fileName = fileUrl.split('/').pop()
      if (fileName) await supabase.storage.from('materials').remove([fileName])
    }

    // Hapus dari database
    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (!error) {
      fetchTasks()
    } else {
      alert('Gagal menghapus: ' + error.message)
    }
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none transition-all"
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
                <div key={task.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 relative group ${isDone ? 'border-green-100 opacity-60' : overdue ? 'border-red-200 shadow-red-100/50' : 'border-gray-100 hover:border-[#4A90D9] hover:shadow-md'}`}>
                  
                  {/* Tombol Aksi (Edit & Hapus) */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => openEditModal(task)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Edit Tugas">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(task.id, task.file_url)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus Tugas">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex gap-4 items-start pr-16">
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

                        {/* Badge Individu/Kelompok */}
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${task.task_type === 'Kelompok' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                          {task.task_type || 'Individu'}
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

                      {/* Info Kelompok (Jika Ada) */}
                      {task.task_type === 'Kelompok' && task.group_name && (
                        <div className="mt-2 bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg inline-block w-full max-w-md">
                          <p className="text-xs font-bold text-orange-800 flex items-center gap-1.5"><Users size={14} /> {task.group_name}</p>
                          <p className="text-[11px] text-orange-600 mt-0.5">Anggota: {task.group_members || '-'}</p>
                        </div>
                      )}

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

      {/* Modal Edit Tugas */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">Edit Tugas</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Tugas</label>
                <input 
                  type="text" 
                  required 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deadline</label>
                <input 
                  type="date" 
                  value={editDeadline} 
                  onChange={e => setEditDeadline(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none"
                >
                  <option value="Belum Selesai">Belum Selesai</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={savingEdit} className="px-5 py-2 text-sm bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white font-bold rounded-lg disabled:opacity-50">
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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