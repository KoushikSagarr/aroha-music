import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import {
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore'
import CustomCursor from './CustomCursor'

// Admin credentials - change these!
const ADMIN_CREDENTIALS = {
    username: 'aroha',
    password: 'music2024'
}

const requestsRef = collection(db, 'songRequests')

const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [requests, setRequests] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check if already logged in (session storage)
    useEffect(() => {
        const session = sessionStorage.getItem('aroha_admin')
        if (session === 'true') {
            setIsLoggedIn(true)
        }
    }, [])

    // Subscribe to requests when logged in
    useEffect(() => {
        if (!isLoggedIn) return

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
        // Redirect to landing page
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
                        <p>Enter credentials to view song requests</p>
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
            <div className="admin-header">
                <div className="admin-title">
                    <h1>🎤 Song Requests</h1>
                    {pendingCount > 0 && (
                        <span className="pending-badge">{pendingCount} pending</span>
                    )}
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {loading ? (
                <div className="admin-loading">
                    <span className="loading-spinner">🎵</span>
                    <p>Loading requests...</p>
                </div>
            ) : (
                <div className="admin-requests">
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
                </div>
            )}

            <div className="admin-footer">
                <span>🟢 Live sync enabled</span>
            </div>
        </div>
    )
}

export default AdminPage
