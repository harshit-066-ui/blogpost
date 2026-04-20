import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Using Supabase Auth
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Directs them to login after successful signup (depending on email confirm settings)
      alert("Sign up successful! You are now logged in.")
      navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-dark-bg focus:ring focus:ring-accent-blue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-dark-bg focus:ring focus:ring-accent-blue"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-accent-blue dark:bg-accent-green text-white rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account? <Link to="/login" className="text-accent-blue dark:text-accent-green hover:underline">Login</Link>
      </div>
    </div>
  )
}

export default Signup
