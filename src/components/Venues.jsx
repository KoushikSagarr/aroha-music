import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const venues = [
    {
        id: 1,
        title: 'Hotels',
        desc: 'Elegant performances for lobby lounges, restaurants, and special events',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        id: 2,
        title: 'Bars',
        desc: 'Cozy vibes and acoustic sets that keep the spirits high',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 11V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8m5-7v10m0-10l4 3m-4-3l-4 3" />
                <circle cx="17" cy="18" r="3" />
            </svg>
        ),
    },
    {
        id: 3,
        title: 'Clubs',
        desc: 'High-energy performances that get everyone on the dance floor',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
            </svg>
        ),
    },
    {
        id: 4,
        title: 'Airports',
        desc: 'Making travel experiences memorable with live entertainment',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                <path d="M14.5 2a8.38 8.38 0 0 1 5.5 2m-2.5-2A5.5 5.5 0 0 1 22 6.5" />
            </svg>
        ),
    },
    {
        id: 5,
        title: 'Colleges',
        desc: 'Bringing the party to campus fests and college events',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        ),
    },
    {
        id: 6,
        title: 'Private Events',
        desc: 'Weddings, birthdays, corporate events — we make it special',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        special: true,
    },
]

const Venues = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section className="venues" id="venues" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header center"
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-tag">Our Stages</span>
                    <h2 className="section-title">Where We Perform</h2>
                    <p className="section-subtitle">From intimate venues to grand stages</p>
                </motion.div>

                <div className="venues-grid">
                    {venues.map((venue, index) => (
                        <motion.div
                            key={venue.id}
                            className={`venue-card ${venue.special ? 'special' : ''}`}
                            initial={{ y: 40, opacity: 0 }}
                            animate={isInView ? { y: 0, opacity: 1 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                            whileHover={{ y: -10, scale: 1.02 }}
                        >
                            <div className="venue-icon">{venue.icon}</div>
                            <h3 className="venue-title">{venue.title}</h3>
                            <p className="venue-desc">{venue.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Venues
