import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import {
  create,
  getOne,
  list,
  remove,
  search,
  update,
  type CreateYoutubeDto,
  type YoutubeCharacter,
  type YoutubeItem,
} from '../services/youtubeService'
import { listLanguages, type Language } from '../services/languageService'
import { listAICharacters, type AICharacter } from '../services/aiCharacterService'
import { list as listAwsVideos, type AwsVideosImageItem } from '../services/awsVideosImageService'
import { listBaseInstructions, type BaseInstruction } from '../services/baseInstructionService'

type FormState = {
  youtubeUrl: string
  awsUrl: string
  title: string
  story: string
  type: string
  languageId: string
  coverImageId: string
  videoId: string
  characterIdleVideoId: string
  characterTalkingVideoId: string
  aiCharacterId: string
  secondAiCharacterId: string
  thirdAiCharacterId: string
  baseInstructionEntityId: string
  active: boolean
  isChatOpen: boolean
  characters: YoutubeCharacter[]
  chatMode: 'single' | 'multi'
}

function emptyToNull(v: string): string | null {
  const t = (v || '').trim()
  return t === '' ? null : t
}

function numberOrNull(v: string): number | null {
  const t = (v || '').trim()
  return t === '' ? null : Number(t)
}

function formatDate(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleString('tr-TR')
}

function toFormState(item?: YoutubeItem): FormState {
  // youtubeCharacters join tablosundan gelen karakterleri sırala
  const yc = Array.isArray(item?.youtubeCharacters) ? item!.youtubeCharacters! : []
  const sortedYc = [...yc].sort((a: any, b: any) => {
    const ao = typeof a.orderIndex === 'number' ? a.orderIndex : 0
    const bo = typeof b.orderIndex === 'number' ? b.orderIndex : 0
    return ao - bo
  })

  // Ana karakter: öncelik isPrimary, yoksa ilk kayıt
  const primaryFromYc = (sortedYc.find((c: any) => c.isPrimary) || sortedYc[0]) as any | undefined
  const primaryId = (item?.aiCharacterId || primaryFromYc?.aiCharacterId || '') as string

  // Kalan karakterler: primary hariç ilk iki
  const remaining = sortedYc.filter((c: any) => c.aiCharacterId !== primaryId)
  const secondId = (remaining[0]?.aiCharacterId || '') as string
  const thirdId = (remaining[1]?.aiCharacterId || '') as string

  return {
    youtubeUrl: item?.youtubeUrl || '',
    awsUrl: item?.awsUrl || '',
    title: item?.title || '',
    story: item?.story || '',
    type: item?.type || '',
    languageId: item?.language ? String(item.language.id ?? '') : (item?.languageId != null ? String(item.languageId) : ''),
    coverImageId: '',
    videoId: item?.videoId || '',
    characterIdleVideoId: '',
    characterTalkingVideoId: '',
    aiCharacterId: primaryId,
    secondAiCharacterId: secondId,
    thirdAiCharacterId: thirdId,
    baseInstructionEntityId: item?.baseInstructionEntityId || '',
    active: item?.active ?? true,
    isChatOpen: item?.isChatOpen ?? true,
    characters: Array.isArray(item?.characters) ? item!.characters! : [],
    chatMode: (item?.chatMode as 'single' | 'multi') || 'single',
  }
}

