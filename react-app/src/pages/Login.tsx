import { FormEvent, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as any

  async function onSubmit(e: FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 10 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Giriş</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş'}
            </Button>
            <Typography variant="body2">
              Hesabın yok mu?{' '}
              <Button component={RouterLink} to="/register" variant="text" size="small">Kayıt ol</Button>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}
