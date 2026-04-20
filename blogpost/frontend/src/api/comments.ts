import { supabase } from '../lib/supabase'

export const fetchComments = async (postId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export const createComment = async (data: { content: string; post_id: string; author_id: string }): Promise<any> => {
  const { data: result, error } = await supabase
    .from('comments')
    .insert([data])
    .select('*, profiles(username)')
    .single()

  if (error) throw error
  return result
}

export const deleteComment = async (id: string, authorId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('author_id', authorId)

  if (error) throw error
}
