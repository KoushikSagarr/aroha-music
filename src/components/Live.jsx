import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { addSongRequest } from '../services/songService'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import upiQrImg from '../assets/upi-qr.jpg'

const tipAmounts = [
    { value: 50, label: '₹50' },
    { value: 100, label: '₹100' },
    { value: 200, label: '₹200' },
    { value: 500, label: '₹500' },
]

// Rate limiting constants
const MAX_REQUESTS_PER_HOUR = 5
const RATE_LIMIT_KEY = 'aroha_song_requests'

// Rate limiting helper functions
const getRequestHistory = () => {
    try {
        const data = localStorage.getItem(RATE_LIMIT_KEY)
        if (!data) return []
        return JSON.parse(data)
    } catch {
        return []
    }
}

const cleanOldRequests = (requests) => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    return requests.filter(timestamp => timestamp > oneHourAgo)
}

const addRequestToHistory = () => {
    const requests = cleanOldRequests(getRequestHistory())
    requests.push(Date.now())
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(requests))
}

const canMakeRequest = () => {
    const requests = cleanOldRequests(getRequestHistory())
    return requests.length < MAX_REQUESTS_PER_HOUR
}

const getRemainingRequests = () => {
    const requests = cleanOldRequests(getRequestHistory())
    return Math.max(0, MAX_REQUESTS_PER_HOUR - requests.length)
}

// Debounce helper
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(handler)
    }, [value, delay])

    return debouncedValue
}

