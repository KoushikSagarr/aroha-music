import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

// EmailJS Configuration - Replace these with your actual values
// Get them from https://www.emailjs.com/
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'  // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID' // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'   // Replace with your EmailJS public key

const Contact = () => {
    const ref = useRef(null)
    const formRef = useRef(null)
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
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            // EmailJS template parameters
            const templateParams = {
                from_name: formState.name,
                from_email: formState.email,
                phone: formState.phone || 'Not provided',
                event_type: formState.eventType,
                message: formState.message,
                to_email: 'band@arohamusic.com', // Replace with actual band email
            }

            // Check if EmailJS is properly configured
            if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
                // Fallback: simulate success for demo
                console.log('EmailJS not configured. Form data:', templateParams)
                await new Promise((resolve) => setTimeout(resolve, 1500))
            } else {
                // Send email via EmailJS
                await emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    templateParams,
                    EMAILJS_PUBLIC_KEY
                )
            }

            setIsSubmitting(false)
            setIsSubmitted(true)

            // Reset after showing success
            setTimeout(() => {
                setIsSubmitted(false)
                setFormState({ name: '', email: '', phone: '', eventType: '', message: '' })
            }, 3000)
        } catch (err) {
            console.error('Email send error:', err)
            setIsSubmitting(false)
            setError('Failed to send message. Please try again or email us directly.')
        }
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
                                    <a href="mailto:aroha.music1@gmail.com" className="contact-value">
                                        aroha.music1@gmail.com
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
                                <div className="contact-stack">
                                    <span className="contact-label">Call Us</span>
                                    <div className="phone-numbers">
                                        <a href="tel:+919182719956" className="contact-value">
                                            +91 91827 19956
                                        </a>
                                        <a href="tel:+916304245679" className="contact-value">
                                            +91 63042 45679
                                        </a>
                                    </div>
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
                                <motion.a
                                    href="https://www.instagram.com/aroha_music_/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon"
                                    aria-label="instagram"
                                    whileHover={{ y: -3, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </motion.a>
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
