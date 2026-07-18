import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AssistantDock from './components/AssistantDock'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'

const InvitationCardPage = lazy(() => import('./pages/InvitationCardPage'))

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route
            path="/carte-invitation"
            element={
              <Suspense fallback={null}>
                <InvitationCardPage />
              </Suspense>
            }
          />
        </Routes>
      </main>
      <Footer />
      <AssistantDock />
    </>
  )
}

export default App
