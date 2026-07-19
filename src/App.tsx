import { Routes, Route } from 'react-router'
import { StoreProvider } from '@/lib/store'
import Home from './pages/Home'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </StoreProvider>
  )
}
