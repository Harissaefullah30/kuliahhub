'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Search, Plus, Link as LinkIcon, ExternalLink, Trash2, X, BookOpen, FileText, Video, FolderOpen, Pencil } from 'lucide-react'
import Link from 'next/link'

type Reference = {
  id: string
  title: string
  url: string
  category: string
  notes: string
  created_at: string
}

function ReferenceContent() {
  const router = useRouter()
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('Semua')
  
  // State untuk Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) 
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Jurnal')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchReferences = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data, error } = await supabase
      .from('references')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) setReferences(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReferences()
  }, [router])

  const openAddModal = () => {
    setEditingId(null)
    setTitle(''); setUrl(''); setCategory('Jurnal'); setNotes('')
    setIsModalOpen(true)
  }

  const openEditModal = (ref: Reference) => {
    setEditingId(ref.id) // <-- Ini kunci untuk mode edit
    setTitle(ref.title)
    setUrl(ref.url)
    setCategory(ref.category)
    setNotes(ref.notes || '')
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let formattedUrl = url
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl
    }

    if (editingId) {
      // Mode Edit: Lakukan UPDATE berdasarkan editingId
      const { error } = await supabase
        .from('references')
        .update({ title, url: formattedUrl, category, notes })
        .eq('id', editingId) // <-- Memastikan yang diupdate adalah ID yang benar

      if (!error) {
        setIsModalOpen(false)
        setEditingId(null) // Reset setelah simpan
        fetchReferences()
      } else {
        alert('Gagal mengubah: ' + error.message)
      }
    } else {
      // Mode Tambah: Lakukan INSERT
      const { error } = await supabase.from('references').insert({
        user_id: user.id,
        title,
        url: formattedUrl,
        category,
        notes
      })

      if (!error) {
        setIsModalOpen(false)
        fetchReferences()
      } else {
        alert('Gagal menyimpan: ' + error.message)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus referensi ini?')) return
    await supabase.from('references').delete().eq('id', id)
    fetchReferences()
  }

  const filteredRefs = references.filter(ref => {
    const matchFilter = filterCat === 'Semua' || ref.category === filterCat
    const matchSearch = ref.title.toLowerCase().includes(search.toLowerCase()) || 
                        (ref.notes && ref.notes.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'Jurnal': return { icon: <BookOpen size={20} />, color: 'bg-blue-50 text-blue-600 border-blue-100' }
      case 'Drive': return { icon: <FolderOpen size={20} />, color: 'bg-green-50 text-green-600 border-green-100' }
      case 'Video': return { icon: <Video size={20} />, color: 'bg-red-50 text-red-600 border-red-100' }
      default: return { icon: <FileText size={20} />, color: 'bg-gray-50 text-gray-600 border-gray-100' }
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] flex items-center gap-2">
                <LinkIcon className="text-[#4A90D9]" /> Pusat Referensi
              </h1>
              <p className="text-sm text-gray-500">Kumpulan jurnal, drive, dan tautan pentingmu.</p>
            </div>
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">
            <Plus size={18} /> Tambah Referensi
          </button>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul atau catatan referensi..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['Semua', 'Jurnal', 'Drive', 'Video', 'Lainnya'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  filterCat === cat ? 'bg-[#1E3A5F] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List Referensi */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A5F] mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Memuat referensi...</p>
          </div>
        ) : filteredRefs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <LinkIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada referensi</h3>
            <p className="text-gray-500 text-sm mt-1">Klik tombol "Tambah Referensi" untuk menyimpan link pertamamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRefs.map(ref => {
              const style = getCategoryStyle(ref.category)
              return (
                <div key={ref.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md hover:border-[#4A90D9] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${style.color}`}>
                        {style.icon} {ref.category}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(ref)} className="text-gray-300 hover:text-blue-500 transition-colors p-1" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(ref.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight mb-2 line-clamp-2">{ref.title}</h3>
                    {ref.notes && <p className="text-xs text-gray-500 line-clamp-2 mb-4">{ref.notes}</p>}
                  </div>
                  
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-between w-full bg-gray-50 hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] px-4 py-2.5 rounded-xl text-sm font-bold transition-all group-hover:bg-[#1E3A5F] group-hover:text-white">
                    Buka Link <ExternalLink size={16} />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Form (Tambah / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">
                {editingId ? 'Edit Referensi' : 'Tambah Referensi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Hidden input untuk memastikan ID ikut terkirim saat submit */}
              <input type="hidden" value={editingId || ''} />
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Referensi *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Misal: Jurnal Sistem Informasi" 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL / Link *</label>
                <input 
                  type="text" 
                  required 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="https://drive.google.com/..." 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:ring-2 focus:ring-[#4A90D9] outline-none"
                >
                  <option value="Jurnal">Jurnal / Artikel</option>
                  <option value="Drive">Google Drive / File</option>
                  <option value="Video">Video (YouTube/Zoom)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Catatan singkat..." 
                  rows={2} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white font-bold rounded-lg disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReferencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <ReferenceContent />
    </Suspense>
  )
}