import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

const Events = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch events from Firestore and filter future events client-side
    useEffect(() => {
        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, orderBy('date', 'asc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date()
            now.setHours(0, 0, 0, 0) // Start of today

            const eventData = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate() || new Date()
                }))
                .filter(event => event.date >= now) // Filter future events

            setEvents(eventData)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching events:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date)
    }

    const formatTime = (time) => {
        if (!time) return ''
        return time
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <section className="events" id="events" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-tag">📅 Upcoming Shows</span>
                    <h2 className="section-title">Event Calendar</h2>
                    <p className="section-subtitle">
                        Catch us live at these upcoming venues
                    </p>
                </motion.div>

                {loading ? (
                    <div className="events-loading">
                        <span className="loading-emoji">🎸</span>
                        <p>Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <motion.div
                        className="events-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="empty-icon">🗓️</span>
                        <p>No upcoming events</p>
                        <span className="empty-hint">Stay tuned for our next show announcement!</span>
                    </motion.div>
                ) : (
                    <motion.div
                        className="events-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                    >
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                className="event-card"
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                            >
                                <div className="event-date-box">
                                    <span className="event-day">
                                        {event.date.getDate()}
                                    </span>
                                    <span className="event-month">
                                        {event.date.toLocaleString('en', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="event-details">
                                    <h3 className="event-title">{event.title}</h3>
                                    <div className="event-meta">
                                        <span className="event-venue">
                                            📍 {event.venue}
                                        </span>
                                        {event.time && (
                                            <span className="event-time">
                                                🕐 {formatTime(event.time)}
                                            </span>
                                        )}
                                    </div>
                                    {event.description && (
                                        <p className="event-description">{event.description}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    )
}

export default Events
