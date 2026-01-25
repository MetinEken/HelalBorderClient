import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  getAllTokenRates,
  createTokenRate,
  updateTokenRate,
  deleteTokenRate,
  getCacheStatus,
  type TokenRateConfig,
  type CreateTokenRateDto,
  type CacheStatus,
} from '../services/tokenRateService'

export default function TokenRateConfigPage() {
  const [configs, setConfigs] = useState<TokenRateConfig[]>([])
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState<TokenRateConfig | null>(null)

  // Form state
  const [formProvider, setFormProvider] = useState('')
  const [formOperation, setFormOperation] = useState('')
  const [formRate, setFormRate] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [configsData, cacheData] = await Promise.all([
        getAllTokenRates(),
        getCacheStatus(),
      ])
      setConfigs(configsData)
      setCacheStatus(cacheData)
    } catch (e: any) {
      setError(e?.message || 'Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingConfig(null)
    setFormProvider('')
    setFormOperation('')
    setFormRate('')
    setFormUnit('')
    setFormDescription('')
    setFormIsActive(true)
    setOpenDialog(true)
  }

  const handleOpenEdit = (config: TokenRateConfig) => {
    setEditingConfig(config)
    setFormProvider(config.provider)
    setFormOperation(config.operation)
    setFormRate(String(config.rate))
    setFormUnit(config.unit)
    setFormDescription(config.description || '')
    setFormIsActive(config.isActive)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingConfig(null)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(null)

    if (!formProvider || !formOperation || !formRate || !formUnit) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    const rate = parseFloat(formRate)
    if (isNaN(rate) || rate <= 0) {
      setError('Rate pozitif bir sayı olmalıdır')
      return
    }

    setLoading(true)
    try {
      const dto: CreateTokenRateDto = {
        provider: formProvider,
        operation: formOperation,
        rate,
        unit: formUnit,
        description: formDescription || undefined,
        isActive: formIsActive,
      }

      if (editingConfig) {
        await updateTokenRate(editingConfig.id, dto)
        setSuccess('Token rate başarıyla güncellendi')
      } else {
        await createTokenRate(dto)
        setSuccess('Token rate başarıyla oluşturuldu')
      }

      handleCloseDialog()
      await loadData()
    } catch (e: any) {
      setError(e?.message || 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteTokenRate(id)
      setSuccess('Token rate başarıyla silindi')
      await loadData()
    } catch (e: any) {
      setError(e?.message || 'Silme işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Token Rate Konfigürasyonu</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={loading}
          >
            Yeni Ekle
          </Button>
        </Stack>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cache Status Card */}
      {cacheStatus && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Cache Durumu" />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Son Güncelleme: {new Date(cacheStatus.info.lastUpdate).toLocaleString('tr-TR')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktif Entry: {cacheStatus.info.entryCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cached Rates:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(cacheStatus.rates).map(([key, value]) => (
                    <Chip key={key} label={`${key}: ${value}`} size="small" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.id}</TableCell>
                <TableCell>{config.provider}</TableCell>
                <TableCell>{config.operation}</TableCell>
                <TableCell>{config.rate}</TableCell>
                <TableCell>{config.unit}</TableCell>
                <TableCell>{config.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={config.isActive ? 'Aktif' : 'Pasif'}
                    color={config.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEdit(config)}
                    disabled={loading}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(config.id)}
                    disabled={loading}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Token Rate Düzenle' : 'Yeni Token Rate Ekle'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select
                value={formProvider}
                label="Provider"
                onChange={(e) => setFormProvider(e.target.value)}
              >
                <MenuItem value="deepgram">Deepgram</MenuItem>
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="elevenlabs">ElevenLabs</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Operation</InputLabel>
              <Select
                value={formOperation}
                label="Operation"
                onChange={(e) => setFormOperation(e.target.value)}
              >
                <MenuItem value="stt">STT (Speech-to-Text)</MenuItem>
                <MenuItem value="tts">TTS (Text-to-Speech)</MenuItem>
                <MenuItem value="llm">LLM (Language Model)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Rate"
              type="number"
              value={formRate}
              onChange={(e) => setFormRate(e.target.value)}
              inputProps={{ step: '0.1', min: '0' }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Unit</InputLabel>
              <Select
                value={formUnit}
                label="Unit"
                onChange={(e) => setFormUnit(e.target.value)}
              >
                <MenuItem value="second">Second (saniye)</MenuItem>
                <MenuItem value="character">Character (karakter)</MenuItem>
                <MenuItem value="token">Token</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
              }
              label="Aktif"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
