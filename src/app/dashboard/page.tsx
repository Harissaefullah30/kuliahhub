'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut, BookOpen, Search, FolderOpen, ChevronDown, ChevronUp, User, GraduationCap, AlertTriangle, Clock, CheckCircle2, FileText, CalendarDays, Plus, ListTodo, PieChart, IdCard, Pencil, X, Save } from 'lucide-react'
import Link from 'next/link'

type Course = {
  id: string
  name: string
  lecturer: string
  semester: number
  schedule_day: string
  schedule_time: string
  duration: number
}

type Task = {
  id: string
  course_id: string
  title: string
  deadline: string
  status: string
  courses: { name: string }
}

function DashboardContent() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [openSemesters, setOpenSemesters] = useState<number[]>([])

  // State Profil
  const [profile, setProfile] = useState<{ full_name: string; nim: string; avatar_url: string }>({
    full_name: 'Mahasiswa', nim: '-', avatar_url: ''
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editNim, setEditNim] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // State Jam
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const meta = user.user_metadata || {}
    const defaultName = user.email ? user.email.split('@')[0] : 'Mahasiswa'
    setProfile({ full_name: meta.full_name || defaultName, nim: meta.nim || 'Belum Diatur', avatar_url: meta.avatar_url || '' })
    setEditName(meta.full_name || defaultName)
    setEditNim(meta.nim || '')

    const { data: courseData } = await supabase.from('courses').select('*').eq('user_id', user.id).order('semester', { ascending: true })
    if (courseData) setCourses(courseData)

    const { data: taskData } = await supabase.from('materials').select('*, courses(name)').eq('user_id', user.id).eq('type', 'Tugas').order('deadline', { ascending: true })
    if (taskData) setTasks(taskData)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
    if (uploadError) { alert('Gagal upload foto: ' + uploadError.message); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
    setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
    setUploadingAvatar(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: editName, nim: editNim } })
    if (!error) { setProfile(prev => ({ ...prev, full_name: editName, nim: editNim })); setIsEditProfileOpen(false); } 
    else { alert('Gagal menyimpan profil: ' + error.message); }
    setSavingProfile(false)
  }

  const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(searchQuery.toLowerCase()) || (course.lecturer && course.lecturer.toLowerCase().includes(searchQuery.toLowerCase())))
  const groupedCourses = filteredCourses.reduce((acc: Record<number, Course[]>, course) => {
    const sem = course.semester || 1
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(course)
    return acc
  }, {})
  const sortedSemesters = Object.keys(groupedCourses).map(Number).sort((a, b) => a - b)
  const toggleSemester = (sem: number) => { setOpenSemesters(prev => prev.includes(sem) ? prev.filter(s => s !== sem) : [...prev, sem]) }

  const activeTasksCount = tasks.filter(t => t.status !== 'Selesai').length
  const completedTasksCount = tasks.filter(t => t.status === 'Selesai').length
  const totalTasks = tasks.length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100)

  const today = new Date()
  const todayName = today.toLocaleDateString('id-ID', { weekday: 'long' }) 
  const todayClasses = courses.filter(c => c.schedule_day === todayName)

  today.setHours(0, 0, 0, 0)
  const urgentTasks = tasks.filter(task => {
    if (!task.deadline || task.status === 'Selesai') return false
    const deadlineDate = new Date(task.deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0 
  })

  const getEndTime = (start: string, duration: number) => {
    if (!start || !duration) return ''
    const [h, m] = start.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    date.setMinutes(date.getMinutes() + duration)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-12">
      <nav className="bg-[#1E3A5F] text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#1E3A5F] w-9 h-9 rounded-xl flex items-center justify-center shadow-md"><GraduationCap size={20} /></div>
            <span className="font-bold text-xl tracking-wide">KuliahHub</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-all">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        
        {/* WIDGET JAM & TANGGAL REAL-TIME */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8A] p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Clock size={24} className="text-yellow-300" />
            </div>
            <div>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mb-0.5">Waktu Saat Ini</p>
              <h2 className="text-3xl font-extrabold tracking-tight tabular-nums leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
              </h2>
            </div>
          </div>
          
          <div className="text-left md:text-right relative z-10">
            <p className="text-sm font-bold text-white">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">Semangat mengerjakan tugas hari ini! 🚀</p>
          </div>
        </div>

        {/* KARTU PROFIL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-50 rounded-bl-full pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-[#1E3A5F] overflow-hidden flex items-center justify-center shadow-lg">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <User size={40} className="text-gray-400" />}
              </div>
              <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <span className="text-xs font-bold">{uploadingAvatar ? 'Upload...' : 'Ganti Foto'}</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#1E3A5F] capitalize">{profile.full_name}</h2>
              <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1"><IdCard size={16} /> {profile.nim}</p>
              <p className="text-xs text-gray-400 mt-2">Mahasiswa Aktif • KuliahHub</p>
            </div>
          </div>
          <button onClick={() => setIsEditProfileOpen(true)} className="relative z-10 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Pencil size={16} /> Edit Profil
          </button>
        </div>

        {/* Modal Edit Profil */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg text-gray-800">Edit Profil</h3><button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button></div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label><input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] outline-none text-gray-800" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">NIM</label><input type="text" required value={editNim} onChange={e => setEditNim(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A90D9] outline-none text-gray-800" /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button><button type="submit" disabled={savingProfile} className="px-4 py-2 text-sm bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white rounded-lg flex items-center gap-2"><Save size={16}/> {savingProfile ? 'Menyimpan...' : 'Simpan'}</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Peringatan Deadline */}
        {urgentTasks.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={20} /></div>
              <div><h2 className="font-bold text-red-800 text-lg">Peringatan Deadline!</h2><p className="text-sm text-red-600">Ada tugas yang harus segera diselesaikan.</p></div>
            </div>
            <div className="space-y-3">
              {urgentTasks.map(task => {
                const deadlineDate = new Date(task.deadline)
                const diffTime = deadlineDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return (
                  <div key={task.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-red-100">
                    <div><h3 className="font-bold text-gray-800">{task.title}</h3><p className="text-xs text-gray-500">{task.courses?.name}</p></div>
                    <div className="text-right"><span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${diffDays === 0 ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}`}>{diffDays === 0 ? 'Hari Ini!' : `${diffDays} Hari Lagi`}</span></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* GRID RINGKASAN: Progress, Tugas Aktif/Selesai, dan Jadwal Hari Ini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Progress Tugas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-[#1E3A5F] shrink-0"><PieChart size={24} /></div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2"><p className="text-sm font-bold text-gray-600">Progress Tugas</p><p className="text-lg font-extrabold text-[#1E3A5F]">{progressPercent}%</p></div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-[#4A90D9] to-[#1E3A5F] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div></div>
              <p className="text-xs text-gray-400 mt-2">{completedTasksCount} Selesai dari {totalTasks} Tugas</p>
            </div>
          </div>

          {/* 2. Tugas Aktif & Selesai */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Clock size={16} /></div>
                Tugas Aktif
              </div>
              <span className="text-lg font-extrabold text-[#1E3A5F]">{activeTasksCount}</span>
            </div>
            <div className="flex items-center justify-between w-full border-t border-gray-50 pt-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                Selesai
              </div>
              <span className="text-lg font-extrabold text-[#1E3A5F]">{completedTasksCount}</span>
            </div>
          </div>

          {/* 3. Jadwal Hari Ini */}
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8A] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
            <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-3"><CalendarDays size={18} className="text-yellow-300" /><h3 className="font-bold text-white text-sm">Jadwal Hari Ini ({todayName})</h3></div>
            {todayClasses.length === 0 ? (
              <p className="text-xs text-blue-100 text-center py-2">Tidak ada jadwal kuliah hari ini. Santai! 🎉</p>
            ) : (
              <div className="space-y-2">
                {todayClasses.slice(0, 2).map(cls => (
                  <div key={cls.id} className="flex justify-between items-center bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                    <div><h4 className="font-bold text-white text-xs">{cls.name}</h4><p className="text-[10px] text-blue-200">{cls.schedule_time || '--:--'} WIB</p></div>
                    <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-1 rounded-md">{cls.lecturer || 'Dosen'}</span>
                  </div>
                ))}
                {todayClasses.length > 2 && <p className="text-[10px] text-blue-200 text-center mt-1">+{todayClasses.length - 2} jadwal lainnya</p>}
              </div>
            )}
          </div>

        </div>

        {/* Jadwal Mingguan (Desain Card Ringkas & Elegan) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <CalendarDays size={20} className="text-[#4A90D9]" />
            <h3 className="font-bold text-[#1E3A5F] text-lg">Jadwal Kuliah Mingguan</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, index) => {
              const classesOnDay = courses.filter(c => c.schedule_day === day).sort((a, b) => (a.schedule_time || '').localeCompare(b.schedule_time || ''));
              const isToday = todayName === day;

              const getEndTime = (start: string, duration: number) => {
                if (!start || !duration) return '';
                const [h, m] = start.split(':').map(Number);
                const date = new Date();
                date.setHours(h, m, 0, 0);
                date.setMinutes(date.getMinutes() + duration);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              };

              return (
                <div key={day} className={`rounded-xl border p-3 flex flex-col gap-2 ${isToday ? 'border-[#4A90D9] bg-blue-50/30 shadow-sm' : 'border-gray-100 bg-gray-50/30'}`}>
                  <div className={`text-[11px] font-bold text-center pb-2 border-b ${isToday ? 'text-[#1E3A5F] border-blue-200' : 'text-gray-400 border-gray-200'}`}>
                    {day} {isToday && '📍'}
                  </div>
                  
                  {classesOnDay.length === 0 ? (
                    <p className="text-[10px] text-gray-400 text-center italic mt-2">Kosong</p>
                  ) : (
                    classesOnDay.map(cls => (
                      <div key={cls.id} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden group hover:border-[#4A90D9] transition-colors">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${index % 2 === 0 ? 'bg-[#1E3A5F]' : 'bg-[#4A90D9]'}`}></div>
                        <h5 className="font-bold text-[10px] text-gray-800 leading-tight mb-1 pl-1.5 truncate">{cls.name}</h5>
                        <p className="text-[8px] text-[#4A90D9] font-bold pl-1.5">
                          {cls.schedule_time} - {getEndTime(cls.schedule_time, cls.duration) || 'Selesai'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tombol Cepat (3 Kolom Sejajar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Tombol 1: Tambah MK */}
          <Link href="/courses/add" className="group relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8A] text-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(30,58,95,0.3)] hover:shadow-[0_8px_30px_rgb(30,58,95,0.5)] flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95">
            <div className="bg-white/20 p-2.5 rounded-full group-hover:scale-110 transition-transform duration-300"><Plus size={22} /></div>
            <span className="font-bold text-sm tracking-wide z-10">Tambah MK</span>
          </Link>

          {/* Tombol 2: Lihat Tugas */}
          <Link href="/dashboard/tugas" className="group relative overflow-hidden bg-white border border-gray-200 hover:border-[#1E3A5F] text-[#1E3A5F] p-4 rounded-2xl shadow-lg hover:shadow-xl flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95">
             <div className="bg-blue-50 p-2.5 rounded-full group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors duration-300 group-hover:rotate-6"><ListTodo size={22} /></div>
            <span className="font-bold text-sm tracking-wide">Lihat Tugas</span>
          </Link>

          {/* Tombol 3: Ruang Skripsi */}
          <Link href="/thesis" className="group relative overflow-hidden bg-white border border-gray-200 hover:border-[#1E3A5F] text-[#1E3A5F] p-4 rounded-2xl shadow-lg hover:shadow-xl flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-95">
             <div className="bg-blue-50 p-2.5 rounded-full group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors duration-300">
              <GraduationCap size={22} />
            </div>
            <span className="font-bold text-sm tracking-wide">Ruang Skripsi</span>
          </Link>
          
        </div>

        {/* List Mata Kuliah */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Materi & Tugas Kuliah</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola semua materi dan tugas perkuliahanmu di sini.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Cari Mata Kuliah atau Dosen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
        </div>

        {/* Tampilan Folder Semester */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : sortedSemesters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada Mata Kuliah</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah MK" di pengaturan untuk memulai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSemesters.map(sem => {
              const isOpen = openSemesters.includes(sem) || searchQuery.length > 0
              return (
                <div key={sem} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => toggleSemester(sem)} className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8A] p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3 text-white">
                      <FolderOpen size={20} className="text-yellow-300" />
                      <h2 className="font-bold text-lg">Semester {sem}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{groupedCourses[sem].length} Mata Kuliah</span>
                      {isOpen ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      {groupedCourses[sem].map((mk) => (
                        <div key={mk.id} className="p-4 rounded-xl border border-gray-100 hover:border-[#4A90D9] hover:bg-blue-50/30 transition-all group flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-[#1E3A5F] transition-colors">{mk.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5"><User size={14} /> {mk.lecturer || 'Dosen belum diisi'}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                            <Link href={`/courses/${mk.id}`} className="text-xs font-bold text-[#4A90D9] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                              <FileText size={14} /> Lihat Tugas & Materi
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <DashboardContent />
    </Suspense>
  )
}