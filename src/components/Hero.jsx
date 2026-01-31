import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const Hero = () => {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 300])
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 150])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    const scrollToContact = () => {
        const element = document.getElementById('contact')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const scrollToMusic = () => {
        const element = document.getElementById('music')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="hero" id="home" ref={ref}>
            <div className="hero-bg">
                <motion.div
                    className="floating-shape"
                    style={{
                        width: 400,
                        height: 400,
                        background: '#E8A87C',
                        top: -100,
                        right: -100,
                        y: y1
                    }}
                    animate={{
                        x: [0, 30, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="floating-shape"
                    style={{
                        width: 300,
                        height: 300,
                        background: '#FFCBA4',
                        bottom: -50,
                        left: -50,
                        y: y2
                    }}
                    animate={{
                        x: [0, -20, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="floating-shape"
                    style={{
                        width: 200,
                        height: 200,
                        background: '#E27D60',
                        top: '30%',
                        left: '10%',
                        y: y3
                    }}
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="floating-shape"
                    style={{
                        width: 150,
                        height: 150,
                        background: '#88D8C0',
                        bottom: '20%',
                        right: '15%',
                    }}
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div className="hero-content" style={{ opacity }}>
                <motion.div
                    className="hero-logo-container"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <motion.img
                        src="/logo.jpg"
                        alt="AROHA Music"
                        className="hero-logo"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05 }}
                    />
                </motion.div>

                <motion.h1
                    className="hero-title"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    <span className="title-line">Live Music</span>
                    <motion.span
                        className="title-line accent"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        Unforgettable Moments
                    </motion.span>
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    Bringing soul to every stage — Hotels • Bars • Clubs • Events
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <motion.button
                        className="btn btn-primary"
                        onClick={scrollToContact}
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Book Us Now</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={scrollToMusic}
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Listen</span>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </motion.button>
                </motion.div>
            </motion.div>

            <motion.div
                className="scroll-indicator"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
            >
                <span>Scroll to explore</span>
                <div className="scroll-arrow"></div>
            </motion.div>
        </section>
    )
}

export default Hero
