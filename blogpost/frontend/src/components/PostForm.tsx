import React, { useState } from 'react'

interface Props {
  initialData?: { title: string; content: string }
  onSubmit: (data: { title: string; content: string }) => void
  disabled?: boolean
}

const PostForm: React.FC<Props> = ({ initialData = { title: '', content: '' }, onSubmit, disabled = false }) => {
  const [title, setTitle] = useState(initialData.title)
  const [content, setContent] = useState(initialData.content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }
    onSubmit({ title, content })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          required
          style={{ width: '100%', padding: '10px', fontSize: '1.1rem' }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <textarea
          placeholder="Write your post here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled}
          required
          rows={12}
          style={{ width: '100%', padding: '10px', fontSize: '1rem', resize: 'vertical' }}
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          background: disabled ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {disabled ? 'Saving...' : initialData.title ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  )
}

export default PostForm