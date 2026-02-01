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
    Timestamp
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

    // Check if already logged in
    useEffect(() => {
        const session = sessionStorage.getItem('aroha_admin')
        if (session === 'true') {
            setIsLoggedIn(true)
        }
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

    // Photo upload using base64 (stored in Firestore directly)
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Check file size (max 1MB for Firestore)
        if (file.size > 1024 * 1024) {
            alert('Photo must be under 1MB. Please compress or resize the image.')
            return
        }

        setUploading(true)
        try {
            // Convert to base64
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Data = reader.result

                await addDoc(collection(db, 'photos'), {
                    url: base64Data,
                    caption: photoCaption || '',
                    uploadedAt: serverTimestamp()
                })

                setPhotoCaption('')
                fileInputRef.current.value = ''
                setUploading(false)
            }
            reader.onerror = () => {
                alert('Failed to read file')
                setUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload photo')
            setUploading(false)
        }
    }

    const deletePhoto = async (photo) => {
        if (!confirm('Delete this photo?')) return
        await deleteDoc(doc(db, 'photos', photo.id))
    }

    // Event management
    const handleEventSubmit = async (e) => {
        e.preventDefault()
        try {
            const eventData = {
                title: eventForm.title,
                venue: eventForm.venue,
                time: eventForm.time,
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
        } catch (error) {
            console.error('Event error:', error)
            alert('Failed to save event')
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
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
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
                                <input
                                    type="text"
                                    placeholder="Venue"
                                    value={eventForm.venue}
                                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                    required
                                />
                                <div className="form-row">
                                    <input
                                        type="date"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Time (e.g., 8:00 PM)"
                                        value={eventForm.time}
                                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                    />
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
