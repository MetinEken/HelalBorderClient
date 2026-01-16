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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
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
import InfoIcon from '@mui/icons-material/Info'
import Divider from '@mui/material/Divider'
import {
  create,
  list,
  remove,
  update,
  type PaketDto,
  type PaketPeriodUnit,
} from '../services/paketService'

function toFormState(item?: PaketDto): PaketDto {
  return {
    id: item?.id,
    isim: item?.isim || '',
    aciklama: item?.aciklama || '',
    sure: item?.sure ?? 30,
    fiyat: item?.fiyat ?? 0,
    paraBirimi: item?.paraBirimi || 'TRY',
    aktif: item?.aktif ?? true,
    platform: item?.platform || 'android',
    googlePlayProductId: item?.googlePlayProductId || '',
    appStoreProductId: item?.appStoreProductId || '',
    ozellikler: item?.ozellikler || '',
    sku: item?.sku || '',
    basePlanId: item?.basePlanId || '',
    offerId: item?.offerId || '',
    packageName: item?.packageName || '',
    nameTr: item?.nameTr || '',
    nameEn: item?.nameEn || '',
    nameDe: item?.nameDe || '',
    descriptionTr: item?.descriptionTr || '',
    descriptionEn: item?.descriptionEn || '',
    descriptionDe: item?.descriptionDe || '',
    discount: item?.discount ?? 0,
    allowanceSeconds: item?.allowanceSeconds ?? 0,
    carryOverAllowed: item?.carryOverAllowed ?? true,
    maxCarryOverSeconds: item?.maxCarryOverSeconds ?? null,
    // Yeni iOS / store alanları için varsayılanlar
    periodUnit: (item?.periodUnit as PaketPeriodUnit | undefined) || 'month',
    periodCount: item?.periodCount ?? 1,
    subscriptionGroupId: item?.subscriptionGroupId || '',
    appStoreOfferIdentifiers: item?.appStoreOfferIdentifiers || '',
    storeDisplayPrice: item?.storeDisplayPrice ?? 0,
    storeCurrencyCode: item?.storeCurrencyCode || 'EUR',
  }
}

