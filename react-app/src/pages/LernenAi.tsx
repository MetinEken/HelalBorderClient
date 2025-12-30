import { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { listMembers, type Member } from '../services/memberService'

function formatDate(v?: string) {
  if (!v) return '-'
  const d = new Date(v)
  return d.toLocaleString('tr-TR')
}

export default function LernenAi(){
  const [rows, setRows] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<50 | 100 | 200>(50)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    listMembers(page, limit)
      .then(res => {
        if (!alive) return
        setRows(res.items)
        setHasNext(!!res.hasNext)
      })
      .catch(err => {
        if (!alive) return
        setError(err?.message || 'Hata')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => { alive = false }
  }, [page, limit])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Lernen Ai - Üyeler</Typography>
      {loading && (
        <Box display="flex" alignItems="center" gap={1}><CircularProgress size={20} /> Yükleniyor...</Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ad</TableCell>
                  <TableCell>User Code</TableCell>
                  <TableCell>Target Language</TableCell>
                  <TableCell>Native Language</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Creation Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(rows) ? rows : [])
                  .slice()
                  .sort((a, b) => {
                    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    return db - da
                  })
                  .map((r) => (
                  <TableRow key={String(r.id)}>
                    <TableCell>{r.name || '-'}</TableCell>
                    <TableCell>{r.userCode ?? '-'}</TableCell>
                    <TableCell>{r.targetLanguage ?? '-'}</TableCell>
                    <TableCell>{r.nativeLanguage ?? '-'}</TableCell>
                    <TableCell>{r.platform ?? '-'}</TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {(Array.isArray(rows) ? rows.length === 0 : true) && (
                  <TableRow>
                    <TableCell colSpan={6}>Kayıt bulunamadı</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ md: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>Sayfa: {page} | Limit: {limit}</Box>
            <ButtonGroup variant="outlined" size="small">
              <Button variant={limit === 50 ? 'contained' : 'outlined'} onClick={() => { setPage(1); setLimit(50) }}>50</Button>
              <Button variant={limit === 100 ? 'contained' : 'outlined'} onClick={() => { setPage(1); setLimit(100) }}>100</Button>
              <Button variant={limit === 200 ? 'contained' : 'outlined'} onClick={() => { setPage(1); setLimit(200) }}>200</Button>
            </ButtonGroup>
            <Button variant="contained" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
          </Stack>
        </>
      )}
    </Box>
  )
}
