import { supabase } from './supabase'
import type { CloudProject } from '../types/editor.types'

// Text-only file extensions to include when uploading a project
const TEXT_EXTENSIONS = new Set([
  'java', 'kt', 'scala',
  'ts', 'tsx', 'js', 'jsx',
  'json', 'xml', 'yaml', 'yml',
  'md', 'txt', 'html', 'css',
  'gradle', 'properties', 'env',
  'sql', 'sh', 'bat',
])

export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return TEXT_EXTENSIONS.has(ext)
}

function toCloudProject(row: Record<string, unknown>): CloudProject {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    files: (row.files ?? {}) as Record<string, string>,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function fetchCloudProjects(userId: string): Promise<CloudProject[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('cloud_projects')
    .select('id, name, description, files, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCloudProject)
}

export async function saveCloudProject(
  userId: string,
  name: string,
  files: Record<string, string>,
  description?: string
): Promise<CloudProject> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('cloud_projects')
    .insert({ user_id: userId, name, description, files })
    .select('id, name, description, files, created_at, updated_at')
    .single()
  if (error) throw error
  return toCloudProject(data)
}

export async function updateCloudProject(
  id: string,
  files: Record<string, string>
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('cloud_projects')
    .update({ files, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCloudProject(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('cloud_projects').delete().eq('id', id)
  if (error) throw error
}
