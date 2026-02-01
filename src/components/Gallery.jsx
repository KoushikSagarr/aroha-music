import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

// Placeholder images for when Firestore is empty or has few photos
const placeholderImages = [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', caption: 'Live in Concert' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', caption: 'On Stage' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80', caption: 'Acoustic Night' },
    { id: 'p4', url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', caption: 'Festival Vibes' },
    { id: 'p5', url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80', caption: 'Crowd Energy' },
    { id: 'p6', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80', caption: 'Rock the Night' },
    { id: 'p7', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80', caption: 'Stage Lights' },
    { id: 'p8', url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80', caption: 'Music Magic' },
]

const Gallery = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [firestorePhotos, setFirestorePhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    // Fetch photos from Firestore
    useEffect(() => {
        const photosRef = collection(db, 'photos')
        const q = query(photosRef, orderBy('uploadedAt', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photoData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setFirestorePhotos(photoData)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching photos:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Combine Firestore photos with placeholders for marquee effect
    const allPhotos = firestorePhotos.length > 0
        ? [...firestorePhotos, ...placeholderImages.slice(0, Math.max(0, 8 - firestorePhotos.length))]
        : placeholderImages

    // Double the array for seamless infinite scroll
    const marqueePhotos = [...allPhotos, ...allPhotos]

    return (
        <section className="gallery" id="gallery" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-tag">📸 Captured Moments</span>
                    <h2 className="section-title">Photo Gallery</h2>
                    <p className="section-subtitle">
                        Relive the magic from our live performances
                    </p>
                </motion.div>

                {loading ? (
                    <div className="gallery-loading">
                        <span className="loading-emoji">🎵</span>
                        <p>Loading photos...</p>
                    </div>
                ) : (
                    <div className="marquee-container">
                        <motion.div
                            className="marquee-track"
                            animate={{ x: [0, '-50%'] }}
                            transition={{
                                x: {
                                    duration: 30,
                                    repeat: Infinity,
                                    ease: 'linear'
                                }
                            }}
                        >
                            {marqueePhotos.map((photo, index) => (
                                <div
                                    key={`${photo.id}-${index}`}
                                    className="marquee-item"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img src={photo.url} alt={photo.caption || 'Performance photo'} />
                                    {photo.caption && (
                                        <div className="gallery-caption">
                                            <p>{photo.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="lightbox-close"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                ✕
                            </button>
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || 'Performance photo'}
                            />
                            {selectedPhoto.caption && (
                                <p className="lightbox-caption">{selectedPhoto.caption}</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default Gallery
