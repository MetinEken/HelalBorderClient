import { FormEvent, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { useAuth } from '../context/AuthContext'

function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8) return 'Şifre en az 8 karakter olmalı'
  if (!/[A-Z]/.test(pw)) return 'Şifre en az 1 büyük harf içermeli'
  if (!/[a-z]/.test(pw)) return 'Şifre en az 1 küçük harf içermeli'
  if (!/[0-9]/.test(pw)) return 'Şifre en az 1 rakam içermeli'
  return null
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordError = useMemo(() => validatePassword(password), [password])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const pwErr = validatePassword(password)
    if (pwErr) {
      setError(pwErr)
      return
    }

    setLoading(true)
    try {
      const res = await register(name.trim(), email.trim(), password)
      if (!res?.success) {
        setError(res?.message || 'Kayıt başarısız')
        return
      }
      setSuccess(res.message || 'Kayıt başarılı')
      setTimeout(() => navigate('/login', { replace: true }), 600)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', mt: 10 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Kayıt Ol</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
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
              autoComplete="new-password"
              required
              fullWidth
              error={!!password && !!passwordError}
              helperText={password ? (passwordError || 'Güçlü şifre') : 'En az 8 karakter, büyük/küçük harf ve rakam'}
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>

            <Typography variant="body2">
              Zaten hesabın var mı?{' '}
              <Button component={RouterLink} to="/login" variant="text" size="small">Giriş yap</Button>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}
