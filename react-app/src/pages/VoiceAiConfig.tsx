import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  Alert,
} from '@mui/material'
import { getVoiceAiConfig, setLlmModel, setTtsProvider, type VoiceAiConfig } from '../services/voiceAiService'

export default function VoiceAiConfigPage() {
  const [config, setConfig] = useState<VoiceAiConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const cfg = await getVoiceAiConfig()
        if (!cancelled) setConfig(cfg)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Konfigürasyon yüklenemedi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleTtsChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    if (!config) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await setTtsProvider(value)
      setConfig(updated)
      setSuccess('TTS provider başarıyla güncellendi')
    } catch (e: any) {
      setError(e?.message || 'TTS provider güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleLlmChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    if (!config) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await setLlmModel(value)
      setConfig(updated)
      setSuccess('LLM modeli başarıyla güncellendi')
    } catch (e: any) {
      setError(e?.message || 'LLM modeli güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Voice AI Konfigürasyonu
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Youtube karakterleri ile sesli sohbet için kullanılan LLM modeli ve TTS sağlayıcısını buradan değiştirebilirsin.
      </Typography>

      {success && (
        <Box mt={2}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box mt={2} maxWidth={480}>
        <Card>
          <CardHeader title="Genel Durum" subheader={loading ? 'Yükleniyor...' : 'Anlık konfigürasyon'} />
          <CardContent>
            {config && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2">AI Provider</Typography>
                  <Typography variant="body2">{config.aiProvider}</Typography>
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel id="llm-select-label">LLM Modeli</InputLabel>
                  <Select
                    labelId="llm-select-label"
                    label="LLM Modeli"
                    value={config.llmModel || ''}
                    onChange={handleLlmChange}
                    disabled={loading}
                  >
                    {(config.allowedLlmModels || []).map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel id="tts-select-label">TTS Provider</InputLabel>
                  <Select
                    labelId="tts-select-label"
                    label="TTS Provider"
                    value={config.ttsProvider || ''}
                    onChange={handleTtsChange}
                    disabled={loading}
                  >
                    {(config.allowedTtsProviders || []).map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
