'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Download, BookOpen, Trash2, Pencil, X, Save, Clock, Users, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

type Material = {
  id: string
  title: string
  type: string
  content: string
  file_url: string
  deadline: string
  status: string
  created_at: string
  task_type: string
  group_name: string
  group_members: string
}

function CourseDetailContent() {
  const params = useParams()
  const router = useRouter()
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id

  const [courseName, setCourseName] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State Form
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Teori')
  const [content, setContent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Belum Selesai')
  
  // State Baru untuk Individu/Kelompok
  const [taskType, setTaskType] = useState('Individu')
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchCourseAndMaterials = async () => {
    setLoading(true)
    const { data: courseData } = await supabase.from('courses').select('name').eq('id', courseId).single()
    if (courseData) setCourseName(courseData.name)

    const { data: materialsData } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (materialsData) setMaterials(materialsData)
    setLoading(false)
  }

  useEffect(() => {
    if (courseId) fetchCourseAndMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setTitle('')
    setType('Teori')
    setContent('')
    setDeadline('')
    setStatus('Belum Selesai')
    setTaskType('Individu')
    setGroupName('')
    setGroupMembers('')
    setFile(null)
  }

  const openEditForm = (mat: Material) => {
    setEditingId(mat.id)
    setTitle(mat.title)
    setType(mat.type)
    setContent(mat.content || '')
    setDeadline(mat.deadline || '')
    setStatus(mat.status || 'Belum Selesai')
    setTaskType(mat.task_type || 'Individu')
    setGroupName(mat.group_name || '')
    setGroupMembers(mat.group_members || '')
    setFile(null)
    setIsFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let fileUrl = undefined

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file)

      if (uploadError) {
        alert('Gagal upload file: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName)
      fileUrl = publicUrl
    }

    if (editingId) {
      // Update
      const updateData: any = { 
        title, type, content, deadline: deadline || null, status,
        task_type: (type === 'Tugas' || type === 'Ujian') ? taskType : null,
        group_name: (type === 'Tugas' || type === 'Ujian') && taskType === 'Kelompok' ? groupName : null,
        group_members: (type === 'Tugas' || type === 'Ujian') && taskType === 'Kelompok' ? groupMembers : null
      }
      if (fileUrl) updateData.file_url = fileUrl

      const { error } = await supabase.from('materials').update(updateData).eq('id', editingId)
      if (!error) { closeForm(); fetchCourseAndMaterials() } else { alert('Gagal: ' + error.message) }
    } else {
      // Create
      const { error } = await supabase.from('materials').insert({
        course_id: courseId, user_id: user.id, title, type, content, deadline: deadline || null, status, file_url: fileUrl || '',
        task_type: (type === 'Tugas' || type === 'Ujian') ? taskType : null,
        group_name: (type === 'Tugas' || type === 'Ujian') && taskType === 'Kelompok' ? groupName : null,
        group_members: (type === 'Tugas' || type === 'Ujian') && taskType === 'Kelompok' ? groupMembers : null
      })
      if (!error) { closeForm(); fetchCourseAndMaterials() } else { alert('Gagal: ' + error.message) }
    }
    setUploading(false)
  }

  const handleDeleteMaterial = async (id: string, fileUrl: string) => {
    if (!window.confirm('Hapus materi ini?')) return
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop()
      if (fileName) await supabase.storage.from('materials').remove([fileName])
    }
    await supabase.from('materials').delete().eq('id', id)
    fetchCourseAndMaterials()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mata Kuliah</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">{courseName || 'Memuat...'}</h1>
            </div>
          </div>
          <button onClick={() => { closeForm(); setIsFormOpen(!isFormOpen) }} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Tambah Materi / Tugas
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">{editingId ? 'Edit Materi' : 'Tambah Materi Baru'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Judul *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Pertemuan 1 / Tugas 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipe</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                    <option value="Teori">Teori</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Ujian">Ujian</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis catatan..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deadline (Khusus Tugas)</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status (Khusus Tugas)</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                    <option value="Belum Selesai">Belum Selesai</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* FORM TAMBAHAN: Individu / Kelompok */}
              {(type === 'Tugas' || type === 'Ujian') && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Pengerjaan</label>
                    <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                      <option value="Individu">Individu (Sendiri)</option>
                      <option value="Kelompok">Kelompok</option>
                    </select>
                  </div>
                  
                  {taskType === 'Kelompok' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Kelompok</label>
                        <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Misal: Kelompok 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Anggota Kelompok</label>
                        <input type="text" value={groupMembers} onChange={e => setGroupMembers(e.target.value)} placeholder="Misal: Budi, Andi, Siti" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Upload File PDF/Gambar (Opsional)</label>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1E3A5F] hover:file:bg-blue-100" />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                  <Save size={16}/> {uploading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Memuat materi...</p>
        ) : materials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada materi</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah Materi" untuk memulai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map(mat => (
              <div key={mat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${mat.type === 'Tugas' ? 'bg-red-50 text-red-600' : mat.type === 'Ujian' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#1E3A5F]'}`}>
                      {mat.type}
                    </span>
                    
                    {/* Badge Individu/Kelompok */}
                    {(mat.type === 'Tugas' || mat.type === 'Ujian') && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${mat.task_type === 'Kelompok' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {mat.task_type || 'Individu'}
                      </span>
                    )}
                    
                    <h3 className="font-bold text-gray-800 text-lg">{mat.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {mat.type === 'Tugas' && mat.deadline && (
                      <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-md flex items-center gap-1">
                        <Clock size={12}/> Deadline: {new Date(mat.deadline).toLocaleDateString('id-ID')}
                      </span>
                    )}
                    <button onClick={() => openEditForm(mat)} className="text-gray-400 hover:text-blue-500 p-1 bg-gray-50 hover:bg-blue-50 rounded-md">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteMaterial(mat.id, mat.file_url)} className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {mat.content && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{mat.content}</p>}
                
                {/* Info Kelompok */}
                {mat.task_type === 'Kelompok' && mat.group_name && (
                  <div className="mt-3 bg-orange-50 border border-orange-100 p-3 rounded-xl">
                    <p className="text-xs font-bold text-orange-800 flex items-center gap-1.5"><Users size={14} /> {mat.group_name}</p>
                    <p className="text-xs text-orange-600 mt-1">Anggota: {mat.group_members || '-'}</p>
                  </div>
                )}

                {mat.file_url && (
                  <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-[#1E3A5F] transition-colors">
                    <Download size={16} /> Download Lampiran
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <CourseDetailContent />
    </Suspense>
  )
}