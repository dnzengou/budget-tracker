import { Routes, Route } from 'react-router'
import { StoreProvider } from '@/lib/store'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Toaster />
    </StoreProvider>
  )
}
