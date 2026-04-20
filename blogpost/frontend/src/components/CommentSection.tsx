import React, { useState, useEffect } from 'react'
import { fetchComments, createComment, deleteComment } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Props {
  postId: string
}

const CommentSection: React.FC<Props> = ({ postId }) => {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await fetchComments(postId)
      setComments(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()

    // Real-time subscription for comments
    const channel = supabase
      .channel(`public:comments:post_id=eq.${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Whenever there's an insert/update/delete, we simply reload 
          // or we can manually sync state. Reload is safest for username joins.
          loadComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  const handleAddComment = async (content: string) => {
    if (!user) return
    setSubmitting(true)
    try {
      const newComment = await createComment({
        content,
        post_id: postId,
        author_id: user.id
      })
      // Optimistic update or refresh:
      setComments(prev => [...prev, newComment])
    } catch (err: any) {
      alert('Failed to post comment: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string, authorId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    try {
      await deleteComment(commentId, authorId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err: any) {
      alert('Failed to delete comment: ' + err.message)
    }
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-4 border-b border-light-border dark:border-dark-border pb-2">
        Comments ({comments.length})
      </h3>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {loading ? (
        <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading comments...</p>
      ) : (
        <div className="mb-8">
          {comments.length === 0 ? (
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm italic py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      )}

      {user ? (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-md border border-light-border dark:border-dark-border shadow-sm">
          <h4 className="font-medium mb-2">Leave a comment as {user.email}</h4>
          <CommentForm onSubmit={handleAddComment} disabled={submitting} />
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-md text-center">
          <p className="mb-2">You must be logged in to post a comment.</p>
          <Link to="/login" className="text-accent-blue dark:text-accent-green hover:underline font-medium">
            Log in here
          </Link>
        </div>
      )}
    </div>
  )
}

export default CommentSection
