import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'
import { fetchPostById, updatePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

const EditPost = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<{ title: string; content: string; author_id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const loadPost = async () => {
      try {
        const data = await fetchPostById(id)
        if (data.author_id !== user?.id) {
          setError("You don't have permission to edit this post.")
        } else {
          setPost({ title: data.title, content: data.content, author_id: data.author_id })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id, user])

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (!id || !user || post?.author_id !== user.id) return
    setDisabled(true)
    setError(null)
    try {
      await updatePost(id, user.id, data)
      navigate(`/post/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update post')
    } finally {
      setDisabled(false)
    }
  }

  if (loading) return <p>Loading post...</p>
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>
  if (!post) return <p>Post not found</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post</h2>
      <PostForm initialData={post} onSubmit={handleSubmit} disabled={disabled} />
    </div>
  )
}

export default EditPost