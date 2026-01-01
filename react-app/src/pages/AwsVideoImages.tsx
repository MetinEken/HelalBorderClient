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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import {
  create,
  getOne,
  list,
  remove,
  search,
  createDraft,
  finalizeUpload,
  markUploadFailed,
  getSignedUrls,
  type AwsVideosImageItem,
  type CreateAwsVideosImageDto,
} from '../services/awsVideosImageService'
import { listLanguages, type Language } from '../services/languageService'

function formatDate(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleString('tr-TR')
}

type FormState = {
  name: string
  videoType: string
  languageId: string
  active: boolean
  // Sadece düzenleme modunda URL'leri gösterip değiştiriyoruz
  awsVideoUrl: string
  coverImageUrl: string
}

function toFormState(item?: AwsVideosImageItem): FormState {
  return {
    name: item?.name || '',
    awsVideoUrl: item?.awsVideoUrl || '',
    coverImageUrl: item?.coverImageUrl || '',
    videoType: item?.videoType || '',
    languageId: item?.language ? String(item.language.id ?? '') : (item?.languageId != null ? String(item.languageId) : ''),
    active: item?.active ?? true,
  }
}

async function openVideo(r: AwsVideosImageItem, setStatus: (status: { type: 'success' | 'error'; message: string } | null) => void) {
  try {
    const data = await getSignedUrls(r.id)
    if (data?.videoUrl) {
      window.open(data.videoUrl, '_blank')
    } else {
      setStatus({ type: 'error', message: 'Video URL üretilemedi' })
    }
  } catch (err: any) {
    setStatus({ type: 'error', message: err?.message || 'Video URL alınamadı' })
  }
}

async function openCover(r: AwsVideosImageItem, setStatus: (status: { type: 'success' | 'error'; message: string } | null) => void) {
  try {
    const data = await getSignedUrls(r.id)
    if (data?.coverUrl) {
      window.open(data.coverUrl, '_blank')
    } else {
      setStatus({ type: 'error', message: 'Kapak resmi URL üretilemedi' })
    }
  } catch (err: any) {
    setStatus({ type: 'error', message: err?.message || 'Kapak resmi URL alınamadı' })
  }
}

function toDto(form: FormState): CreateAwsVideosImageDto {
  const trim = (v: string) => (v || '').trim()
  const emptyToNull = (v: string) => {
    const t = trim(v)
    return t === '' ? null : t
  }
  const numberOrNull = (v: string) => {
    const t = trim(v)
    return t === '' ? null : Number(t)
  }

  return {
    name: trim(form.name),
    awsVideoUrl: trim(form.awsVideoUrl),
    coverImageUrl: emptyToNull(form.coverImageUrl),
    videoType: trim(form.videoType),
    languageId: numberOrNull(form.languageId),
    active: !!form.active,
  }
}

