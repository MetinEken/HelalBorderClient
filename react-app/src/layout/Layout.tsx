import { useState } from 'react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

const topMenus: Array<{label: string; to: string}> = []

// Sadece uygulamadaki ana tablar drawer'da gösterilecek
const drawerMenus = [
  { label: 'Helal Kontrol', to: '/helal-kontrol' },
  { label: 'Lernen Ai', to: '/lernen-ai' },
  { label: 'Token Kullanım', to: '/token-kullanim' },
  { label: 'Hata Bildirimleri', to: '/hata-bildirimleri' },
  { label: 'YouTube Videolar', to: '/youtube' },
  { label: 'BaseInstructer', to: '/base-instructer' },
  { label: 'AI Karakterler', to: '/ai-characters' },
]

export default function Layout(){
  const [open, setOpen] = useState(false)
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={()=>setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mr: 2, flexGrow: 1, textAlign: { xs: 'left', md: 'center' } }}>SpeakAi App</Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={()=>setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={()=>setOpen(false)} onKeyDown={()=>setOpen(false)}>
          <List>
            {drawerMenus.map(m => (
              <ListItem key={m.to} disablePadding>
                <ListItemButton component={RouterLink} to={m.to}>
                  <ListItemText primary={m.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
