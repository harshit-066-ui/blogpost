import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import PostDetail from './pages/PostDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { AuthProvider, useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

const NavBar = () => {
  const { user, signOut } = useAuth()
  
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Simple Blog</h1>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 mt-0 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
        >
          {document.documentElement.classList.contains('dark') ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      <nav className="flex justify-between items-center text-lg font-medium">
        <div className="flex gap-6">
          <Link to="/" className="text-accent-blue dark:text-accent-green hover:underline">
            Home
          </Link>
          {user && (
            <Link to="/create" className="text-accent-blue dark:text-accent-green hover:underline">
              Create Post
            </Link>
          )}
        </div>
        <div className="flex gap-4 text-sm items-center">
          {user ? (
            <>
              <span className="text-gray-500">{user.email}</span>
              <button 
                onClick={signOut} 
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-accent-blue dark:text-accent-green hover:underline">Login</Link>
              <Link to="/signup" className="px-3 py-1 bg-accent-blue text-white rounded hover:opacity-90">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function App() {
  // On load, respect saved preference or system preference
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/edit/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App