function toDto(form: FormState, awsVideos: AwsVideosImageItem[]): CreateYoutubeDto {
  const coverItem = awsVideos.find(v => v.id === form.coverImageId)
  const idleItem = awsVideos.find(v => v.id === form.characterIdleVideoId)
  const talkingItem = awsVideos.find(v => v.id === form.characterTalkingVideoId)

  // youtubeCharacters: max 3 karakter (ana + 2 yan), primary ilk sırada
  const youtubeCharacters: NonNullable<CreateYoutubeDto['youtubeCharacters']> = []
  const primaryId = emptyToNull(form.aiCharacterId)
  if (primaryId) {
    youtubeCharacters.push({ aiCharacterId: primaryId, isPrimary: true, orderIndex: 0 })
  }
  const secondId = emptyToNull(form.secondAiCharacterId)
  if (secondId && secondId !== primaryId) {
    youtubeCharacters.push({ aiCharacterId: secondId, isPrimary: false, orderIndex: youtubeCharacters.length })
  }
  const thirdId = emptyToNull(form.thirdAiCharacterId)
  if (thirdId && thirdId !== primaryId && thirdId !== secondId) {
    youtubeCharacters.push({ aiCharacterId: thirdId, isPrimary: false, orderIndex: youtubeCharacters.length })
  }

  return {
    youtubeUrl: form.youtubeUrl.trim(),
    awsUrl: emptyToNull(form.awsUrl),
    title: form.title.trim(),
    story: emptyToNull(form.story),
    characters: form.characters.length > 0 ? form.characters : null,
    type: emptyToNull(form.type),
    languageId: numberOrNull(form.languageId),
    coverImageUrl: coverItem ? (coverItem.coverUrl ?? coverItem.coverImageUrl ?? null) : null,
    videoId: emptyToNull(form.videoId),
    videoType: emptyToNull(form.type),
    characterIdleVideoUrl: idleItem ? (idleItem.videoUrl ?? idleItem.awsVideoUrl ?? null) : null,
    characterTalkingVideoUrl: talkingItem ? (talkingItem.videoUrl ?? talkingItem.awsVideoUrl ?? null) : null,
    aiCharacterId: primaryId,
    baseInstructionEntityId: emptyToNull(form.baseInstructionEntityId),
    isChatOpen: !!form.isChatOpen,
    active: !!form.active,
    chatMode: form.chatMode,
    youtubeCharacters: youtubeCharacters.length > 0 ? youtubeCharacters : undefined,
  }
}

function createEmptyCharacter(): YoutubeCharacter {
  return {
    name: '',
    role: '',
    gender: '',
    voiceId: '',
    voiceName: '',
    languageCode: '',
    speakingStyle: '',
    characterVideoUrl: '',
  }
}

