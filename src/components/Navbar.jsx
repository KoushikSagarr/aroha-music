import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('home')

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)

            // Update active section based on scroll position
            const sections = ['home', 'about', 'band', 'music', 'venues', 'live', 'contact']
            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            const offset = 80
            const top = element.offsetTop - offset
            window.scrollTo({ top, behavior: 'smooth' })
        }
        setMenuOpen(false)
    }

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'band', label: 'The Band' },
        { id: 'music', label: 'Music' },
        { id: 'venues', label: 'Venues' },
        { id: 'live', label: '🎤 Live' },
        { id: 'contact', label: 'Book Us' },
    ]

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 2.5 }}
        >
            <div className="nav-container">
                <button className="nav-logo" onClick={() => scrollToSection('home')}>
                    <img src="/logo.jpg" alt="AROHA Music" />
                </button>

                <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    className={`nav-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </motion.nav>
    )
}

export default Navbar