export default function AwsVideoImages() {
  const [rows, setRows] = useState<AwsVideosImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [languages, setLanguages] = useState<Language[]>([])

  const [searchText, setSearchText] = useState('')
  const [searchVideoType, setSearchVideoType] = useState('')
  const [searchLanguageId, setSearchLanguageId] = useState('')
  const [searchActive, setSearchActive] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(() => toFormState())
  const isEditing = useMemo(() => !!editingId, [editingId])

  async function openVideo(r: AwsVideosImageItem) {
    try {
      const data = await getSignedUrls(r.id)
      if (data?.videoUrl) {
        window.open(data.videoUrl, '_blank')
      } else {
        setStatus({ type: 'error', message: 'Video URL üretilemedi' })
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Video URL alınamadı' })
    }
  }

  async function openCover(r: AwsVideosImageItem) {
    try {
      const data = await getSignedUrls(r.id)
      if (data?.coverUrl) {
        window.open(data.coverUrl, '_blank')
      } else {
        setStatus({ type: 'error', message: 'Kapak resmi URL üretilemedi' })
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kapak resmi URL alınamadı' })
    }
  }

  async function loadList(useSearch = false, pageOverride?: number) {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      if (useSearch) {
        const p = pageOverride ?? page
        const res = await search({
          page: p,
          pageSize,
          search: searchText.trim() || undefined,
          videoType: searchVideoType.trim() || undefined,
          languageId: searchLanguageId ? Number(searchLanguageId) : undefined,
          active: searchActive === '' ? undefined : searchActive === 'true',
        })
        setRows(Array.isArray(res.items) ? res.items : [])
        setPage(res.page || p)
      } else {
        const data = await list()
        setRows(Array.isArray(data) ? data : [])
      }
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
        if (!alive) return
        setRows(Array.isArray(data) ? data : [])
      })
      .catch((err: any) => {
        if (!alive) return
        setError(err?.message || 'Hata')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
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
    setVideoFile(null)
    setCoverFile(null)
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
      setVideoFile(null)
      setCoverFile(null)
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
    if (editingId) {
      // Sadece metadata güncellemesi (URL'ler dahil) için mevcut update akışını kullan
      const dto = toDto(form)
      if (!dto.name || !dto.videoType) {
        setStatus({ type: 'error', message: 'Name ve Video Tipi zorunludur' })
        return
      }
      try {
        await createOrUpdate('update', editingId, dto)
        setStatus({ type: 'success', message: 'Güncellendi' })
        setDialogOpen(false)
        setEditingId(null)
        setForm(toFormState())
        await loadList(false)
      } catch (err: any) {
        setStatus({ type: 'error', message: err?.message || 'Kaydetme başarısız' })
      }
      return
    }

    // Yeni kayıt: S3 upload akışı
    if (!form.name.trim() || !form.videoType.trim()) {
      setStatus({ type: 'error', message: 'Name ve Video Tipi zorunludur' })
      return
    }
    if (!videoFile) {
      setStatus({ type: 'error', message: 'Video dosyası seçilmelidir' })
      return
    }

    setUploading(true)
    setStatus(null)
    try {
      const langId = form.languageId.trim() ? Number(form.languageId) : null

      const videoExt = (videoFile.name.split('.').pop() || '').toLowerCase()
      const coverExt = coverFile ? (coverFile.name.split('.').pop() || '').toLowerCase() : undefined

      const draft = await createDraft({
        name: form.name.trim(),
        videoType: form.videoType.trim(),
        languageId: langId ?? undefined,
        active: form.active,
        videoExt,
        videoContentType: videoFile.type,
        coverExt,
        coverContentType: coverFile?.type,
      })

      // S3'e PUT
      await fetch(draft.video.putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': videoFile.type },
        body: videoFile,
      })

      if (coverFile && draft.cover) {
        await fetch(draft.cover.putUrl, {
          method: 'PUT',
          headers: { 'Content-Type': coverFile.type },
          body: coverFile,
        })
      }

      await finalizeUpload(draft.id, {
        videoKey: draft.video.key,
        coverKey: draft.cover?.key ?? null,
      })

      setStatus({ type: 'success', message: 'Video yüklendi ve kaydedildi' })
      setDialogOpen(false)
      setEditingId(null)
      setForm(toFormState())
      setVideoFile(null)
      setCoverFile(null)
      await loadList(false)
    } catch (err: any) {
      const msg = err?.message || 'Upload veya kaydetme başarısız'
      setStatus({ type: 'error', message: msg })
      // Draft id'si yoksa fail çağrısı yapamayız
      // createDraft başarısız olursa burada draft.id olmayacak, sadece mesaj gösteriyoruz
      // createDraft başarılı ama upload/finalize sırasında hata olursa fail endpoint'i çağırmayı tercih edebiliriz.
      // Ancak burada draft id'sine erişmemiz gerekir; bu daha karmaşık state yönetimi
      // Şimdilik sadece kullanıcıya hata gösteriyoruz.
    } finally {
      setUploading(false)
    }
  }

  async function createOrUpdate(mode: 'create' | 'update', id: string | null, dto: CreateAwsVideosImageDto) {
    if (mode === 'create') {
      await create(dto)
    } else if (id) {
      await import('../services/awsVideosImageService').then((m) => m.update(id, dto))
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
      <Typography variant="h4" sx={{ mb: 2 }}>AWS Video Images</Typography>

      {status && <Alert sx={{ mb: 2 }} severity={status.type}>{status.message}</Alert>}
      {error && <Alert sx={{ mb: 2 }} severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
        <TextField
          label="İsim / URL ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="aws-video-type-label">Video Tipi</InputLabel>
          <Select
            labelId="aws-video-type-label"
            label="Video Tipi"
            value={searchVideoType}
            onChange={(e) => setSearchVideoType(String(e.target.value || ''))}
          >
            <MenuItem value=""><em>Hepsi</em></MenuItem>
            <MenuItem value="youtube">youtube</MenuItem>
            <MenuItem value="short">short</MenuItem>
            <MenuItem value="character-greeting">character-greeting</MenuItem>
            <MenuItem value="character-idle-talk">character-idle-talk</MenuItem>
            <MenuItem value="character-talking">character-talking</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel id="aws-video-language-label">Dil</InputLabel>
          <Select
            labelId="aws-video-language-label"
            label="Dil"
            value={searchLanguageId}
            onChange={(e) => setSearchLanguageId(String(e.target.value || ''))}
          >
            <MenuItem value=""><em>Hepsi</em></MenuItem>
            {languages
              .filter(l => l.isActive !== false)
              .map((l) => (
                <MenuItem key={l.id} value={String(l.id)}>
                  {l.name}{l.code ? ` (${l.code})` : ''}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel id="aws-video-active-label">Aktif</InputLabel>
          <Select
            labelId="aws-video-active-label"
            label="Aktif"
            value={searchActive}
            onChange={(e) => setSearchActive(String(e.target.value || ''))}
          >
            <MenuItem value=""><em>Hepsi</em></MenuItem>
            <MenuItem value="true">Evet</MenuItem>
            <MenuItem value="false">Hayır</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => loadList(true, 1)}
            disabled={uploading || loading}
          >Ara</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNew}
            disabled={uploading || loading}
          >Yeni Kayıt</Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadList(false)}
            disabled={uploading || loading}
          >Yenile</Button>
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
              <TableCell>İsim</TableCell>
              <TableCell>AWS Video URL</TableCell>
              <TableCell>Kapak Resmi</TableCell>
              <TableCell>Video Tipi</TableCell>
              <TableCell>Dil</TableCell>
              <TableCell>Upload Durumu</TableCell>
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
                <TableCell>{r.name || ''}</TableCell>
                <TableCell>
                  {r.awsVideoKey ? (
                    <Button size="small" onClick={() => openVideo(r)}>Video</Button>
                  ) : ''}
                </TableCell>
                <TableCell>
                  {r.coverImageKey ? (
                    <Button size="small" onClick={() => openCover(r)}>Resim</Button>
                  ) : ''}
                </TableCell>
                <TableCell>{r.videoType || ''}</TableCell>
                <TableCell>{r.language ? (r.language.name || r.language.id) : (r.languageId ?? '')}</TableCell>
                <TableCell>{r.uploadStatus || ''}</TableCell>
                <TableCell>{r.active ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>{formatDate(r.updatedAt)}</TableCell>
              </TableRow>
            ))}
            {(!loading && !error && (!Array.isArray(rows) || rows.length === 0)) && (
              <TableRow>
                <TableCell colSpan={9}>Kayıt bulunamadı</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Kaydı Düzenle' : 'Yeni Kayıt'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="İsim"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            {isEditing ? (
              <>
                <TextField
                  label="AWS Video URL"
                  value={form.awsVideoUrl}
                  onChange={(e) => setForm((s) => ({ ...s, awsVideoUrl: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Kapak Resmi URL"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm((s) => ({ ...s, coverImageUrl: e.target.value }))}
                  fullWidth
                />
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Video Dosyası Seç
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null
                      setVideoFile(f)
                    }}
                  />
                </Button>
                {videoFile && <Typography variant="body2">Video: {videoFile.name}</Typography>}
                <Button
                  variant="outlined"
                  component="label"
                >
                  Kapak Resmi (opsiyonel)
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null
                      setCoverFile(f)
                    }}
                  />
                </Button>
                {coverFile && <Typography variant="body2">Kapak: {coverFile.name}</Typography>}
              </>
            )}
            <FormControl fullWidth>
              <InputLabel id="aws-dialog-video-type-label">Video Tipi</InputLabel>
              <Select
                labelId="aws-dialog-video-type-label"
                label="Video Tipi"
                value={form.videoType}
                onChange={(e) => setForm((s) => ({ ...s, videoType: String(e.target.value || '') }))}
              >
                <MenuItem value=""><em>Seçiniz</em></MenuItem>
                <MenuItem value="youtube">youtube</MenuItem>
                <MenuItem value="short">short</MenuItem>
                <MenuItem value="character-greeting">character-greeting</MenuItem>
                <MenuItem value="character-idle-talk">character-idle-talk</MenuItem>
                <MenuItem value="character-talking">character-talking</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="aws-dialog-language-label">Dil</InputLabel>
              <Select
                labelId="aws-dialog-language-label"
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
            <FormControlLabel
              control={(
                <Checkbox
                  checked={form.active}
                  onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  disabled={uploading}
                />
              )}
              label="Aktif"
            />
            {uploading && (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={18} />
                <Typography variant="body2">Dosyalar S3'e yükleniyor...</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" disabled={uploading}>İptal</Button>
          {isEditing && (
            <Button
              onClick={onDeleteFromDialog}
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              disabled={uploading}
            >Sil</Button>
          )}
          <Button onClick={onSave} variant="contained" disabled={uploading}>
            {uploading ? 'Yükleniyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
