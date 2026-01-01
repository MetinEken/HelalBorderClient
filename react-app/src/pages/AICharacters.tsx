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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import { listByRelations, type YoutubeItem } from '../services/youtubeService'
import {
  createAICharacter,
  deleteAICharacter,
  getAICharacter,
  listAICharacters,
  updateAICharacter,
  type AICharacter,
  type CreateAICharacterDto,
  type UpdateAICharacterDto,
} from '../services/aiCharacterService'

function formatDate(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleString('tr-TR')
}

function toFormState(item?: AICharacter) {
  return {
    name: item?.name ?? '',
    personality: item?.personality ?? '',
    tone: item?.tone ?? '',
    voiceId: item?.voiceId ?? '',
    voiceIdName: item?.voiceIdName ?? '',
    biografi: item?.biografi ?? '',
  }
}

function toCreateDto(form: ReturnType<typeof toFormState>): CreateAICharacterDto {
  return {
    name: form.name.trim(),
    personality: form.personality.trim(),
    tone: form.tone.trim(),
    voiceId: form.voiceId.trim() || undefined,
    voiceIdName: form.voiceIdName.trim() || undefined,
    biografi: form.biografi.trim() || undefined,
  }
}

function toUpdateDto(form: ReturnType<typeof toFormState>): UpdateAICharacterDto {
  const dto: UpdateAICharacterDto = {}
  if (form.name.trim()) dto.name = form.name.trim()
  if (form.personality.trim()) dto.personality = form.personality.trim()
  if (form.tone.trim()) dto.tone = form.tone.trim()
  if (form.voiceId.trim()) dto.voiceId = form.voiceId.trim()
  if (form.voiceIdName.trim()) dto.voiceIdName = form.voiceIdName.trim()
  if (form.biografi.trim()) dto.biografi = form.biografi.trim()
  return dto
}

