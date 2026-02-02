import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import Loader from './components/Loader'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Band from './components/Band'
import Music from './components/Music'
import Venues from './components/Venues'
import Live from './components/Live'
import Gallery from './components/Gallery'
import Events from './components/Events'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminPage from './components/AdminPage'

function App() {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove the #
      if (hash === 'admin') {
        setCurrentPage('admin')
        setLoading(false) // Skip loader for admin
      } else {
        setCurrentPage('home')
      }
    }

    // Check initial hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    // Only show loader for home page
    if (currentPage === 'home' && loading) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [currentPage, loading])

  // Admin page (protected with login)
  if (currentPage === 'admin') {
    return <AdminPage />
  }

  // Main website
  return (
    <>
      <CustomCursor />
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navbar />
          <main>
            <Hero />
            <About />
            <Events />
            <Band />
            <Music />
            <Venues />
            <Live />
            <Gallery />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}

export default App

