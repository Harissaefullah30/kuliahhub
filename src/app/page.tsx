'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn, GraduationCap, BookOpen, Clock, ShieldCheck, User, IdCard, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [nim, setNim] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(`Gagal masuk: ${error.message}`)
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, nim: nim }
        }
      })
      if (error) {
        setMessage(`Gagal daftar: ${error.message}`)
      } else {
        setMessage('Pendaftaran berhasil! Silakan masuk.')
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1E3A5F] to-[#2E5A8A] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white text-[#1E3A5F] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
            <GraduationCap size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">KuliahHub</h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto mb-8">
            Pusat manajemen tugas dan materi kuliah pribadi. Rapi, terstruktur, dan siap pakai.
          </p>
          
          <div className="flex gap-4 justify-center text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <BookOpen size={16} /> Materi Kuliah
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Clock size={16} /> Deadline Tugas
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 relative">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-10">
          
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? 'Selamat Datang' : 'Buat Akun Baru'}</h2>
            <p className="text-gray-500 text-sm">{isLogin ? 'Masuk untuk mengelola jadwal kuliahmu.' : 'Daftar untuk mulai mengelola tugasmu.'}</p>
          </div>

          {message && (
            <div className={`p-3 mb-4 rounded-xl text-sm text-center font-medium border ${message.includes('berhasil') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Haris Rizki Saefullah" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NIM</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IdCard size={18} className="text-gray-400" /></div>
                    <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="240511047" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-gray-400" /></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="haris@email.com" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              <LogIn size={20} /> {loading ? 'Memproses...' : (isLogin ? 'Masuk ke KuliahHub' : 'Daftar Sekarang')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? (
              <p>Belum punya akun? <button onClick={() => { setIsLogin(false); setMessage('') }} className="text-[#1E3A5F] font-bold hover:underline">Daftar</button></p>
            ) : (
              <p>Sudah punya akun? <button onClick={() => { setIsLogin(true); setMessage('') }} className="text-[#1E3A5F] font-bold hover:underline">Masuk</button></p>
            )}
          </div>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck size={14}/> Sistem Informasi Akademik Pribadi
            </p>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Dibuat oleh <span className="text-[#1E3A5F]">Haris Saefullah</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}