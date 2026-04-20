import { supabase } from '../lib/supabase'

export const fetchPosts = async (search?: string, page = 0, pageSize = 10): Promise<{ data: any[], count: number }> => {
  let query = supabase.from('posts').select('*, profiles(username)', { count: 'exact' })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const from = page * pageSize
  const to = from + pageSize - 1

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export const fetchPostById = async (id: string): Promise<any> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createPost = async (data: { title: string; content: string; author_id: string }): Promise<any> => {
  const { data: result, error } = await supabase
    .from('posts')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return result
}

export const updatePost = async (id: string, authorId: string, data: { title: string; content: string }): Promise<any> => {
  const { data: result, error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', id)
    .eq('author_id', authorId)
    .select()
    .single()

  if (error) throw error
  return result
}

export const deletePost = async (id: string, authorId: string): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', authorId)

  if (error) throw error
}