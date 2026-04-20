import React, { useState } from 'react'

interface Props {
  onSubmit: (content: string) => Promise<void>
  disabled: boolean
}

const CommentForm: React.FC<Props> = ({ onSubmit, disabled }) => {
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await onSubmit(content)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled}
        required
        placeholder="Add a comment..."
        rows={3}
        className="w-full px-4 py-2 rounded-md bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border focus:ring-2 focus:ring-accent-blue dark:focus:ring-accent-green resize-y mb-3"
      />
      <button
        type="submit"
        disabled={disabled || !content.trim()}
        className="px-4 py-2 bg-accent-blue dark:bg-accent-green text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition"
      >
        {disabled ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}

export default CommentForm
