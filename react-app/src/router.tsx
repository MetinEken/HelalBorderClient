import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './layout/Layout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import Home from './pages/Home'
import Raporlar from './pages/Raporlar'
import Kullanicilar from './pages/Kullanicilar'
import Ayarlar from './pages/Ayarlar'
import Yardim from './pages/Yardim'
import Profil from './pages/Profil'
import Bildirimler from './pages/Bildirimler'
import Loglar from './pages/Loglar'
import Hakkinda from './pages/Hakkinda'
import HelalKontrol from './pages/HelalKontrol'
import LernenAi from './pages/LernenAi'
import TokenKullanim from './pages/TokenKullanim'
import HataBildirimleri from './pages/HataBildirimleri'
import Youtube from './pages/Youtube'
import BaseInstructer from './pages/BaseInstructer'
import AICharacters from './pages/AICharacters'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'raporlar', element: <Raporlar /> },
          { path: 'kullanicilar', element: <Kullanicilar /> },
          { path: 'ayarlar', element: <Ayarlar /> },
          { path: 'yardim', element: <Yardim /> },
          { path: 'profil', element: <Profil /> },
          { path: 'bildirimler', element: <Bildirimler /> },
          { path: 'loglar', element: <Loglar /> },
          { path: 'hakkinda', element: <Hakkinda /> },
          // App tabs
          { path: 'helal-kontrol', element: <HelalKontrol /> },
          { path: 'lernen-ai', element: <LernenAi /> },
          { path: 'token-kullanim', element: <TokenKullanim /> },
          { path: 'hata-bildirimleri', element: <HataBildirimleri /> },
          { path: 'youtube', element: <Youtube /> },
          { path: 'base-instructer', element: <BaseInstructer /> },
          { path: 'ai-characters', element: <AICharacters /> },
          { path: '*', element: <Navigate to="/" /> },
        ],
      },
    ],
  },
])