const Live = () => {
    const ref = useRef(null)
    const searchContainerRef = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    // Song Request State
    const [songQuery, setSongQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [selectedSong, setSelectedSong] = useState(null)
    const [fanName, setFanName] = useState('')
    const [isRequesting, setIsRequesting] = useState(false)
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [remainingRequests, setRemainingRequests] = useState(getRemainingRequests())
    const [rateLimitError, setRateLimitError] = useState(false)
    const [isLive, setIsLive] = useState(true) // Default to true, will update from Firestore
    const [notLiveError, setNotLiveError] = useState(false)

    // Tip State
    const [selectedTip, setSelectedTip] = useState(null)
    const [customTip, setCustomTip] = useState('')
    const [showQR, setShowQR] = useState(false)

    // Subscribe to live status from Firestore
    useEffect(() => {
        const settingsRef = doc(db, 'settings', 'live')
        const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setIsLive(snapshot.data().isLive || false)
            }
        })
        return () => unsubscribe()
    }, [])

    // Debounce search query - fast response
    const debouncedQuery = useDebounce(songQuery, 200)

    // Search songs using iTunes API
    const searchSongs = useCallback(async (query) => {
        if (query.length < 2) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        setIsSearching(true)

        try {
            // iTunes Search API - works without API key
            // Searches across all languages including Hindi, Telugu, English
            const response = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=10`
            )

            if (!response.ok) throw new Error('Search failed')

            const data = await response.json()

            // Transform iTunes results to our format
            const songs = data.results.map((track, index) => ({
                id: track.trackId || index,
                title: track.trackName,
                artist: track.artistName,
                album: track.collectionName || 'Single',
                artwork: track.artworkUrl100?.replace('100x100', '200x200'),
                previewUrl: track.previewUrl,
                year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : '',
            }))

            setSuggestions(songs)
            setShowDropdown(songs.length > 0)
        } catch (error) {
            console.error('Song search error:', error)
            setSuggestions([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    // Trigger search when debounced query changes
    useEffect(() => {
        if (debouncedQuery && !selectedSong) {
            searchSongs(debouncedQuery)
        }
    }, [debouncedQuery, selectedSong, searchSongs])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener('touchstart', handleClickOutside)
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('touchstart', handleClickOutside)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleSongSelect = (song) => {
        setSelectedSong(song)
        setSongQuery(`${song.title} - ${song.artist}`)
        setShowDropdown(false)
    }

    const handleSongRequest = async (e) => {
        e.preventDefault()
        if (!selectedSong && !songQuery) return

        // Check if band is live
        if (!isLive) {
            setNotLiveError(true)
            setTimeout(() => setNotLiveError(false), 5000)
            return
        }

        // Check rate limit
        if (!canMakeRequest()) {
            setRateLimitError(true)
            setTimeout(() => setRateLimitError(false), 5000)
            return
        }

        setIsRequesting(true)

        try {
            // Add request to Firebase for backstage dashboard
            await addSongRequest({
                song: selectedSong?.title || songQuery,
                artist: selectedSong?.artist || 'Custom Request',
                album: selectedSong?.album || '',
                artwork: selectedSong?.artwork || null,
                fanName: fanName || 'Anonymous',
            })

            // Track request for rate limiting
            addRequestToHistory()
            setRemainingRequests(getRemainingRequests())

            setIsRequesting(false)
            setRequestSuccess(true)

            // Reset after showing success
            setTimeout(() => {
                setRequestSuccess(false)
                setSongQuery('')
                setSelectedSong(null)
                setFanName('')
            }, 3000)
        } catch (error) {
            console.error('Error submitting request:', error)
            setIsRequesting(false)
            alert('Failed to submit request. Please try again.')
        }
    }

    const handleTipSelect = (amount) => {
        setSelectedTip(amount)
        setCustomTip('')
    }

    const handleRazorpayTip = () => {
        const tipAmount = selectedTip || parseInt(customTip) || 100

        // Razorpay integration - placeholder for now
        // You'll need to add your Razorpay Key ID here
        const options = {
            key: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
            amount: tipAmount * 100, // Razorpay works in paise
            currency: 'INR',
            name: 'AROHA Music',
            description: 'Tip for the Band',
            image: '/logo.jpg',
            handler: function (response) {
                alert('Thank you for your generous tip! 🎸')
                console.log('Payment ID:', response.razorpay_payment_id)
            },
            prefill: {
                name: fanName || 'Music Lover',
            },
            theme: {
                color: '#E8A87C',
            },
        }

        // Check if Razorpay is loaded
        if (window.Razorpay) {
            const rzp = new window.Razorpay(options)
            rzp.open()
        } else {
            alert('Payment gateway is loading. Please try again in a moment.')
        }
    }

    return (
        <section className="live" id="live" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header center"
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-tag">🎤 We're Live!</span>
                    <h2 className="section-title">Join The Party</h2>
                    <p className="section-subtitle">Request any song from millions across Hindi, English, Telugu & more</p>
                </motion.div>

                <div className="live-grid">
                    {/* Song Request Section */}
                    <motion.div
                        className="live-card song-request-card"
                        initial={{ x: -50, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="card-header">
                            <div className="card-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
                                </svg>
                            </div>
                            <h3>Request a Song</h3>
                        </div>

                        <p className="card-desc">
                            Search any song — Bollywood, Hollywood, Telugu, Tamil, Punjabi & more!
                        </p>

                        <form onSubmit={handleSongRequest} className="song-request-form">
                            <div className="search-container" ref={searchContainerRef}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={songQuery}
                                        onChange={(e) => {
                                            setSongQuery(e.target.value)
                                            setSelectedSong(null)
                                        }}
                                        placeholder="Search for any song..."
                                        className="song-search-input"
                                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                    />
                                    <div className="search-icon">
                                        {isSearching ? (
                                            <span className="search-spinner"></span>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {showDropdown && suggestions.length > 0 && (
                                            <motion.div
                                                className="suggestions-dropdown"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                {suggestions.map((song) => (
                                                    <motion.button
                                                        type="button"
                                                        key={song.id}
                                                        className="suggestion-item"
                                                        onClick={() => handleSongSelect(song)}
                                                        whileHover={{ backgroundColor: 'rgba(232, 168, 124, 0.1)' }}
                                                    >
                                                        {song.artwork && (
                                                            <img
                                                                src={song.artwork}
                                                                alt={song.title}
                                                                className="suggestion-artwork"
                                                            />
                                                        )}
                                                        <div className="suggestion-info">
                                                            <span className="suggestion-title">{song.title}</span>
                                                            <span className="suggestion-meta">
                                                                {song.artist} {song.album !== 'Single' && `• ${song.album}`} {song.year && `(${song.year})`}
                                                            </span>
                                                        </div>
                                                        <span className="suggestion-arrow">→</span>
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={fanName}
                                    onChange={(e) => setFanName(e.target.value)}
                                    placeholder="Your name (optional)"
                                    className="fan-name-input"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary request-btn"
                                disabled={isRequesting || requestSuccess || !songQuery}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: requestSuccess
                                        ? 'linear-gradient(135deg, #88D8C0 0%, #7ECEC5 100%)'
                                        : undefined
                                }}
                            >
                                {isRequesting ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Sending...</span>
                                    </>
                                ) : requestSuccess ? (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        <span>Request Sent!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Request Song</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                        </svg>
                                    </>
                                )}
                            </motion.button>

                            {/* Rate limit info */}
                            <div className="rate-limit-info">
                                {notLiveError ? (
                                    <motion.p
                                        className="rate-limit-error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        🎸 We're not live currently! Check back during our next show.
                                    </motion.p>
                                ) : rateLimitError ? (
                                    <motion.p
                                        className="rate-limit-error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        ⏳ You've reached the limit! Try again in an hour.
                                    </motion.p>
                                ) : !isLive ? (
                                    <p className="rate-limit-count" style={{ color: '#e74c3c' }}>
                                        🔴 Band is currently offline
                                    </p>
                                ) : (
                                    <p className="rate-limit-count">
                                        {remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining this hour
                                    </p>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Tip the Band Section */}
                    <motion.div
                        className="live-card tip-card"
                        initial={{ x: 50, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="card-header">
                            <div className="card-icon tip-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <h3>Tip the Band</h3>
                        </div>

                        <p className="card-desc">
                            Loving the vibe? Show your appreciation with a tip! 💖
                        </p>

                        <div className="tip-amounts">
                            {tipAmounts.map((tip) => (
                                <motion.button
                                    key={tip.value}
                                    type="button"
                                    className={`tip-amount-btn ${selectedTip === tip.value ? 'selected' : ''}`}
                                    onClick={() => handleTipSelect(tip.value)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {tip.label}
                                </motion.button>
                            ))}
                        </div>

                        <div className="custom-tip">
                            <span className="currency">₹</span>
                            <input
                                type="number"
                                value={customTip}
                                onChange={(e) => {
                                    setCustomTip(e.target.value)
                                    setSelectedTip(null)
                                }}
                                placeholder="Custom amount"
                                min="10"
                            />
                        </div>

                        <div className="tip-actions">
                            <motion.button
                                className="btn btn-primary tip-btn"
                                onClick={handleRazorpayTip}
                                disabled={!selectedTip && !customTip}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <path d="M1 10h22" />
                                </svg>
                                <span>Pay with Razorpay</span>
                            </motion.button>

                            <motion.button
                                className="btn btn-secondary qr-btn"
                                onClick={() => setShowQR(!showQR)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                                <span>{showQR ? 'Hide QR' : 'UPI QR Code'}</span>
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showQR && (
                                <motion.div
                                    className="qr-section"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="qr-container">
                                        <div className="qr-box">
                                            <img
                                                src={upiQrImg}
                                                alt="Tip via UPI"
                                                className="upi-qr-image"
                                            />
                                        </div>
                                        <div className="upi-details">
                                            <p className="upi-label">UPI ID:</p>
                                            <div className="upi-id-box">
                                                <span className="upi-id">9182719956@pthdfc</span>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('9182719956@pthdfc')
                                                        alert('UPI ID copied to clipboard!')
                                                    }}
                                                    aria-label="Copy UPI ID"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Admin Access Link */}
                <motion.div
                    className="admin-access"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <a href="#admin" className="admin-link">
                        <span>🎸</span>
                        <span>Band Member?</span>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

export default Live
