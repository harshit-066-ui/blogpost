import React from 'react'
import type { User } from '@supabase/supabase-js'

interface Props {
  comment: any
  currentUser: User | null
  onDelete: (id: string, authorId: string) => void
}

const CommentItem: React.FC<Props> = ({ comment, currentUser, onDelete }) => {
  const isOwner = currentUser?.id === comment.author_id

  return (
    <div className="py-4 border-b border-light-border dark:border-dark-border last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-light-text dark:text-dark-text">
          {comment.profiles?.username || 'anonymous'}
          <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary ml-2 font-normal">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id, comment.author_id)}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
            title="Delete comment"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-sm text-light-text dark:text-gray-300 whitespace-pre-wrap">
        {comment.content}
      </p>
    </div>
  )
}

export default CommentItem
