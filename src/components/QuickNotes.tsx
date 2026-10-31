'use client'

import { useRef, useState, useEffect } from 'react'
import { Pencil, Eraser, Trash2, RotateCcw, Type, Palette } from 'lucide-react'

export default function QuickNotes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil')
  const [color, setColor] = useState('#1E3A5F')
  const [mode, setMode] = useState<'canvas' | 'text'>('canvas')
  
  // State untuk catatan teks
  const [textNote, setTextNote] = useState('')

  // Mengatur konteks kanvas saat pertama kali dimuat
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set background putih
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
  }, [])

  // Fungsi untuk mendapatkan posisi mouse/sentuhan
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Mencegah scroll saat menggambar di HP
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // Atur gaya alat
    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff' // Warna sama dengan background untuk efek menghapus
      ctx.lineWidth = 20
    } else {
      ctx.strokeStyle = color
      ctx.lineWidth = 3
    }
    
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const colors = ['#1E3A5F', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#000000']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
      {/* Header Card */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-[#1E3A5F] text-lg flex items-center gap-2">
            <Pencil size={20} className="text-[#4A90D9]" /> Catatan Cepat
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Tulis ide atau coret-coret di sini.</p>
        </div>
        
        {/* Toggle Mode (Teks vs Papan Tulis) */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setMode('text')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'text' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Type size={14} /> Ketik
          </button>
          <button 
            onClick={() => setMode('canvas')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'canvas' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Palette size={14} /> Coret
          </button>
        </div>
      </div>

      {/* MODE TEKS */}
      {mode === 'text' && (
        <textarea
          value={textNote}
          onChange={(e) => setTextNote(e.target.value)}
          placeholder="Tulis catatan pentingmu di sini..."
          className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#4A90D9] outline-none resize-none transition-all"
        />
      )}

      {/* MODE PAPAN TULIS (CANVAS) */}
      {mode === 'canvas' && (
        <div className="flex flex-col gap-3">
          {/* Toolbar Papan Tulis */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setTool('pencil')} 
                className={`p-2 rounded-lg transition-colors ${tool === 'pencil' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                title="Pensil"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => setTool('eraser')} 
                className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                title="Penghapus"
              >
                <Eraser size={16} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Palet Warna */}
              {colors.map(c => (
                <button 
                  key={c}
                  onClick={() => { setColor(c); setTool('pencil'); }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool === 'pencil' ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  title="Ganti Warna"
                />
              ))}
            </div>

            <button 
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
            >
              <RotateCcw size={14} /> Bersihkan
            </button>
          </div>

          {/* Kanvas Menggambar */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={800}
              height={250}
              className="w-full h-auto touch-none bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      )}
    </div>
  )
}