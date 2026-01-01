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
import {
  createBaseInstruction,
  deleteBaseInstruction,
  getBaseInstruction,
  listBaseInstructions,
  updateBaseInstruction,
  type BaseInstruction,
  type CreateBaseInstructionDto,
  type UpdateBaseInstructionDto,
} from '../services/baseInstructionService'

function formatDate(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleString('tr-TR')
}

function toFormState(item?: BaseInstruction) {
  return {
    name: item?.name ?? '',
    code: item?.code ?? '',
    description: item?.description ?? '',
    baseInstruction: item?.baseInstruction ?? '',
    maxReplySentences: item?.maxReplySentences != null ? String(item.maxReplySentences) : '',
    enableCorrection: item?.enableCorrection ?? false,
    allowFollowup: item?.allowFollowup ?? false,
  }
}

function toCreateDto(form: ReturnType<typeof toFormState>): CreateBaseInstructionDto {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    description: form.description.trim(),
    baseInstruction: form.baseInstruction,
    maxReplySentences: form.maxReplySentences.trim() === '' ? null : Number(form.maxReplySentences),
    enableCorrection: !!form.enableCorrection,
    allowFollowup: !!form.allowFollowup,
  }
}

function toUpdateDto(form: ReturnType<typeof toFormState>): UpdateBaseInstructionDto {
  const dto: UpdateBaseInstructionDto = {}
  if (form.name.trim() !== '') dto.name = form.name.trim()
  if (form.code.trim() !== '') dto.code = form.code.trim()
  if (form.description.trim() !== '') dto.description = form.description.trim()
  if (form.baseInstruction.trim() !== '') dto.baseInstruction = form.baseInstruction
  dto.maxReplySentences = form.maxReplySentences.trim() === '' ? null : Number(form.maxReplySentences)
  dto.enableCorrection = !!form.enableCorrection
  dto.allowFollowup = !!form.allowFollowup
  return dto
}

export default function BaseInstructer() {
  const [rows, setRows] = useState<BaseInstruction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(() => toFormState())
  const isEditing = useMemo(() => !!editingId, [editingId])

  async function loadList() {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const data = await listBaseInstructions()
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Hata')
      setRows([])
    } finally {
      setLoading(false)
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
      const item = await getBaseInstruction(id)
      setEditingId(id)
      setForm(toFormState(item))
      setDialogOpen(true)
    } catch (err: any) {
      setError(err?.message || 'Kayıt yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function onSave() {
    try {
      setLoading(true)
      setError(null)
      setStatus(null)
      if (isEditing && editingId) {
        const dto = toUpdateDto(form)
        await updateBaseInstruction(editingId, dto)
        setStatus({ type: 'success', message: 'Kayıt güncellendi' })
      } else {
        const dto = toCreateDto(form)
        await createBaseInstruction(dto)
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
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    try {
      setLoading(true)
      setError(null)
      setStatus(null)
      await deleteBaseInstruction(id)
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
        <Typography variant="h4">BaseInstructer</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadList()} disabled={loading}>
            Yenile
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Yeni Ekle
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
              <TableCell>Ad</TableCell>
              <TableCell>Kod</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Max Cümle</TableCell>
              <TableCell>Düzeltme Açık</TableCell>
              <TableCell>Takip Sorusu</TableCell>
              <TableCell>Oluşturma</TableCell>
              <TableCell>Aksiyonlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name || '-'}</TableCell>
                <TableCell>{r.code}</TableCell>
                <TableCell>{r.description || '-'}</TableCell>
                <TableCell>{r.maxReplySentences ?? '-'}</TableCell>
                <TableCell>{r.enableCorrection ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{r.allowFollowup ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
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
                <TableCell colSpan={8}>Kayıt bulunamadı</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'BaseInstruction Düzenle' : 'Yeni BaseInstruction Ekle'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Ad"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Kod"
                value={form.code}
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Açıklama"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />

            <TextField
              label="Base Instruction"
              value={form.baseInstruction}
              onChange={(e) => setForm((s) => ({ ...s, baseInstruction: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
            />

            <TextField
              label="Maksimum Cümle Sayısı"
              type="number"
              value={form.maxReplySentences}
              onChange={(e) => setForm((s) => ({ ...s, maxReplySentences: e.target.value }))}
              fullWidth
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={form.enableCorrection}
                    onChange={(e) => setForm((s) => ({ ...s, enableCorrection: e.target.checked }))}
                  />
                )}
                label="Düzeltme Açık"
              />
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={form.allowFollowup}
                    onChange={(e) => setForm((s) => ({ ...s, allowFollowup: e.target.checked }))}
                  />
                )}
                label="Takip Sorularına İzin Ver"
              />
            </Stack>
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
