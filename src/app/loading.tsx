export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#1E3A5F] flex flex-col items-center justify-center z-50">
      {/* Menampilkan gambar splash screen dari folder public */}
      <img 
        src="/splash-screen.png" 
        alt="Loading KuliahHub" 
        className="w-64 h-64 md:w-80 md:h-80 object-contain animate-pulse" 
      />
      
      {/* Animasi loading berputar di bawah gambar */}
      <div className="mt-8 w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  )
}