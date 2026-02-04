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
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import {
  create,
  list,
  remove,
  update,
  type VersionDto,
} from '../services/versionService'

function toFormState(item?: VersionDto): VersionDto {
  return {
    id: item?.id,
    description: item?.description || '',
    lastVersion: item?.lastVersion ?? 0,
    minVersion: item?.minVersion ?? 0,
    isMandatory: item?.isMandatory ?? false,
    lastUseDateAt: item?.lastUseDateAt || null,
    androidLastVersion: item?.androidLastVersion ?? null,
    androidMinVersion: item?.androidMinVersion ?? null,
    androidIsMandatory: item?.androidIsMandatory ?? false,
    androidDescription: item?.androidDescription || '',
    iosLastVersion: item?.iosLastVersion ?? null,
    iosMinVersion: item?.iosMinVersion ?? null,
    iosIsMandatory: item?.iosIsMandatory ?? false,
    iosDescription: item?.iosDescription || '',
  }
}

export default function VersionManagement() {
  const [rows, setRows] = useState<VersionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VersionDto>(() => toFormState())
  const isEditing = useMemo(() => editingId != null, [editingId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await list()
      setRows(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenDialog = (item?: VersionDto) => {
    if (item?.id) {
      setEditingId(item.id)
      setForm(toFormState(item))
    } else {
      setEditingId(null)
      setForm(toFormState())
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingId(null)
    setForm(toFormState())
  }

  const handleSave = async () => {
    setStatus(null)
    try {
      if (isEditing && editingId) {
        await update(editingId, form)
        setStatus({ type: 'success', message: 'Versiyon güncellendi' })
      } else {
        await create(form)
        setStatus({ type: 'success', message: 'Versiyon oluşturuldu' })
      }
      handleCloseDialog()
      fetchData()
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || err.message || 'İşlem başarısız',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu versiyonu silmek istediğinize emin misiniz?')) return
    setStatus(null)
    try {
      await remove(id)
      setStatus({ type: 'success', message: 'Versiyon silindi' })
      fetchData()
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || err.message || 'Silme başarısız',
      })
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Versiyon Yönetimi
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Versiyon
          </Button>
        </Stack>
      </Stack>

      {status && (
        <Alert severity={status.type} sx={{ mb: 2 }} onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Açıklama</TableCell>
                <TableCell align="center">Legacy Version</TableCell>
                <TableCell align="center">Android</TableCell>
                <TableCell align="center">iOS</TableCell>
                <TableCell align="center">Zorunlu</TableCell>
                <TableCell align="center">Son Kullanım</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Henüz versiyon kaydı yok
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {row.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Chip
                          label={`v${row.lastVersion}`}
                          size="small"
                          color="default"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Min: {row.minVersion}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {row.androidLastVersion ? (
                        <Stack spacing={0.5} alignItems="center">
                          <Chip
                            label={`v${row.androidLastVersion}`}
                            size="small"
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Min: {row.androidMinVersion || 0}
                          </Typography>
                          {row.androidIsMandatory && (
                            <Chip label="Zorunlu" size="small" color="error" />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.iosLastVersion ? (
                        <Stack spacing={0.5} alignItems="center">
                          <Chip
                            label={`v${row.iosLastVersion}`}
                            size="small"
                            color="info"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Min: {row.iosMinVersion || 0}
                          </Typography>
                          {row.iosIsMandatory && (
                            <Chip label="Zorunlu" size="small" color="error" />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.isMandatory ? (
                        <Chip label="Evet" size="small" color="error" />
                      ) : (
                        <Chip label="Hayır" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {row.lastUseDateAt
                          ? new Date(row.lastUseDateAt).toLocaleDateString('tr-TR')
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => row.id && handleDelete(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Versiyon Düzenle' : 'Yeni Versiyon'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Legacy Fields */}
            <Typography variant="h6" color="primary">
              Genel Bilgiler (Legacy)
            </Typography>
            <TextField
              label="Açıklama"
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Son Versiyon"
                  type="number"
                  fullWidth
                  value={form.lastVersion}
                  onChange={(e) =>
                    setForm({ ...form, lastVersion: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Minimum Versiyon"
                  type="number"
                  fullWidth
                  value={form.minVersion}
                  onChange={(e) =>
                    setForm({ ...form, minVersion: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isMandatory}
                  onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                />
              }
              label="Zorunlu Güncelleme"
            />
            <TextField
              label="Son Kullanım Tarihi"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
                form.lastUseDateAt
                  ? new Date(form.lastUseDateAt).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  lastUseDateAt: e.target.value ? new Date(e.target.value) : null,
                })
              }
            />

            <Divider />

            {/* Android Fields */}
            <Typography variant="h6" color="success.main">
              Android Özel Ayarlar
            </Typography>
            <TextField
              label="Android Açıklama"
              fullWidth
              value={form.androidDescription || ''}
              onChange={(e) => setForm({ ...form, androidDescription: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Android Son Versiyon"
                  type="number"
                  fullWidth
                  value={form.androidLastVersion ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      androidLastVersion: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Android Min Versiyon"
                  type="number"
                  fullWidth
                  value={form.androidMinVersion ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      androidMinVersion: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.androidIsMandatory || false}
                  onChange={(e) =>
                    setForm({ ...form, androidIsMandatory: e.target.checked })
                  }
                />
              }
              label="Android Zorunlu Güncelleme"
            />

            <Divider />

            {/* iOS Fields */}
            <Typography variant="h6" color="info.main">
              iOS Özel Ayarlar
            </Typography>
            <TextField
              label="iOS Açıklama"
              fullWidth
              value={form.iosDescription || ''}
              onChange={(e) => setForm({ ...form, iosDescription: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="iOS Son Versiyon"
                  type="number"
                  fullWidth
                  value={form.iosLastVersion ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      iosLastVersion: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="iOS Min Versiyon"
                  type="number"
                  fullWidth
                  value={form.iosMinVersion ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      iosMinVersion: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.iosIsMandatory || false}
                  onChange={(e) => setForm({ ...form, iosIsMandatory: e.target.checked })}
                />
              }
              label="iOS Zorunlu Güncelleme"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
