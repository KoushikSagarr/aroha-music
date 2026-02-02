import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import {
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    addDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    setDoc
} from 'firebase/firestore'
import CustomCursor from './CustomCursor'

// Admin credentials - change these!
const ADMIN_CREDENTIALS = {
    username: 'aroha',
    password: 'music2024'
}

const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [activeTab, setActiveTab] = useState('requests')

    // Requests state
    const [requests, setRequests] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [loading, setLoading] = useState(true)

    // Gallery state
    const [photos, setPhotos] = useState([])
    const [uploading, setUploading] = useState(false)
    const [photoCaption, setPhotoCaption] = useState('')
    const fileInputRef = useRef(null)

    // Events state
    const [events, setEvents] = useState([])
    const [showEventForm, setShowEventForm] = useState(false)
    const [eventForm, setEventForm] = useState({
        title: '',
        venue: '',
        date: '',
        time: '',
        description: ''
    })
    const [editingEventId, setEditingEventId] = useState(null)

    // Venue autocomplete state
    const [venueSuggestions, setVenueSuggestions] = useState([])
    const [venueLoading, setVenueLoading] = useState(false)
    const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
    const venueTimeoutRef = useRef(null)

    // Live mode state
    const [isLive, setIsLive] = useState(false)

    // Check if already logged in
    useEffect(() => {
        const session = sessionStorage.getItem('aroha_admin')
        if (session === 'true') {
            setIsLoggedIn(true)
        }
    }, [])

    // Subscribe to live status
    useEffect(() => {
        const settingsRef = doc(db, 'settings', 'live')
        const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setIsLive(snapshot.data().isLive || false)
            }
        }, (error) => {
            console.error('Live status subscription error:', error)
        })
        return () => unsubscribe()
    }, [])

    // Subscribe to requests
    useEffect(() => {
        if (!isLoggedIn) return
        const requestsRef = collection(db, 'songRequests')
        const q = query(requestsRef, orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }))
            setRequests(reqs)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [isLoggedIn])

    // Subscribe to photos
    useEffect(() => {
        if (!isLoggedIn) return
        const photosRef = collection(db, 'photos')
        const q = query(photosRef, orderBy('uploadedAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photoData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPhotos(photoData)
        })
        return () => unsubscribe()
    }, [isLoggedIn])

    // Subscribe to events
    useEffect(() => {
        if (!isLoggedIn) return
        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, orderBy('date', 'asc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date()
            }))
            setEvents(eventData)
        })
        return () => unsubscribe()
    }, [isLoggedIn])

    const handleLogin = (e) => {
        e.preventDefault()
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            setIsLoggedIn(true)
            sessionStorage.setItem('aroha_admin', 'true')
            setLoginError('')
        } else {
            setLoginError('Invalid credentials')
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('aroha_admin')
        window.location.href = window.location.origin
    }

    const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'songRequests', id), { status })
        setSelectedId(null)
    }

    const deleteRequest = async (id) => {
        await deleteDoc(doc(db, 'songRequests', id))
        setSelectedId(null)
    }

    // Toggle live mode
    const toggleLive = async () => {
        try {
            await setDoc(doc(db, 'settings', 'live'), { isLive: !isLive })
        } catch (error) {
            console.error('Error toggling live mode:', error)
            alert('Failed to toggle live mode')
        }
    }

    // Photo upload using base64 (stored in Firestore directly)
    // Includes compression for larger images
    const compressImage = (file, maxSizeKB = 800) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let { width, height } = img

                    // Calculate new dimensions (max 1920px on longest side)
                    const maxDimension = 1920
                    if (width > height && width > maxDimension) {
                        height = (height * maxDimension) / width
                        width = maxDimension
                    } else if (height > maxDimension) {
                        width = (width * maxDimension) / height
                        height = maxDimension
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Compress with quality adjustment
                    let quality = 0.8
                    let result = canvas.toDataURL('image/jpeg', quality)

                    // Reduce quality until under size limit
                    while (result.length > maxSizeKB * 1024 && quality > 0.3) {
                        quality -= 0.1
                        result = canvas.toDataURL('image/jpeg', quality)
                    }

                    resolve(result)
                }
                img.onerror = reject
                img.src = e.target.result
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Check file size (max 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
            alert('Photo must be under 5MB')
            return
        }

        setUploading(true)
        try {
            // Compress image to fit Firestore limits
            const compressedImage = await compressImage(file)

            await addDoc(collection(db, 'photos'), {
                url: compressedImage,
                caption: photoCaption || '',
                uploadedAt: serverTimestamp()
            })

            setPhotoCaption('')
            fileInputRef.current.value = ''
            setUploading(false)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload photo: ' + error.message)
            setUploading(false)
        }
    }

    const deletePhoto = async (photo) => {
        if (!confirm('Delete this photo?')) return
        await deleteDoc(doc(db, 'photos', photo.id))
    }

    // Venue search using OpenStreetMap Nominatim API
    const searchVenues = async (query) => {
        if (query.length < 3) {
            setVenueSuggestions([])
            setShowVenueSuggestions(false)
            return
        }

        setVenueLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
            )
            const data = await response.json()
            setVenueSuggestions(data.map(item => ({
                name: item.display_name,
                shortName: item.display_name.split(',').slice(0, 3).join(', ')
            })))
            setShowVenueSuggestions(true)
        } catch (error) {
            console.error('Venue search error:', error)
        }
        setVenueLoading(false)
    }

    const handleVenueChange = (value) => {
        setEventForm({ ...eventForm, venue: value })

        // Debounce venue search
        if (venueTimeoutRef.current) {
            clearTimeout(venueTimeoutRef.current)
        }
        venueTimeoutRef.current = setTimeout(() => {
            searchVenues(value)
        }, 300)
    }

    const handleVenueSelect = (venue) => {
        setEventForm({ ...eventForm, venue: venue.shortName })
        setShowVenueSuggestions(false)
        setVenueSuggestions([])
    }

    // Event management
    const handleEventSubmit = async (e) => {
        e.preventDefault()
        try {
            // Convert 24h time format to 12h format for display
            let displayTime = eventForm.time
            if (eventForm.time) {
                const [hours, minutes] = eventForm.time.split(':')
                const hour = parseInt(hours)
                const ampm = hour >= 12 ? 'PM' : 'AM'
                const hour12 = hour % 12 || 12
                displayTime = `${hour12}:${minutes} ${ampm}`
            }

            const eventData = {
                title: eventForm.title,
                venue: eventForm.venue,
                time: displayTime,
                description: eventForm.description,
                date: Timestamp.fromDate(new Date(eventForm.date))
            }

            if (editingEventId) {
                await updateDoc(doc(db, 'events', editingEventId), eventData)
            } else {
                await addDoc(collection(db, 'events'), {
                    ...eventData,
                    createdAt: serverTimestamp()
                })
            }

            setEventForm({ title: '', venue: '', date: '', time: '', description: '' })
            setShowEventForm(false)
            setEditingEventId(null)
            setVenueSuggestions([])
        } catch (error) {
            console.error('Event error:', error)
            alert('Failed to save event: ' + error.message)
        }
    }

    const editEvent = (event) => {
        setEventForm({
            title: event.title,
            venue: event.venue,
            date: event.date.toISOString().split('T')[0],
            time: event.time || '',
            description: event.description || ''
        })
        setEditingEventId(event.id)
        setShowEventForm(true)
    }

    const deleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return
        await deleteDoc(doc(db, 'events', id))
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length

    // Login Screen
    if (!isLoggedIn) {
        return (
            <div className="admin-page">
                <CustomCursor />
                <motion.div
                    className="login-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="login-header">
                        <span className="login-icon">🎸</span>
                        <h1>AROHA Admin</h1>
                        <p>Enter credentials to access dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                autoComplete="username"
                            />
                        </div>

                        <div className="login-field">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                autoComplete="current-password"
                            />
                        </div>

                        {loginError && (
                            <motion.div
                                className="login-error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {loginError}
                            </motion.div>
                        )}

                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    // Admin Dashboard
    return (
        <div className="admin-page">
            <CustomCursor />

            {/* Header */}
            <div className="admin-header">
                <div className="admin-title">
                    <h1>🎸 AROHA Dashboard</h1>
                </div>
                <div className="admin-header-controls">
                    <div className={`live-toggle ${isLive ? 'is-live' : ''}`} onClick={toggleLive}>
                        <span className="live-indicator">{isLive ? '🔴 LIVE' : '⚪ OFFLINE'}</span>
                        <div className="toggle-switch">
                            <div className="toggle-slider"></div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    🎤 Requests {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
                </button>
                <button
                    className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gallery')}
                >
                    📸 Gallery
                </button>
                <button
                    className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    📅 Events
                </button>
            </div>

            {/* Tab Content */}
            <div className="admin-content">
                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="admin-requests">
                        {loading ? (
                            <div className="admin-loading">
                                <span className="loading-spinner">🎵</span>
                                <p>Loading requests...</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {requests.length === 0 ? (
                                    <motion.div
                                        className="admin-empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <span>🎵</span>
                                        <p>No song requests yet</p>
                                        <span className="hint">Requests from fans will appear here</span>
                                    </motion.div>
                                ) : (
                                    requests.map((request) => (
                                        <motion.div
                                            key={request.id}
                                            className={`admin-request-card ${request.status} ${selectedId === request.id ? 'expanded' : ''}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            onClick={() => setSelectedId(selectedId === request.id ? null : request.id)}
                                            layout
                                        >
                                            <div className="request-content">
                                                <div className="request-status-dot"></div>
                                                {request.artwork && (
                                                    <img src={request.artwork} alt="" className="request-art" />
                                                )}
                                                <div className="request-text">
                                                    <span className="song-title">{request.song}</span>
                                                    <span className="song-artist">{request.artist}</span>
                                                </div>
                                                {request.fanName && request.fanName !== 'Anonymous' && (
                                                    <span className="requester">by {request.fanName}</span>
                                                )}
                                                <span className="tap-hint">Tap</span>
                                            </div>

                                            <AnimatePresence>
                                                {selectedId === request.id && (
                                                    <motion.div
                                                        className="request-options"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                    >
                                                        {request.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    className="option-btn playing"
                                                                    onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'playing') }}
                                                                >
                                                                    🎵 Now Playing
                                                                </button>
                                                                <button
                                                                    className="option-btn done"
                                                                    onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'played') }}
                                                                >
                                                                    ✅ Done
                                                                </button>
                                                            </>
                                                        )}
                                                        {request.status === 'playing' && (
                                                            <button
                                                                className="option-btn done"
                                                                onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'played') }}
                                                            >
                                                                ✅ Finished
                                                            </button>
                                                        )}
                                                        {request.status === 'played' && (
                                                            <button
                                                                className="option-btn pending"
                                                                onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'pending') }}
                                                            >
                                                                🔄 Replay
                                                            </button>
                                                        )}
                                                        <button
                                                            className="option-btn delete"
                                                            onClick={(e) => { e.stopPropagation(); deleteRequest(request.id) }}
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="admin-gallery">
                        <div className="upload-section">
                            <h3>📸 Upload Photo</h3>
                            <input
                                type="text"
                                placeholder="Caption (e.g., Friday Night at The Blue Room)"
                                value={photoCaption}
                                onChange={(e) => setPhotoCaption(e.target.value)}
                                className="caption-input"
                            />
                            <div className="upload-row">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    ref={fileInputRef}
                                    className="file-input"
                                />
                                {uploading && <span className="uploading-text">Uploading...</span>}
                            </div>
                        </div>

                        <div className="gallery-admin-grid">
                            {photos.length === 0 ? (
                                <div className="admin-empty">
                                    <span>📷</span>
                                    <p>No photos yet</p>
                                </div>
                            ) : (
                                photos.map(photo => (
                                    <div key={photo.id} className="gallery-admin-item">
                                        <img src={photo.url} alt={photo.caption || ''} />
                                        {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                                        <button
                                            className="delete-photo-btn"
                                            onClick={() => deletePhoto(photo)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="admin-events">
                        <button
                            className="add-event-btn"
                            onClick={() => {
                                setShowEventForm(!showEventForm)
                                setEditingEventId(null)
                                setEventForm({ title: '', venue: '', date: '', time: '', description: '' })
                            }}
                        >
                            {showEventForm ? '✕ Cancel' : '+ Add Event'}
                        </button>

                        {showEventForm && (
                            <motion.form
                                className="event-form"
                                onSubmit={handleEventSubmit}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Event Title"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    required
                                />
                                <div className="venue-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Start typing venue/location..."
                                        value={eventForm.venue}
                                        onChange={(e) => handleVenueChange(e.target.value)}
                                        onFocus={() => eventForm.venue.length >= 3 && setShowVenueSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 200)}
                                        required
                                    />
                                    {venueLoading && <span className="venue-loading">⏳</span>}
                                    {showVenueSuggestions && venueSuggestions.length > 0 && (
                                        <div className="venue-suggestions">
                                            {venueSuggestions.map((venue, idx) => (
                                                <div
                                                    key={idx}
                                                    className="venue-suggestion-item"
                                                    onClick={() => handleVenueSelect(venue)}
                                                >
                                                    📍 {venue.shortName}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-row">
                                    <div className="input-with-label">
                                        <label>📅 Date</label>
                                        <input
                                            type="date"
                                            value={eventForm.date}
                                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-with-label">
                                        <label>🕐 Time</label>
                                        <input
                                            type="time"
                                            value={eventForm.time}
                                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Description (optional)"
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                />
                                <button type="submit" className="save-event-btn">
                                    {editingEventId ? 'Update Event' : 'Add Event'}
                                </button>
                            </motion.form>
                        )}

                        <div className="events-admin-list">
                            {events.length === 0 ? (
                                <div className="admin-empty">
                                    <span>📅</span>
                                    <p>No events yet</p>
                                </div>
                            ) : (
                                events.map(event => (
                                    <div key={event.id} className="event-admin-card">
                                        <div className="event-admin-info">
                                            <strong>{event.title}</strong>
                                            <span>📍 {event.venue}</span>
                                            <span>📅 {event.date.toLocaleDateString()} {event.time && `• 🕐 ${event.time}`}</span>
                                            {event.description && <p>{event.description}</p>}
                                        </div>
                                        <div className="event-admin-actions">
                                            <button onClick={() => editEvent(event)}>✏️</button>
                                            <button onClick={() => deleteEvent(event.id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="admin-footer">
                <span>🟢 Live sync enabled</span>
            </div>
        </div>
    )
}

export default AdminPage
