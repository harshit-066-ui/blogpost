import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'
import { createPost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

const CreatePost = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (!user) {
      setError("You must be logged in to post.")
      return
    }

    setDisabled(true)
    setError(null)
    setSuccess(false)

    try {
      await createPost({
        ...data,
        author_id: user.id
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create post.')
    } finally {
      setDisabled(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
        Create New Post
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 rounded-md text-green-700 dark:text-green-300">
          Post created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <PostForm 
        onSubmit={handleSubmit} 
        disabled={disabled} 
      />
    </div>
  )
}

export default CreatePost