import { useAuthStore } from '../store'

const BASE_URL = ''

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || data.message || data.detail || 'Request failed')
  }

  return data
}

export interface TokenData {
  id: number
  token: string
  email: string
  name: string
  session_token?: string
  refresh_token?: string
  client_id?: string
  proxy_url?: string
  remark?: string
  is_active: boolean
  is_expired: boolean
  image_enabled: boolean
  video_enabled: boolean
  image_concurrency: number
  video_concurrency: number
  plan_type?: string
  plan_title?: string
  subscription_end?: string
  expiry_time?: string
  total_image_count: number
  total_video_count: number
  total_error_count: number
  today_image_count: number
  today_video_count: number
  today_error_count: number
  consecutive_errors: number
  sora2_supported?: boolean
  sora2_used_count?: number
  sora2_total_count?: number
  sora2_remaining_count?: number
}

export interface LogEntry {
  id: number
  operation: string
  token_email?: string
  status_code: number
  task_id?: string
  task_status?: string
  progress?: number
  duration: number
  request_body?: string
  response_body?: string
  created_at: string
}

export interface CharacterData {
  id: number
  cameo_id: string
  character_id: string
  username: string
  display_name: string
  profile_url: string
  instruction_set: string
  safety_instruction_set: string
  visibility: 'private' | 'public'
  status: 'processing' | 'finalized' | 'failed'
  token_id: number
  error_message?: string
  created_at: string
  updated_at?: string
}

export interface SearchCharacterResult {
  character_id: string
  username: string
  display_name: string
  profile_url: string
  is_owner: boolean
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Stats
  getStats: () =>
    request<{
      total_tokens: number
      active_tokens: number
      total_images: number
      total_videos: number
      total_errors: number
      today_images: number
      today_videos: number
      today_errors: number
    }>('/api/stats'),

  // Tokens
  getTokens: () =>
    request<{ tokens: TokenData[] }>('/api/tokens'),

