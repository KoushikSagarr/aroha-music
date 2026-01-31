import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const AnimatedCounter = ({ target, suffix = '+' }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (isInView) {
            const duration = 2000
            const steps = 60
            const increment = target / steps
            let current = 0

            const timer = setInterval(() => {
                current += increment
                if (current >= target) {
                    setCount(target)
                    clearInterval(timer)
                } else {
                    setCount(Math.floor(current))
                }
            }, duration / steps)

            return () => clearInterval(timer)
        }
    }, [isInView, target])

    return (
        <span ref={ref}>
            {count}
            <span className="stat-plus">{suffix}</span>
        </span>
    )
}

const About = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: 'easeOut' }
        }
    }

    const waveDelays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    const waveHeights = [20, 40, 60, 80, 50, 70, 45, 65, 35, 25]

    return (
        <section className="about" id="about" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-tag">Our Story</span>
                    <h2 className="section-title">About AROHA</h2>
                </motion.div>

                <div className="about-content">
                    <motion.div
                        className="about-text"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        <motion.p className="about-lead" variants={itemVariants}>
                            <span className="highlight">AROHA</span> isn&apos;t just a band — we&apos;re an experience.
                            Born from a shared passion for music and live performance, we bring energy,
                            soul, and unforgettable vibes to every venue we play.
                        </motion.p>
                        <motion.p variants={itemVariants}>
                            From intimate hotel lounges to electrifying club nights, cozy bar sessions
                            to grand college festivals — we adapt our sound to create the perfect atmosphere
                            for any occasion. Our setlist spans genres, eras, and moods, ensuring every
                            audience finds something to love.
                        </motion.p>

                        <motion.div className="about-stats" variants={itemVariants}>
                            <motion.div
                                className="stat"
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <span className="stat-number">
                                    <AnimatedCounter target={500} suffix="+" />
                                </span>
                                <span className="stat-label">Live Shows</span>
                            </motion.div>
                            <motion.div
                                className="stat"
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <span className="stat-number">
                                    <AnimatedCounter target={50} suffix="+" />
                                </span>
                                <span className="stat-label">Venues</span>
                            </motion.div>
                            <motion.div
                                className="stat"
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <span className="stat-number">
                                    <AnimatedCounter target={100} suffix="K+" />
                                </span>
                                <span className="stat-label">Happy Fans</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="about-visual"
                        initial={{ x: 50, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <motion.div
                            className="visual-card"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="visual-content">
                                <div className="music-wave">
                                    {waveDelays.map((delay, i) => (
                                        <motion.span
                                            key={i}
                                            style={{ height: waveHeights[i] }}
                                            animate={{
                                                scaleY: [0.5, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: delay
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="visual-text">Feel the rhythm</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default About
