import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AssistantDock from './components/AssistantDock'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/galerie" element={<GalleryPage />} />
        </Routes>
      </main>
      <Footer />
      <AssistantDock />
    </>
  )
}

export default App
