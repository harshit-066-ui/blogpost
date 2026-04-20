import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchPostById, deletePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/CommentSection'

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadPost = async () => {
      try {
        const data = await fetchPostById(id)
        setPost(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  const handleDelete = async () => {
    if (!id || !user || !window.confirm("Are you sure you want to delete this post?")) return
    try {
      await deletePost(id, user.id)
      navigate('/')
    } catch (err: any) {
      alert("Failed to delete: " + err.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!post) return <p>Post not found</p>

  const isOwner = user?.id === post.author_id

  return (
    <div className="bg-light-card dark:bg-dark-card p-6 rounded border border-light-border dark:border-dark-border">
      <h2 className="text-3xl font-bold mb-2 text-light-text dark:text-dark-text">{post.title}</h2>
      <div className="text-sm text-gray-500 mb-6">
        By {post.profiles?.username || 'anonymous'} • {new Date(post.created_at).toLocaleString()}
      </div>
      
      <p className="whitespace-pre-wrap leading-relaxed text-light-text dark:text-gray-300 mb-8">
        {post.content}
      </p>

      <div className="flex gap-4 border-t border-light-border dark:border-dark-border pt-4">
        <Link to="/" className="text-accent-blue hover:underline">← Back to Home</Link>
        {isOwner && (
          <div className="ml-auto flex gap-4">
            <Link
              to={`/edit/${post.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <CommentSection postId={post.id} />
    </div>
  )
}

export default PostDetail