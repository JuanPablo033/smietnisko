'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

const supabase = createClient()

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // Do wyświetlania błędów/sukcesów

  async function onLogin(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        setMessage({ type: 'error', text: 'Błędny email lub hasło' })
        setLoading(false)
    } else {
        // Przekierowanie
        window.location.href = '/map'
    }
  }

  async function onSignup(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    
    if (error) {
        setMessage({ type: 'error', text: error.message })
    } else {
        setMessage({ type: 'success', text: 'Sprawdź email, aby potwierdzić konto!' })
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
      
      {/* Nagłówek */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">♻️</div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Witaj w MojeŚmietnisko</h2>
        <p className="text-gray-500 text-sm mt-1">Zaloguj się, aby dbać o planetę</p>
      </div>

      {/* Komunikaty błędów/sukcesu */}
      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium text-center ${
            message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
            {message.text}
        </div>
      )}

      <form className="flex flex-col gap-5">
        
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Adres Email
          </label>
          <input 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="imie@przyklad.com" 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Hasło */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Hasło
          </label>
          <input 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            placeholder="••••••••" 
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Przyciski */}
        <div className="mt-2 flex flex-col gap-3">
          <button 
            onClick={onLogin} 
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all shadow-lg hover:shadow-xl transform active:scale-95 disabled:bg-gray-400"
          >
            {loading ? 'Przetwarzanie...' : 'Zaloguj się'}
          </button>
          
          <button 
            onClick={onSignup} 
            disabled={loading}
            className="w-full bg-white text-gray-700 font-bold py-3.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            Załóż konto
          </button>
        </div>
      </form>

      {/* Link powrotu */}
      <div className="text-center mt-6">
        <Link href="/map" className="text-sm text-gray-400 hover:text-green-600 transition font-medium">
            ← Wróć do mapy (bez logowania)
        </Link>
      </div>
    </div>
  )
}