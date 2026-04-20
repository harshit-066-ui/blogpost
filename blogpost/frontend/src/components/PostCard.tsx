import { Link } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

interface Props {
  post: any
  currentUser: User | null
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const PostCard: React.FC<Props> = ({ post, currentUser, onDelete, onEdit }) => {
  const isOwner = currentUser?.id === post.author_id

  return (
    <div
      className={`
        bg-light-card dark:bg-dark-card 
        border border-light-border dark:border-dark-border 
        rounded-md hover:border-accent-blue dark:hover:border-accent-green 
        transition-all duration-150 shadow-sm hover:shadow
      `}
    >
      <div className="p-4">
        <h3 className="text-xl font-medium mb-1 line-clamp-2">
          <Link
            to={`/post/${post.id}`}
            className="text-accent-blue dark:text-accent-green hover:underline"
          >
            {post.title}
          </Link>
        </h3>

        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-3 line-clamp-3">
          {post.content}
        </p>

        <div className="flex items-center gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary mb-3">
          <span>Posted by {post.profiles?.username || 'anonymous'}</span>
          <span>•</span>
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString()}
          </time>
        </div>

        {isOwner && (
          <div className="flex gap-4">
            <button
              onClick={() => onEdit(post.id)}
              className="text-sm text-accent-blue dark:text-accent-green hover:underline"
            >
              edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostCard