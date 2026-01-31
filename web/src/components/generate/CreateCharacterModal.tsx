import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2, Check, AlertCircle, User } from 'lucide-react'
import { api, type TokenData } from '../../api'
import { useToast } from '../Toast'

interface CreateCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tokens: TokenData[]
}

type Step = 'upload' | 'processing' | 'finalize'

export function CreateCharacterModal({
  isOpen,
  onClose,
  onSuccess,
  tokens,
}: CreateCharacterModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [timestamps, setTimestamps] = useState('0-5')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [instructionSet, setInstructionSet] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const [isLoading, setIsLoading] = useState(false)
  const [characterId, setCharacterId] = useState<number | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Filter active tokens
  const activeTokens = tokens.filter(t => t.is_active && !t.is_expired)

  // Set default token
  useEffect(() => {
    if (activeTokens.length > 0 && !selectedTokenId) {
      setSelectedTokenId(activeTokens[0].id)
    }
  }, [activeTokens, selectedTokenId])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('upload')
      setVideoFile(null)
      setVideoPreview(null)
      setTimestamps('0-5')
      setUsername('')
      setDisplayName('')
      setInstructionSet('')
      setVisibility('private')
      setCharacterId(null)
      setProfileUrl(null)
      setUsernameAvailable(null)
    }
  }, [isOpen])

  // Check username availability with debounce
  useEffect(() => {
    if (!username || !selectedTokenId) {
      setUsernameAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const result = await api.checkUsername(username, selectedTokenId)
        setUsernameAvailable(result.available)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, selectedTokenId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('请选择视频文件')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('视频文件不能超过 50MB')
      return
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!videoFile || !selectedTokenId || !username) {
      toast.error('请填写所有必填项')
      return
    }

    setIsLoading(true)
    setStep('processing')

    try {
      // Convert video to base64
      const reader = new FileReader()
      const videoData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(videoFile)
      })

      // Upload video
      const result = await api.uploadCharacterVideo({
        token_id: selectedTokenId,
        video_data: videoData,
        timestamps,
        username,
      })

      setCharacterId(result.character.id)
      toast.success('视频上传成功，正在处理...')

      // Poll for status
      pollStatus(result.character.id)
    } catch (err: any) {
      toast.error(err.message || '上传失败')
      setStep('upload')
      setIsLoading(false)
    }
  }

  const pollStatus = async (charId: number) => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const result = await api.getCameoStatus(charId)

        if (result.status === 'finalized' || result.character.status === 'finalized') {
          setProfileUrl(result.profile_url || result.character.profile_url)
          setStep('finalize')
          setIsLoading(false)
          return
        }

        if (result.status === 'failed' || result.character.status === 'failed') {
          toast.error('角色处理失败')
          setStep('upload')
          setIsLoading(false)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          toast.error('处理超时，请稍后刷新状态')
          setStep('upload')
          setIsLoading(false)
        }
      } catch (err) {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          toast.error('获取状态失败')
          setStep('upload')
          setIsLoading(false)
        }
      }
    }

    poll()
  }

  const handleFinalize = async () => {
    if (!characterId || !username || !displayName) {
      toast.error('请填写所有必填项')
      return
    }

    setIsLoading(true)

    try {
      await api.finalizeCharacter({
        character_id: characterId,
        username,
        display_name: displayName,
        instruction_set: instructionSet,
        visibility,
      })

      toast.success('角色创建成功')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || '创建失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            创建角色
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 p-4 border-b border-[var(--border)]">
          {(['upload', 'processing', 'finalize'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === s
                  ? 'bg-[var(--accent)] text-white'
                  : i < ['upload', 'processing', 'finalize'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }
              `}>
                {i < ['upload', 'processing', 'finalize'].indexOf(step) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 mx-1 ${
                  i < ['upload', 'processing', 'finalize'].indexOf(step)
                    ? 'bg-green-500'
                    : 'bg-[var(--border)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  选择 Token
                </label>
                <select
                  value={selectedTokenId || ''}
                  onChange={(e) => setSelectedTokenId(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {activeTokens.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.email || token.name || `Token #${token.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  上传角色视频 <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${videoPreview
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    }
                  `}
                >
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full max-h-40 object-contain rounded"
                      controls
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
                      <p className="text-sm text-[var(--text-secondary)]">
                        点击上传视频
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        支持 MP4, MOV 格式，3-10 秒，最大 50MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Timestamps */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  时间范围 (秒)
                </label>
                <input
                  type="text"
                  value={timestamps}
                  onChange={(e) => setTimestamps(e.target.value)}
                  placeholder="0-5"
                  className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  指定视频中角色出现的时间段，如 "0-5" 表示 0 到 5 秒
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="my_character"
                    className="w-full h-9 pl-7 pr-9 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  {username && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingUsername ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                      ) : usernameAvailable === true ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : usernameAvailable === false ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  在提示词中使用 @{username || 'username'} 引用此角色
                </p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[var(--accent)]" />
              <p className="text-lg font-medium text-[var(--text-primary)]">
                正在处理角色视频...
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                这可能需要几分钟，请耐心等待
              </p>
            </div>
          )}

          {step === 'finalize' && (
            <div className="space-y-4">
              {/* Profile Preview */}
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
                  {profileUrl ? (
                    <img
                      src={profileUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    角色头像已生成
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    请完善角色信息
                  </p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  显示名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="我的角色"
                  className="w-full h-9 px-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Instruction Set */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  角色描述
                </label>
                <textarea
                  value={instructionSet}
                  onChange={(e) => setInstructionSet(e.target.value)}
                  placeholder="描述角色的特征、性格、穿着等..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  可见性
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVisibility('private')}
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                      visibility === 'private'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    私有
                  </button>
                  <button
                    onClick={() => setVisibility('public')}
                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                      visibility === 'public'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    公开
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 h-9 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            取消
          </button>
          {step === 'upload' && (
            <button
              onClick={handleUpload}
              disabled={!videoFile || !username || !selectedTokenId || isLoading || usernameAvailable === false}
              className="px-4 h-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              上传并处理
            </button>
          )}
          {step === 'finalize' && (
            <button
              onClick={handleFinalize}
              disabled={!displayName || isLoading}
              className="px-4 h-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              完成创建
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
