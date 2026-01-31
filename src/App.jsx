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
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

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
            <Band />
            <Music />
            <Venues />
            <Live />
            <Contact />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}

export default App