export default function AICharacters() {
  const [rows, setRows] = useState<AICharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false)
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [youtubeError, setYoutubeError] = useState<string | null>(null)
  const [youtubeRows, setYoutubeRows] = useState<YoutubeItem[]>([])
  const [youtubeForName, setYoutubeForName] = useState<string>('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(() => toFormState())
  const isEditing = useMemo(() => !!editingId, [editingId])

  async function loadList() {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const data = await listAICharacters()
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Hata')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  async function openYoutubeDialogForCharacter(ch: AICharacter) {
    setYoutubeDialogOpen(true)
    setYoutubeForName(ch.name || '')
    setYoutubeLoading(true)
    setYoutubeError(null)
    setYoutubeRows([])
    try {
      const result = await listByRelations({ aiCharacterId: ch.id })
      setYoutubeRows(Array.isArray(result) ? result : [])
    } catch (err: any) {
      setYoutubeError(err?.message || 'YouTube listesi alınamadı')
    } finally {
      setYoutubeLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  function openCreateDialog() {
    setEditingId(null)
    setForm(toFormState())
    setDialogOpen(true)
  }

  async function openEditDialog(id: string) {
    try {
      setLoading(true)
      setError(null)
      const item = await getAICharacter(id)
      setEditingId(id)
      setForm(toFormState(item))
      setDialogOpen(true)
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kayıt yüklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  async function onSave() {
    try {
      setLoading(true)
      setError(null)
      setStatus(null)
      if (!form.name.trim()) {
        setStatus({ type: 'error', message: 'İsim zorunludur' })
        setLoading(false)
        return
      }
      if (!form.personality.trim()) {
        setStatus({ type: 'error', message: 'Karakter (personality) zorunludur' })
        setLoading(false)
        return
      }
      if (!form.tone.trim()) {
        setStatus({ type: 'error', message: 'Ton (tone) zorunludur' })
        setLoading(false)
        return
      }

      if (isEditing && editingId) {
        const dto = toUpdateDto(form)
        await updateAICharacter(editingId, dto)
        setStatus({ type: 'success', message: 'Kayıt güncellendi' })
      } else {
        const dto = toCreateDto(form)
        await createAICharacter(dto)
        setStatus({ type: 'success', message: 'Kayıt oluşturuldu' })
      }
      setDialogOpen(false)
      await loadList()
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kaydedilemedi' })
    } finally {
      setLoading(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Bu karakteri silmek istediğinize emin misiniz?')) return
    try {
      setLoading(true)
      setError(null)
      setStatus(null)
      await deleteAICharacter(id)
      setStatus({ type: 'success', message: 'Kayıt silindi' })
      await loadList()
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Silinemedi' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h4">AI Karakterler</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadList()} disabled={loading}>
            Yenile
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Yeni Karakter
          </Button>
        </Stack>
      </Stack>

      {loading && (
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          Yükleniyor...
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.message}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>İsim</TableCell>
              <TableCell>Karakter (personality)</TableCell>
              <TableCell>Ton (tone)</TableCell>
              <TableCell>Voice Id</TableCell>
              <TableCell>Voice Adı</TableCell>
              <TableCell>Oluşturma</TableCell>
              <TableCell>Aksiyonlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.personality}</TableCell>
                <TableCell>{r.tone}</TableCell>
                <TableCell>{r.voiceId ?? ''}</TableCell>
                <TableCell>{r.voiceIdName ?? ''}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary" onClick={() => openYoutubeDialogForCharacter(r)}>
                      <PlaylistPlayIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEditDialog(r.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(r.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {(!rows || rows.length === 0) && (
              <TableRow>
                <TableCell colSpan={7}>Kayıt bulunamadı</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={youtubeDialogOpen} onClose={() => setYoutubeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{youtubeForName ? `YouTube Videoları - ${youtubeForName}` : 'YouTube Videoları'}</DialogTitle>
        <DialogContent dividers>
          {youtubeLoading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <CircularProgress size={20} />
              Yükleniyor...
            </Box>
          )}
          {youtubeError && <Alert severity="error" sx={{ mb: 2 }}>{youtubeError}</Alert>}
          {!youtubeLoading && !youtubeError && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Başlık</TableCell>
                    <TableCell>YouTube URL</TableCell>
                    <TableCell>Cover Image</TableCell>
                    <TableCell>Tür</TableCell>
                    <TableCell>Oluşturma</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(youtubeRows || []).map((y) => (
                    <TableRow key={y.id}>
                      <TableCell>{y.title}</TableCell>
                      <TableCell>
                        {y.youtubeUrl ? (
                          <a href={y.youtubeUrl} target="_blank" rel="noreferrer">Link</a>
                        ) : ''}
                      </TableCell>
                      <TableCell>
                        {y.coverImageUrl ? (
                          <a href={y.coverImageUrl} target="_blank" rel="noreferrer">Resim</a>
                        ) : ''}
                      </TableCell>
                      <TableCell>{y.type || ''}</TableCell>
                      <TableCell>{formatDate(y.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {(!youtubeRows || youtubeRows.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5}>Kayıt bulunamadı</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setYoutubeDialogOpen(false)} variant="outlined">Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'AI Karakter Düzenle' : 'Yeni AI Karakter'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="İsim"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Karakter (personality)"
              value={form.personality}
              onChange={(e) => setForm((s) => ({ ...s, personality: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              placeholder="Örnek: friendly, patient, teacher"
              helperText="Öneri: friendly, patient, teacher (istersen kendi tanımını yazabilirsin)"
            />
            <TextField
              label="Ton (tone)"
              value={form.tone}
              onChange={(e) => setForm((s) => ({ ...s, tone: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              placeholder="Örnek: warm, slow, clear"
              helperText="Öneri: warm, slow, clear (istersen kendi tonunu yazabilirsin)"
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Voice Id"
                value={form.voiceId}
                onChange={(e) => setForm((s) => ({ ...s, voiceId: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Voice Adı"
                value={form.voiceIdName}
                onChange={(e) => setForm((s) => ({ ...s, voiceIdName: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Biyografi"
              value={form.biografi}
              onChange={(e) => setForm((s) => ({ ...s, biografi: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">İptal</Button>
          <Button onClick={onSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
