import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPosts, deletePost } from '../api/posts'
import PostList from '../components/PostList'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 5
  
  const navigate = useNavigate()
  const { user } = useAuth()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadPosts = async (searchTerm: string, pageNum: number) => {
    try {
      setLoading(true)
      setError(null)
      const { data, count } = await fetchPosts(searchTerm, pageNum, pageSize)
      setPosts(data)
      setTotalCount(count)
    } catch (err: any) {
      setError(err.message || 'Failed to load posts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    debounceRef.current = setTimeout(() => {
      loadPosts(search, page)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, page])

  const handleDelete = async (id: string) => {
    if (!user) return
    if (!window.confirm('Are you sure you want to delete this post?')) return
    
    try {
      await deletePost(id, user.id)
      loadPosts(search, page) // refresh list
    } catch (err: any) {
      alert('Failed to delete post: ' + err.message)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search posts by title or content..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0) // Reset to first page on new search
          }}
          className={`
            w-full px-4 py-3 pl-10 rounded-md 
            bg-light-card dark:bg-dark-card 
            border border-light-border dark:border-dark-border 
            text-light-text dark:text-dark-text 
            placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary
            focus:outline-none focus:ring-2 focus:ring-accent-blue dark:focus:ring-accent-green
            transition-all duration-200
          `}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue dark:border-accent-green"></div>
          <p className="mt-3 text-light-text-secondary dark:text-dark-text-secondary">
            Loading posts...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-light-text-secondary dark:text-dark-text-secondary">
          <p className="text-xl">No posts found</p>
          {search && <p className="mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          <PostList
            posts={posts}
            currentUser={user}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home