export default function Abonelikler() {
  const [rows, setRows] = useState<PaketDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PaketDto>(() => toFormState())
  const isEditing = useMemo(() => editingId != null, [editingId])

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<PaketDto | null>(null)

  async function loadList() {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const data = await list()
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

  function onNew() {
    setEditingId(null)
    setForm(toFormState())
    setStatus(null)
    setDialogOpen(true)
  }

  function onDetail(item: PaketDto) {
    setDetailItem(item)
    setDetailOpen(true)
  }

  function onEdit(item: PaketDto) {
    if (!item.id) return
    setEditingId(item.id)
    setForm(toFormState(item))
    setStatus(null)
    setDialogOpen(true)
  }

  async function onDelete(item: PaketDto) {
    if (!item.id) return
    if (!confirm('Bu paketi silmek istiyor musunuz?')) return
    setStatus(null)
    try {
      await remove(item.id)
      await loadList()
      setStatus({ type: 'success', message: 'Paket silindi' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Silme başarısız' })
    }
  }

  async function onSave() {
    // Platforma göre zorunlu alan kontrolü
    if (!form.isim) {
      setStatus({ type: 'error', message: 'İsim zorunludur' })
      return
    }

    if (form.platform === 'android') {
      if (!form.sku || !form.basePlanId || !form.offerId || !form.googlePlayProductId) {
        setStatus({
          type: 'error',
          message: 'Android için SKU, Base Plan ID, Offer ID ve Google Play Product ID zorunludur',
        })
        return
      }
    }

    if (form.platform === 'ios') {
      if (!form.appStoreProductId) {
        setStatus({ type: 'error', message: 'iOS için App Store Product ID zorunludur' })
        return
      }
      if (!form.periodUnit || !form.periodCount) {
        setStatus({ type: 'error', message: 'iOS için periyot birimi ve periyot sayısı zorunludur' })
        return
      }
    }
    try {
      if (editingId != null) {
        await update(editingId, form)
        setStatus({ type: 'success', message: 'Güncellendi' })
      } else {
        await create(form)
        setStatus({ type: 'success', message: 'Oluşturuldu' })
      }
      setDialogOpen(false)
      setEditingId(null)
      setForm(toFormState())
      await loadList()
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Kaydetme başarısız' })
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Abonelik Paketleri</Typography>

      {status && <Alert sx={{ mb: 2 }} severity={status.type}>{status.message}</Alert>}
      {error && <Alert sx={{ mb: 2 }} severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ md: 'center' }}>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}>Yeni Paket</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadList}>Yenile</Button>
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
              <TableCell>ID</TableCell>
              <TableCell>İsim</TableCell>
              <TableCell>Fiyat</TableCell>
              <TableCell>Para Birimi</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Aktif</TableCell>
              <TableCell>Allowance (sn)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Array.isArray(rows) ? rows : []).map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="info" onClick={() => onDetail(r)}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => onEdit(r)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(r)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.isim}</TableCell>
                <TableCell>{r.fiyat}</TableCell>
                <TableCell>{r.paraBirimi}</TableCell>
                <TableCell>{r.platform}</TableCell>
                <TableCell>{r.aktif ? 'Evet' : 'Hayır'}</TableCell>
                <TableCell>{r.allowanceSeconds}</TableCell>
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
        <DialogTitle>{isEditing ? 'Paketi Düzenle' : 'Yeni Paket'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="İsim"
                value={form.isim}
                onChange={(e) => setForm((s) => ({ ...s, isim: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Açıklama"
                value={form.aciklama}
                onChange={(e) => setForm((s) => ({ ...s, aciklama: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Store Fiyat"
                type="number"
                value={form.storeDisplayPrice != null ? String(form.storeDisplayPrice) : ''}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    storeDisplayPrice: e.target.value === '' ? null : parseFloat(e.target.value || '0') || 0,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Store Para Birimi"
                value={form.storeCurrencyCode || ''}
                onChange={(e) => setForm((s) => ({ ...s, storeCurrencyCode: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Süre (gün)"
                type="number"
                value={String(form.sure)}
                onChange={(e) => setForm((s) => ({ ...s, sure: parseInt(e.target.value || '0', 10) || 0 }))}
                fullWidth
              />
              <TextField
                label="Allowance (saniye)"
                type="number"
                value={String(form.allowanceSeconds)}
                onChange={(e) => setForm((s) => ({ ...s, allowanceSeconds: parseInt(e.target.value || '0', 10) || 0 }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Fiyat"
                type="number"
                value={String(form.fiyat)}
                onChange={(e) => setForm((s) => ({ ...s, fiyat: parseFloat(e.target.value || '0') || 0 }))}
                fullWidth
              />
              <TextField
                label="Para Birimi"
                value={form.paraBirimi}
                onChange={(e) => setForm((s) => ({ ...s, paraBirimi: e.target.value }))}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="paket-platform-label">Platform</InputLabel>
                <Select
                  labelId="paket-platform-label"
                  label="Platform"
                  value={form.platform}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      platform: (e.target.value || 'android') as PaketDto['platform'],
                    }))
                  }
                >
                  <MenuItem value="android">android</MenuItem>
                  <MenuItem value="ios">ios</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Base Plan ID"
                value={form.basePlanId}
                onChange={(e) => setForm((s) => ({ ...s, basePlanId: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Offer ID"
                value={form.offerId}
                onChange={(e) => setForm((s) => ({ ...s, offerId: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Package Name"
                value={form.packageName}
                onChange={(e) => setForm((s) => ({ ...s, packageName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="İndirim (%)"
                type="number"
                value={String(form.discount ?? 0)}
                onChange={(e) => setForm((s) => ({ ...s, discount: parseFloat(e.target.value || '0') || 0 }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Google Play Product ID"
                value={form.googlePlayProductId || ''}
                onChange={(e) => setForm((s) => ({ ...s, googlePlayProductId: e.target.value }))}
                fullWidth
              />
              <TextField
                label="App Store Product ID"
                value={form.appStoreProductId || ''}
                onChange={(e) => setForm((s) => ({ ...s, appStoreProductId: e.target.value }))}
                fullWidth
              />
            </Stack>

            {form.platform === 'ios' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="period-unit-label">Periyot Birimi</InputLabel>
                  <Select
                    labelId="period-unit-label"
                    label="Periyot Birimi"
                    value={form.periodUnit || ''}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, periodUnit: (e.target.value || 'month') as PaketPeriodUnit }))
                    }
                  >
                    <MenuItem value="day">day</MenuItem>
                    <MenuItem value="week">week</MenuItem>
                    <MenuItem value="month">month</MenuItem>
                    <MenuItem value="year">year</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Periyot Sayısı"
                  type="number"
                  value={form.periodCount != null ? String(form.periodCount) : ''}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      periodCount: e.target.value === '' ? null : parseInt(e.target.value || '0', 10) || 0,
                    }))
                  }
                  fullWidth
                />
              </Stack>
            )}

            {form.platform === 'ios' && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Subscription Group ID"
                  value={form.subscriptionGroupId || ''}
                  onChange={(e) => setForm((s) => ({ ...s, subscriptionGroupId: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="App Store Offer Identifiers (JSON)"
                  value={form.appStoreOfferIdentifiers || ''}
                  onChange={(e) => setForm((s) => ({ ...s, appStoreOfferIdentifiers: e.target.value }))}
                  fullWidth
                />
              </Stack>
            )}

            <TextField
              label="Özellikler (özellikler)"
              value={form.ozellikler || ''}
              onChange={(e) => setForm((s) => ({ ...s, ozellikler: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Ad (TR)"
                value={form.nameTr || ''}
                onChange={(e) => setForm((s) => ({ ...s, nameTr: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ad (EN)"
                value={form.nameEn || ''}
                onChange={(e) => setForm((s) => ({ ...s, nameEn: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ad (DE)"
                value={form.nameDe || ''}
                onChange={(e) => setForm((s) => ({ ...s, nameDe: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Açıklama (TR)"
                value={form.descriptionTr || ''}
                onChange={(e) => setForm((s) => ({ ...s, descriptionTr: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Açıklama (EN)"
                value={form.descriptionEn || ''}
                onChange={(e) => setForm((s) => ({ ...s, descriptionEn: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Açıklama (DE)"
                value={form.descriptionDe || ''}
                onChange={(e) => setForm((s) => ({ ...s, descriptionDe: e.target.value }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.aktif}
                    onChange={(e) => setForm((s) => ({ ...s, aktif: e.target.checked }))}
                  />
                }
                label="Aktif"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.carryOverAllowed}
                    onChange={(e) => setForm((s) => ({ ...s, carryOverAllowed: e.target.checked }))}
                  />
                }
                label="Carry Over Allowed"
              />
              <TextField
                label="Maks. Carry Over (sn)"
                type="number"
                value={form.maxCarryOverSeconds != null ? String(form.maxCarryOverSeconds) : ''}
                onChange={(e) => {
                  const v = e.target.value
                  setForm((s) => ({
                    ...s,
                    maxCarryOverSeconds: v === '' ? null : (parseInt(v || '0', 10) || 0),
                  }))
                }}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">İptal</Button>
          {isEditing && (
            <Button onClick={() => onDelete(form)} color="error" variant="outlined" startIcon={<DeleteIcon />}>Sil</Button>
          )}
          <Button onClick={onSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Paket Detayı</DialogTitle>
        <DialogContent dividers>
          {detailItem && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Temel Bilgiler
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {detailItem.id}
              </Typography>
              <Typography variant="body2">
                <strong>İsim:</strong> {detailItem.isim}
              </Typography>
              <Typography variant="body2">
                <strong>Açıklama:</strong> {detailItem.aciklama}
              </Typography>
              <Typography variant="body2">
                <strong>Süre (gün):</strong> {detailItem.sure}
              </Typography>
              <Typography variant="body2">
                <strong>Fiyat:</strong> {detailItem.fiyat} {detailItem.paraBirimi}
              </Typography>
              <Typography variant="body2">
                <strong>Platform:</strong> {detailItem.platform}
              </Typography>
              <Typography variant="body2">
                <strong>Aktif:</strong> {detailItem.aktif ? 'Evet' : 'Hayır'}
              </Typography>
              <Typography variant="body2">
                <strong>Allowance (sn):</strong> {detailItem.allowanceSeconds}
              </Typography>
              <Typography variant="body2">
                <strong>Carry Over Allowed:</strong> {detailItem.carryOverAllowed ? 'Evet' : 'Hayır'}
              </Typography>
              <Typography variant="body2">
                <strong>Max Carry Over (sn):</strong> {detailItem.maxCarryOverSeconds ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Periyot Birimi:</strong> {detailItem.periodUnit ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Periyot Sayısı:</strong> {detailItem.periodCount ?? '-'}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Ürün Kimlikleri
              </Typography>
              <Typography variant="body2">
                <strong>SKU:</strong> {detailItem.sku}
              </Typography>
              <Typography variant="body2">
                <strong>Package Name:</strong> {detailItem.packageName}
              </Typography>
              <Typography variant="body2">
                <strong>Base Plan ID:</strong> {detailItem.basePlanId}
              </Typography>
              <Typography variant="body2">
                <strong>Offer ID:</strong> {detailItem.offerId}
              </Typography>
              <Typography variant="body2">
                <strong>Google Play Product ID:</strong> {detailItem.googlePlayProductId ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>App Store Product ID:</strong> {detailItem.appStoreProductId ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Subscription Group ID:</strong> {detailItem.subscriptionGroupId ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>App Store Offer Identifiers:</strong> {detailItem.appStoreOfferIdentifiers ?? ''}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Çok Dilli Ad ve Açıklama
              </Typography>
              <Typography variant="body2">
                <strong>Ad (TR):</strong> {detailItem.nameTr ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Ad (EN):</strong> {detailItem.nameEn ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Ad (DE):</strong> {detailItem.nameDe ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Açıklama (TR):</strong> {detailItem.descriptionTr ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Açıklama (EN):</strong> {detailItem.descriptionEn ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Açıklama (DE):</strong> {detailItem.descriptionDe ?? ''}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Diğer
              </Typography>
              <Typography variant="body2">
                <strong>İndirim (%):</strong> {detailItem.discount ?? 0}
              </Typography>
              <Typography variant="body2">
                <strong>Store Fiyat:</strong> {detailItem.storeDisplayPrice ?? '-'}{' '}
                {detailItem.storeCurrencyCode ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Özellikler:</strong> {detailItem.ozellikler ?? ''}
              </Typography>
              <Typography variant="body2">
                <strong>Abonelik Sayısı:</strong> {detailItem.abonelikSayisi ?? '-'}
              </Typography>
              <Typography variant="body2">
                <strong>Oluşturma:</strong>{' '}
                {detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString('tr-TR') : ''}
              </Typography>
              <Typography variant="body2">
                <strong>Güncelleme:</strong>{' '}
                {detailItem.updatedAt ? new Date(detailItem.updatedAt).toLocaleString('tr-TR') : ''}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} variant="outlined">Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
