'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
const TYPES = ['smietnik', 'odpady']

export default function AddMarkerForm({ pos, onDone }) {
  const [nazwa, setNazwa] = useState('')
  const [typ, setTyp] = useState(TYPES[0])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function uploadFile(file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `private/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) throw error
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
    return urlData.publicUrl
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!nazwa.trim()) return alert("Proszę wpisać nazwę zgłoszenia!")
    if (!file) return alert("Proszę dodać zdjęcie!")

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Błąd: Nie jesteś zalogowany.")
        return
      }

      const imageUrl = await uploadFile(file)

      const { error } = await supabase.from('smietniki').insert({
        nazwa: nazwa,
        typ: typ,
        zdjecie: imageUrl,
        latitude: pos.lat,
        longitude: pos.lng,
        userId: user.id
      })
      
      if (error) throw error
      onDone()
      
    } catch (err) {
      console.error(err)
      alert(err.message || "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      
      {/* Sekcja Nazwa */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Co zgłaszasz?
        </label>
        <input 
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
          value={nazwa} 
          onChange={e=>setNazwa(e.target.value)} 
          placeholder="np. Dzikie wysypisko w lesie"
        />
      </div>

      {/* Sekcja Typ */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Rodzaj odpadów
        </label>
        <div className="relative">
            <select 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none"
            value={typ} 
            onChange={e=>setTyp(e.target.value)}
            >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Strzałka customowa */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>

      {/* Sekcja Zdjęcie */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Dowód (Zdjęcie)
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-400 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                    <p className="text-sm text-green-600 font-medium">{file.name}</p>
                ) : (
                    <>
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="text-sm text-gray-500"><span className="font-semibold">Kliknij</span> aby dodać zdjęcie</p>
                    </>
                )}
            </div>
            <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={e=>setFile(e.target.files[0])} 
                required
            />
        </label>
      </div>

      {/* Przycisk Submit */}
      <button 
        type="submit" 
        disabled={loading}
        className="mt-2 w-full bg-black text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform active:scale-95"
      >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Przetwarzanie...
            </span>
        ) : 'Zgłoś problem'}
      </button>

    </form>
  )
}