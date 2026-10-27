'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, GraduationCap, CheckCircle2, Clock, BookOpen, Target, Pencil, Save, X } from 'lucide-react'
import Link from 'next/link'

type Thesis = {
  id: string
  title: string
  stage: string
  progress: number
  advisor_notes: string
  deadline: string
}

const STAGES = ['Pengajuan Judul', 'Proposal', 'BAB 1-3', 'Seminar Proposal', 'Penelitian', 'BAB 4-5', 'Sidang Akhir', 'Revisi']

function ThesisContent() {
  const router = useRouter()
  const [thesis, setThesis] = useState<Thesis | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // State Form
  const [title, setTitle] = useState('')
  const [stage, setStage] = useState('Pengajuan Judul')
  const [progress, setProgress] = useState(0)
  const [advisorNotes, setAdvisorNotes] = useState('')
  const [deadline, setDeadline] = useState('')

  const fetchThesis = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase.from('thesis').select('*').eq('user_id', user.id).single()
    
    if (data) {
      setThesis(data)
      setTitle(data.title)
      setStage(data.stage)
      setProgress(data.progress)
      setAdvisorNotes(data.advisor_notes || '')
      setDeadline(data.deadline || '')
    }
    setLoading(false)
  }

  useEffect(() => { fetchThesis() }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      title,
      stage,
      progress,
      advisor_notes: advisorNotes,
      deadline: deadline || null
    }

    let error;
    if (thesis) {
      const { error: err } = await supabase.from('thesis').update(payload).eq('id', thesis.id)
      error = err
    } else {
      const { error: err } = await supabase.from('thesis').insert(payload)
      error = err
    }

    if (!error) {
      setIsEditing(false)
      fetchThesis()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] text-[#1E3A5F] font-bold">Memuat Ruang Skripsi...</div>

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ruang Khusus</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">Skripsi Saya</h1>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            {isEditing ? <X size={16}/> : <Pencil size={16} />} {isEditing ? 'Batal' : 'Edit Data'}
          </button>
        </div>

        {/* Form Edit */}
        {isEditing && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Form Data Skripsi</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul Skripsi *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Sistem Informasi..." className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tahap Saat Ini</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800">
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input type="number" min="0" max="100" value={progress} onChange={e => setProgress(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Deadline</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Bimbingan (Opsional)</label>
                <textarea value={advisorNotes} onChange={e => setAdvisorNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800"></textarea>
              </div>
              <button type="submit" className="bg-[#1E3A5F] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Save size={16}/> Simpan</button>
            </form>
          </div>
        )}

        {!thesis && !isEditing ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada data skripsi</h3>
            <p className="text-gray-500 text-sm mb-4">Klik "Edit Data" untuk mulai mengisi.</p>
          </div>
        ) : thesis && (
          <div className="space-y-6">
            {/* Kartu Judul & Progress */}
            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8A] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
              <h2 className="text-xl font-bold mb-2">{thesis.title}</h2>
              <p className="text-blue-200 text-sm mb-6">Tahap: {thesis.stage}</p>
              
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold">Progress Skripsi</p>
                <p className="text-2xl font-extrabold">{thesis.progress}%</p>
              </div>
              <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-4 rounded-full transition-all duration-500" style={{ width: `${thesis.progress}%` }}></div>
              </div>
            </div>

            {/* Timeline Visual */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1E3A5F] mb-6 flex items-center gap-2"><Target size={20}/> Timeline Skripsi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STAGES.map((s, idx) => {
                  const isDone = STAGES.indexOf(thesis.stage) >= idx;
                  return (
                    <div key={s} className={`p-3 rounded-xl border-2 flex flex-col items-center text-center gap-2 ${isDone ? 'border-[#4A90D9] bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-[#4A90D9] text-white' : 'bg-gray-300 text-gray-500'}`}>
                        {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                      </div>
                      <span className={`text-xs font-bold ${isDone ? 'text-[#1E3A5F]' : 'text-gray-500'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Tambahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Clock size={18} className="text-orange-500"/> Deadline</h3>
                <p className="text-2xl font-bold text-gray-700">{thesis.deadline ? new Date(thesis.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diatur'}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-teal-500"/> Catatan Bimbingan</h3>
                <p className="text-sm text-gray-600 italic">"{thesis.advisor_notes || 'Belum ada catatan.'}"</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ThesisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <ThesisContent />
    </Suspense>
  )
}