  addToken: (data: {
    token: string
    email?: string
    session_token?: string
    refresh_token?: string
    client_id?: string
    proxy_url?: string
    remark?: string
    image_enabled?: boolean
    video_enabled?: boolean
    image_concurrency?: number
    video_concurrency?: number
  }) =>
    request<{ success: boolean; token?: TokenData; message?: string }>('/api/tokens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateToken: (id: number, data: Partial<{
    token: string
    session_token: string
    refresh_token: string
    client_id: string
    proxy_url: string
    remark: string
    is_active: boolean
    image_enabled: boolean
    video_enabled: boolean
    image_concurrency: number
    video_concurrency: number
  }>) =>
    request<{ success: boolean; token?: TokenData }>(`/api/tokens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteToken: (id: number) =>
    request<{ success: boolean; message: string }>(`/api/tokens/${id}`, {
      method: 'DELETE',
    }),

  testToken: (id: number) =>
    request<{
      success: boolean
      status: string
      email?: string
      message?: string
      sora2_supported?: boolean
      sora2_total_count?: number
      sora2_redeemed_count?: number
      sora2_remaining_count?: number
    }>(`/api/tokens/${id}/test`, {
      method: 'POST',
    }),

  // Token batch operations
  batchTestUpdate: (tokenIds: number[]) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/test-update', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds }),
    }),

  batchEnableAll: (tokenIds: number[]) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/enable-all', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds }),
    }),

  batchDisableSelected: (tokenIds: number[]) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/disable-selected', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds }),
    }),

  batchDeleteDisabled: (tokenIds: number[]) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/delete-disabled', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds }),
    }),

  batchDeleteSelected: (tokenIds: number[]) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/delete-selected', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds }),
    }),

  batchUpdateProxy: (tokenIds: number[], proxyUrl: string) =>
    request<{ success: boolean; message: string }>('/api/tokens/batch/update-proxy', {
      method: 'POST',
      body: JSON.stringify({ token_ids: tokenIds, proxy_url: proxyUrl }),
    }),

  // Token import/export
  importTokens: (tokens: any[], mode: string) =>
    request<{
      success: boolean
      results: Array<{ email: string; success: boolean; status: string; error?: string }>
      added: number
      updated: number
      failed: number
      message?: string
    }>('/api/tokens/import', {
      method: 'POST',
      body: JSON.stringify({ tokens, mode }),
    }),

  importTokensText: (content: string, mode: string) =>
    request<{
      success: boolean
      results: Array<{ email: string; success: boolean; status: string; error?: string }>
      added: number
      updated: number
      failed: number
      message?: string
    }>('/api/tokens/import', {
      method: 'POST',
      body: JSON.stringify({ content, mode }),
    }),

  // Token conversion
  convertST2AT: (st: string) =>
    request<{ success: boolean; access_token?: string; message?: string }>('/api/tokens/st2at', {
      method: 'POST',
      body: JSON.stringify({ st }),
    }),

  convertRT2AT: (rt: string, clientId?: string) =>
    request<{ success: boolean; access_token?: string; refresh_token?: string; message?: string }>('/api/tokens/rt2at', {
      method: 'POST',
      body: JSON.stringify({ rt, client_id: clientId }),
    }),

  // Config
  getConfig: () =>
    request<{
      api_key: string
      admin_username: string
      proxy_enabled: boolean
      proxy_url: string
      cache_enabled: boolean
      cache_timeout: number
      cache_base_url: string
      image_timeout: number
      video_timeout: number
      error_ban_threshold: number
      task_retry_enabled: boolean
      task_max_retries: number
      auto_disable_401: boolean
      watermark_free_enabled: boolean
      watermark_parse_method: string
      watermark_parse_url: string
      watermark_parse_token: string
      watermark_fallback: boolean
      call_mode: string
    }>('/api/config'),

  updateConfig: (data: Record<string, any>) =>
    request<{ message: string }>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Password
  updatePassword: (oldPassword: string, newPassword: string, username?: string) =>
    request<{ success: boolean; message?: string }>('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, username }),
    }),

  // API Key
  updateAPIKey: (newApiKey: string) =>
    request<{ success: boolean; message?: string }>('/api/admin/apikey', {
      method: 'POST',
      body: JSON.stringify({ new_api_key: newApiKey }),
    }),

  // Proxy
  testProxy: (testUrl: string) =>
    request<{ success: boolean; message: string; test_url?: string }>('/api/proxy/test', {
      method: 'POST',
      body: JSON.stringify({ test_url: testUrl }),
    }),

  // Token refresh config
  getTokenRefreshConfig: () =>
    request<{ success: boolean; config: { at_auto_refresh_enabled: boolean } }>('/api/token-refresh/config'),

  updateTokenRefreshConfig: (enabled: boolean) =>
    request<{ success: boolean; message: string }>('/api/token-refresh/config', {
      method: 'PUT',
      body: JSON.stringify({ at_auto_refresh_enabled: enabled }),
    }),

  // Logs
  getLogs: (limit = 100) =>
    request<LogEntry[]>(`/api/logs?limit=${limit}`),

  clearLogs: () =>
    request<{ success: boolean; message: string }>('/api/logs', {
      method: 'DELETE',
    }),

  cancelTask: (taskId: string) =>
    request<{ success: boolean; message: string }>(`/api/tasks/${taskId}/cancel`, {
      method: 'POST',
    }),

  // ========== Character Management ==========

  // Get all characters
  getCharacters: () =>
    request<{ characters: CharacterData[] }>('/api/characters'),

  // Get single character
  getCharacter: (id: number) =>
    request<{ character: CharacterData }>(`/api/characters/${id}`),

  // Upload character video
  uploadCharacterVideo: (data: {
    token_id: number
    video_data: string // Base64 encoded
    timestamps?: string
    username: string
  }) =>
    request<{ success: boolean; character: CharacterData; cameo_id: string }>('/api/characters/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get cameo processing status
  getCameoStatus: (id: number) =>
    request<{ status: string; profile_url: string; character: CharacterData }>(`/api/characters/${id}/status`),

  // Check username availability
  checkUsername: (username: string, tokenId: number) =>
    request<{ available: boolean; reason?: string }>(`/api/characters/username/check?username=${encodeURIComponent(username)}&token_id=${tokenId}`),

  // Finalize character
  finalizeCharacter: (data: {
    character_id: number
    username: string
    display_name: string
    instruction_set?: string
    safety_instruction_set?: string
    visibility?: string
  }) =>
    request<{ success: boolean; character: CharacterData }>('/api/characters/finalize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete character
  deleteCharacter: (id: number) =>
    request<{ success: boolean; message: string }>(`/api/characters/${id}`, {
      method: 'DELETE',
    }),

  // Search public characters
  searchCharacters: (query: string, tokenId: number) =>
    request<{ characters: SearchCharacterResult[] }>(`/api/characters/search?q=${encodeURIComponent(query)}&token_id=${tokenId}`),

  // Sync characters from Sora API
  syncCharacters: (tokenId: number) =>
    request<{ success: boolean; synced: number; total: number }>('/api/characters/sync', {
      method: 'POST',
      body: JSON.stringify({ token_id: tokenId }),
    }),

  // ========== Generation ==========

  // Generate video
  generateVideo: (data: {
    token_id: number
    prompt: string
    duration?: number
    aspect_ratio?: string
    model?: string
    cameo_ids?: string[]
    reference_image?: string
  }) =>
    request<{ success: boolean; generation_id: string; message?: string }>('/api/generate/video', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Generate image
  generateImage: (data: {
    token_id: number
    prompt: string
    size?: string
    model?: string
  }) =>
    request<{ success: boolean; image_url: string; message?: string }>('/api/generate/image', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get generation status
  getGenerationStatus: (generationId: string, tokenId: number) =>
    request<{
      status: string
      progress?: number
      video_url?: string
      error?: string
    }>(`/api/generate/${generationId}/status?token_id=${tokenId}`),
}
