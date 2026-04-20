import PostCard from './PostCard'
import type { User } from '@supabase/supabase-js'

interface Props {
  posts: any[]
  currentUser: User | null
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

const PostList: React.FC<Props> = ({ posts, currentUser, onDelete, onEdit }) => {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={currentUser}
          onDelete={onDelete} 
          onEdit={onEdit} 
        />
      ))}
    </div>
  )
}

export default PostList