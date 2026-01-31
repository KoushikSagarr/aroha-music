import { motion } from 'framer-motion'

const Footer = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const navItems = ['home', 'about', 'band', 'music', 'contact']

    return (
        <motion.footer
            className="footer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src="/logo.jpg" alt="AROHA Music" className="footer-logo" />
                        <p>Bringing live music magic to venues across the city.</p>
                    </div>
                    <div className="footer-links">
                        {navItems.map((item) => (
                            <motion.button
                                key={item}
                                onClick={() => scrollToSection(item)}
                                whileHover={{ color: '#E8A87C' }}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </motion.button>
                        ))}
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 AROHA Music. All rights reserved.</p>
                    <p className="made-with">Made with ♪ and ❤</p>
                </div>
            </div>
        </motion.footer>
    )
}

export default Footer