export default function Youtube() {
  const [rows, setRows] = useState<YoutubeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [languages, setLanguages] = useState<Language[]>([])
  const [aiCharacters, setAiCharacters] = useState<AICharacter[]>([])
  const [awsVideos, setAwsVideos] = useState<AwsVideosImageItem[]>([])
  const [baseInstructions, setBaseInstructions] = useState<BaseInstruction[]>([])

  const [searchText, setSearchText] = useState('')
  const [searchLanguageId, setSearchLanguageId] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(() => toFormState())
  const isEditing = useMemo(() => !!editingId, [editingId])

  function addCharacter() {
    setForm((s) => ({ ...s, characters: [...s.characters, createEmptyCharacter()] }))
  }

  function removeCharacter(index: number) {
    setForm((s) => ({ ...s, characters: s.characters.filter((_, i) => i !== index) }))
  }

  function updateCharacter(index: number, patch: Partial<YoutubeCharacter>) {
    setForm((s) => ({
      ...s,
      characters: s.characters.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }))
  }

  async function loadList(useSearch = false) {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const data = useSearch
        ? await search({
          q: searchText.trim() || undefined,
          languageId: searchLanguageId.trim() || undefined,
        })
        : await list()
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Hata')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    list()
      .then((data) => {
        if (alive) setRows(Array.isArray(data) ? data : [])
      })
      .catch((err: any) => {
        if (alive) setError(err?.message || 'Hata')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    listAICharacters()
      .then((data) => { if (alive) setAiCharacters(Array.isArray(data) ? data : []) })
      .catch(() => { if (alive) setAiCharacters([]) })
    listAwsVideos()
      .then((data) => { if (alive) setAwsVideos(Array.isArray(data) ? data : []) })
      .catch(() => { if (alive) setAwsVideos([]) })
    listBaseInstructions()
      .then((data) => { if (alive) setBaseInstructions(Array.isArray(data) ? data : []) })
      .catch(() => { if (alive) setBaseInstructions([]) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    listLanguages()
      .then((data) => {
        if (!alive) return
        const items = Array.isArray(data) ? data : []
        setLanguages(items)
      })
      .catch(() => {
        if (!alive) return
        setLanguages([])
      })
    return () => {
      alive = false
    }
  }, [])

  async function onNew() {
    setEditingId(null)
    setForm(toFormState())
    setStatus(null)
    setDialogOpen(true)
  }

  async function onEdit(id: string) {
    setStatus(null)
    setError(null)
    setDialogOpen(true)
    setEditingId(id)
    try {
      const item = await getOne(id)
      // Önce temel form state'i doldur
      let next = toFormState(item)

      // Mevcut URL'lere göre cover / idle / talking seçimlerini bul
      if (Array.isArray(awsVideos) && awsVideos.length > 0) {
        const coverMatch = awsVideos.find(v => {
          const url = v.coverUrl ?? v.coverImageUrl ?? null
          return url && url === item.coverImageUrl
        })
        const idleMatch = awsVideos.find(v => {
          const url = v.videoUrl ?? v.awsVideoUrl ?? null
          return url && url === item.characterIdleVideoUrl
        })
        const talkingMatch = awsVideos.find(v => {
          const url = v.videoUrl ?? v.awsVideoUrl ?? null
          return url && url === item.characterTalkingVideoUrl
        })

        next = {
          ...next,
          coverImageId: coverMatch ? coverMatch.id : '',
          characterIdleVideoId: idleMatch ? idleMatch.id : '',
          characterTalkingVideoId: talkingMatch ? talkingMatch.id : '',
        }
      }

      setForm(next)
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kayıt bulunamadı' })
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    setStatus(null)
    try {
      await remove(id)
      await loadList(false)
      setStatus({ type: 'success', message: 'Kayıt silindi' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Silme başarısız' })
    }
  }

  async function onSave() {
    const dto = toDto(form, awsVideos)
    if (!dto.youtubeUrl || !dto.title) {
      setStatus({ type: 'error', message: 'YouTube URL ve Başlık zorunludur' })
      return
    }

    if (!dto.type || (dto.type !== 'youtube' && dto.type !== 'short')) {
      setStatus({ type: 'error', message: 'Tür alanı zorunludur (youtube veya short)' })
      return
    }

    // Kurallar:
    // 1) isChatOpen true ise mutlaka ana karakter seçilmeli
    if (form.isChatOpen && !form.aiCharacterId.trim()) {
      setStatus({ type: 'error', message: 'Chat açıksa ana AI karakter seçilmelidir' })
      return
    }

    // 2) chatMode === 'multi' ise en az 2. karakter seçilmeli
    if (form.chatMode === 'multi' && !form.secondAiCharacterId.trim()) {
      setStatus({ type: 'error', message: 'Çoklu sohbet modunda en az iki AI karakter seçilmelidir (ana + 2. karakter)' })
      return
    }

    try {
      if (editingId) {
        await update(editingId, dto)
        setStatus({ type: 'success', message: 'Güncellendi' })
      } else {
        await create(dto)
        setStatus({ type: 'success', message: 'Oluşturuldu' })
      }
      setDialogOpen(false)
      setEditingId(null)
      setForm(toFormState())
      await loadList(false)
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kaydetme başarısız' })
    }
  }

  async function onDeleteFromDialog() {
    if (!editingId) return
    await onDelete(editingId)
    setDialogOpen(false)
    setEditingId(null)
    setForm(toFormState())
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>YouTube Videolar</Typography>

      {status && <Alert sx={{ mb: 2 }} severity={status.type}>{status.message}</Alert>}
      {error && <Alert sx={{ mb: 2 }} severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
        <TextField
          label="Başlık / YouTube URL ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <TextField
          label="Dil Id (opsiyonel)"
          value={searchLanguageId}
          onChange={(e) => setSearchLanguageId(e.target.value)}
          size="small"
          type="number"
          sx={{ width: { xs: '100%', md: 220 } }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<SearchIcon />} onClick={() => loadList(true)}>Ara</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}>Yeni Video</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadList(false)}>Yenile</Button>
        </Stack>
      </Stack>

      {loading && (
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <CircularProgress size={20} /> Yükleniyor...
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: '65vh' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={120}>İşlem</TableCell>
              <TableCell>Başlık</TableCell>
              <TableCell>YouTube</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Sohbet Modu</TableCell>
              <TableCell>Dil</TableCell>
              <TableCell>Aktif</TableCell>
              <TableCell>Chat Açık</TableCell>
              <TableCell>Oluşturma</TableCell>
              <TableCell>Güncelleme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Array.isArray(rows) ? rows : []).map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary" onClick={() => onEdit(r.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(r.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>{r.title || ''}</TableCell>
                <TableCell>
                  {r.youtubeUrl ? (
                    <a href={r.youtubeUrl} target="_blank" rel="noreferrer">Bağlantı</a>
                  ) : ''}
                </TableCell>
                <TableCell>{r.type || ''}</TableCell>
                <TableCell>{(r.chatMode === 'multi') ? 'Çoklu' : 'Tekli'}</TableCell>
                <TableCell>{r.language ? (r.language.name || r.language.id) : (r.languageId ?? '')}</TableCell>
                <TableCell>{r.active ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{r.isChatOpen ?? true ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>{formatDate(r.updatedAt)}</TableCell>
              </TableRow>
            ))}
            {(!loading && !error && (!Array.isArray(rows) || rows.length === 0)) && (
              <TableRow>
                <TableCell colSpan={8}>Kayıt bulunamadı</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Videoyu Düzenle' : 'Yeni Video'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="YouTube URL"
                value={form.youtubeUrl}
                onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
                fullWidth
              />
              <TextField
                label="AWS URL"
                value={form.awsUrl}
                onChange={(e) => setForm((s) => ({ ...s, awsUrl: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Başlık"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Hikaye"
              value={form.story}
              onChange={(e) => setForm((s) => ({ ...s, story: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Video Id"
                value={form.videoId}
                onChange={(e) => setForm((s) => ({ ...s, videoId: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="youtube-type-label">Tür</InputLabel>
                <Select
                  labelId="youtube-type-label"
                  label="Tür"
                  value={form.type}
                  onChange={(e) => setForm((s) => ({ ...s, type: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  <MenuItem value="youtube">youtube</MenuItem>
                  <MenuItem value="short">short</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-language-label">Dil</InputLabel>
                <Select
                  labelId="youtube-language-label"
                  label="Dil"
                  value={form.languageId}
                  onChange={(e) => setForm((s) => ({ ...s, languageId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {languages
                    .filter(l => l.isActive !== false)
                    .map((l) => (
                      <MenuItem key={l.id} value={String(l.id)}>
                        {l.name}{l.code ? ` (${l.code})` : ''}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="youtube-ai-character-label">Ana AI Character</InputLabel>
                <Select
                  labelId="youtube-ai-character-label"
                  label="Ana AI Character"
                  value={form.aiCharacterId}
                  onChange={(e) => setForm((s) => ({ ...s, aiCharacterId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {aiCharacters.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-second-ai-character-label">2. Karakter (opsiyonel)</InputLabel>
                <Select
                  labelId="youtube-second-ai-character-label"
                  label="2. Karakter (opsiyonel)"
                  value={form.secondAiCharacterId}
                  onChange={(e) => setForm((s) => ({ ...s, secondAiCharacterId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {aiCharacters.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-third-ai-character-label">3. Karakter (opsiyonel)</InputLabel>
                <Select
                  labelId="youtube-third-ai-character-label"
                  label="3. Karakter (opsiyonel)"
                  value={form.thirdAiCharacterId}
                  onChange={(e) => setForm((s) => ({ ...s, thirdAiCharacterId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {aiCharacters.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="youtube-base-instruction-label">Base Instruction</InputLabel>
                <Select
                  labelId="youtube-base-instruction-label"
                  label="Base Instruction"
                  value={form.baseInstructionEntityId}
                  onChange={(e) => setForm((s) => ({ ...s, baseInstructionEntityId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {baseInstructions.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name || b.code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-chat-mode-label">Sohbet Modu</InputLabel>
                <Select
                  labelId="youtube-chat-mode-label"
                  label="Sohbet Modu"
                  value={form.chatMode}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      chatMode: e.target.value === 'multi' ? 'multi' : 'single',
                    }))
                  }
                >
                  <MenuItem value="single">Tekli Sohbet</MenuItem>
                  <MenuItem value="multi">Çoklu Sohbet</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <FormControl fullWidth>
                <InputLabel id="youtube-cover-label">Kapak Resmi</InputLabel>
                <Select
                  labelId="youtube-cover-label"
                  label="Kapak Resmi"
                  value={form.coverImageId}
                  onChange={(e) => setForm((s) => ({ ...s, coverImageId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {awsVideos
                    .filter(v => v.coverImageKey || v.coverImageUrl)
                    .map((v) => (
                      <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-idle-video-label">Karakter Idle Video</InputLabel>
                <Select
                  labelId="youtube-idle-video-label"
                  label="Karakter Idle Video"
                  value={form.characterIdleVideoId}
                  onChange={(e) => setForm((s) => ({ ...s, characterIdleVideoId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {awsVideos
                    .filter(v => v.awsVideoKey || v.awsVideoUrl)
                    .map((v) => (
                      <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="youtube-talking-video-label">Karakter Konuşma Video</InputLabel>
                <Select
                  labelId="youtube-talking-video-label"
                  label="Karakter Konuşma Video"
                  value={form.characterTalkingVideoId}
                  onChange={(e) => setForm((s) => ({ ...s, characterTalkingVideoId: String(e.target.value || '') }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  {awsVideos
                    .filter(v => v.awsVideoKey || v.awsVideoUrl)
                    .map((v) => (
                      <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isChatOpen}
                    onChange={(e) => setForm((s) => ({ ...s, isChatOpen: e.target.checked }))}
                  />
                }
                label="Chat Açık"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.active}
                    onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  />
                }
                label="Aktif"
              />
            </Stack>

            {/* Seçili kapak / idle / konuşma video URL'lerini göster */}
            {(() => {
              const coverItem = awsVideos.find(v => v.id === form.coverImageId)
              const idleItem = awsVideos.find(v => v.id === form.characterIdleVideoId)
              const talkingItem = awsVideos.find(v => v.id === form.characterTalkingVideoId)

              const coverUrl = coverItem ? (coverItem.coverUrl ?? coverItem.coverImageUrl ?? null) : null
              const idleUrl = idleItem ? (idleItem.videoUrl ?? idleItem.awsVideoUrl ?? null) : null
              const talkingUrl = talkingItem ? (talkingItem.videoUrl ?? talkingItem.awsVideoUrl ?? null) : null

              if (!coverUrl && !idleUrl && !talkingUrl) return null

              return (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {coverUrl && (
                    <Typography variant="body2">
                      Kapak URL:&nbsp;
                      <a href={coverUrl} target="_blank" rel="noreferrer">{coverUrl}</a>
                    </Typography>
                  )}
                  {idleUrl && (
                    <Typography variant="body2">
                      Idle Video URL:&nbsp;
                      <a href={idleUrl} target="_blank" rel="noreferrer">{idleUrl}</a>
                    </Typography>
                  )}
                  {talkingUrl && (
                    <Typography variant="body2">
                      Konuşma Video URL:&nbsp;
                      <a href={talkingUrl} target="_blank" rel="noreferrer">{talkingUrl}</a>
                    </Typography>
                  )}
                </Stack>
              )
            })()}

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography variant="subtitle1">Karakterler</Typography>
                <Button size="small" variant="outlined" onClick={addCharacter}>Karakter Ekle</Button>
              </Stack>

              {(form.characters || []).map((ch, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Karakter #{idx + 1}</Typography>
                    <Button size="small" color="error" variant="text" onClick={() => removeCharacter(idx)}>Kaldır</Button>
                  </Stack>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        label="Ad"
                        value={ch.name}
                        onChange={(e) => updateCharacter(idx, { name: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Rol"
                        value={ch.role}
                        onChange={(e) => updateCharacter(idx, { role: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Cinsiyet"
                        value={ch.gender}
                        onChange={(e) => updateCharacter(idx, { gender: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        label="Voice Id"
                        value={ch.voiceId}
                        onChange={(e) => updateCharacter(idx, { voiceId: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Voice Name"
                        value={ch.voiceName}
                        onChange={(e) => updateCharacter(idx, { voiceName: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        label="Language Code"
                        value={ch.languageCode}
                        onChange={(e) => updateCharacter(idx, { languageCode: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Speaking Style"
                        value={ch.speakingStyle}
                        onChange={(e) => updateCharacter(idx, { speakingStyle: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Stack>

                    <TextField
                      label="Character Video URL"
                      value={ch.characterVideoUrl || ''}
                      onChange={(e) => updateCharacter(idx, { characterVideoUrl: e.target.value })}
                      fullWidth
                      size="small"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Divider />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">İptal</Button>
          {isEditing && (
            <Button onClick={onDeleteFromDialog} color="error" variant="outlined" startIcon={<DeleteIcon />}>Sil</Button>
          )}
          <Button onClick={onSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
