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

type FormState = {
  youtubeUrl: string
  awsUrl: string
  baseStoryId: string
  title: string
  story: string
  type: string
  languageId: string
  assistantId: string
  basePromt: string
  coverImageUrl: string
  active: boolean
  characters: YoutubeCharacter[]
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
  return {
    youtubeUrl: item?.youtubeUrl || '',
    awsUrl: item?.awsUrl || '',
    baseStoryId: item?.baseStoryId || '',
    title: item?.title || '',
    story: item?.story || '',
    type: item?.type || '',
    languageId: item?.language ? String(item.language.id ?? '') : (item?.languageId != null ? String(item.languageId) : ''),
    assistantId: item?.assistantId || '',
    basePromt: item?.basePromt || '',
    coverImageUrl: item?.coverImageUrl || '',
    active: item?.active ?? true,
    characters: Array.isArray(item?.characters) ? item!.characters! : [],
  }
}

function toDto(form: FormState): CreateYoutubeDto {
  return {
    youtubeUrl: form.youtubeUrl.trim(),
    awsUrl: emptyToNull(form.awsUrl),
    baseStoryId: emptyToNull(form.baseStoryId),
    title: form.title.trim(),
    story: emptyToNull(form.story),
    characters: form.characters.length > 0 ? form.characters : null,
    type: emptyToNull(form.type),
    languageId: numberOrNull(form.languageId),
    assistantId: emptyToNull(form.assistantId),
    basePromt: emptyToNull(form.basePromt),
    coverImageUrl: emptyToNull(form.coverImageUrl),
    active: !!form.active,
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
      setForm(toFormState(item))
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
    const dto = toDto(form)
    if (!dto.youtubeUrl || !dto.title) {
      setStatus({ type: 'error', message: 'YouTube URL ve Başlık zorunludur' })
      return
    }

    if (!dto.type || (dto.type !== 'youtube' && dto.type !== 'short')) {
      setStatus({ type: 'error', message: 'Tür alanı zorunludur (youtube veya short)' })
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
              <TableCell>Dil</TableCell>
              <TableCell>Aktif</TableCell>
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
                <TableCell>{r.language ? (r.language.name || r.language.id) : (r.languageId ?? '')}</TableCell>
                <TableCell>{r.active ? 'Evet' : 'Hayır'}</TableCell>
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
                label="Base Story Id"
                value={form.baseStoryId}
                onChange={(e) => setForm((s) => ({ ...s, baseStoryId: e.target.value }))}
                fullWidth
              />
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
              <TextField
                label="Asistan Id"
                value={form.assistantId}
                onChange={(e) => setForm((s) => ({ ...s, assistantId: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Base Prompt"
              value={form.basePromt}
              onChange={(e) => setForm((s) => ({ ...s, basePromt: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField
                label="Kapak Resmi URL"
                value={form.coverImageUrl}
                onChange={(e) => setForm((s) => ({ ...s, coverImageUrl: e.target.value }))}
                fullWidth
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
