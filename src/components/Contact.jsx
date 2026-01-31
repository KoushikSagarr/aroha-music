import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const Contact = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset after showing success
        setTimeout(() => {
            setIsSubmitted(false)
            setFormState({ name: '', email: '', phone: '', eventType: '', message: '' })
        }, 3000)
    }

    return (
        <section className="contact" id="contact" ref={ref}>
            <div className="container">
                <div className="contact-wrapper">
                    <motion.div
                        className="contact-info"
                        initial={{ x: -50, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 1 }}
                    >
                        <div className="section-header">
                            <span className="section-tag">Get In Touch</span>
                            <h2 className="section-title">Book AROHA</h2>
                        </div>
                        <p className="contact-lead">
                            Ready to make your event unforgettable? Let&apos;s talk about how AROHA can bring
                            the perfect vibe to your venue or occasion.
                        </p>

                        <div className="contact-details">
                            <motion.div
                                className="contact-item"
                                initial={{ x: -30, opacity: 0 }}
                                animate={isInView ? { x: 0, opacity: 1 } : {}}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="contact-label">Email Us</span>
                                    <a href="mailto:book@arohamusic.com" className="contact-value">
                                        book@arohamusic.com
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div
                                className="contact-item"
                                initial={{ x: -30, opacity: 0 }}
                                animate={isInView ? { x: 0, opacity: 1 } : {}}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="contact-label">Call Us</span>
                                    <a href="tel:+919999999999" className="contact-value">
                                        +91 99999 99999
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            className="social-follow"
                            initial={{ y: 30, opacity: 0 }}
                            animate={isInView ? { y: 0, opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            <span>Follow us</span>
                            <div className="social-icons">
                                {['instagram', 'facebook', 'youtube', 'spotify'].map((platform) => (
                                    <motion.a
                                        key={platform}
                                        href="#"
                                        className="social-icon"
                                        aria-label={platform}
                                        whileHover={{ y: -3, scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {platform === 'instagram' && (
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                        )}
                                        {platform === 'facebook' && (
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                            </svg>
                                        )}
                                        {platform === 'youtube' && (
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                            </svg>
                                        )}
                                        {platform === 'spotify' && (
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                        )}
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="contact-form-wrapper"
                        initial={{ x: 50, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    placeholder=" "
                                    value={formState.name}
                                    onChange={handleChange}
                                />
                                <label htmlFor="name">Your Name</label>
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    placeholder=" "
                                    value={formState.email}
                                    onChange={handleChange}
                                />
                                <label htmlFor="email">Email Address</label>
                            </div>
                            <div className="form-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    placeholder=" "
                                    value={formState.phone}
                                    onChange={handleChange}
                                />
                                <label htmlFor="phone">Phone Number</label>
                            </div>
                            <div className="form-group">
                                <select
                                    name="eventType"
                                    id="eventType"
                                    required
                                    value={formState.eventType}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled></option>
                                    <option value="hotel">Hotel Event</option>
                                    <option value="bar">Bar/Pub</option>
                                    <option value="club">Club Night</option>
                                    <option value="college">College Fest</option>
                                    <option value="private">Private Event</option>
                                    <option value="other">Other</option>
                                </select>
                                <label htmlFor="eventType">Event Type</label>
                            </div>
                            <div className="form-group full-width">
                                <textarea
                                    name="message"
                                    id="message"
                                    rows="4"
                                    required
                                    placeholder=" "
                                    value={formState.message}
                                    onChange={handleChange}
                                ></textarea>
                                <label htmlFor="message">Tell us about your event</label>
                            </div>
                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-submit"
                                disabled={isSubmitting || isSubmitted}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: isSubmitted
                                        ? 'linear-gradient(135deg, #88D8C0 0%, #7ECEC5 100%)'
                                        : undefined,
                                }}
                            >
                                <span>
                                    {isSubmitting ? 'Sending...' : isSubmitted ? 'Message Sent!' : 'Send Inquiry'}
                                </span>
                                {!isSubmitting && !isSubmitted && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                    </svg>
                                )}
                                {isSubmitted && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Contact
