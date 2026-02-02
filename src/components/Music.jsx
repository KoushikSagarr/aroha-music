import { motion, useInView, animate } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const tracks = [
    { id: 1, name: 'Demo Track 1', duration: '3:45' },
    { id: 2, name: 'Demo Track 2', duration: '4:12' },
    { id: 3, name: 'Demo Track 3', duration: '3:58' },
]

const Music = () => {
    const ref = useRef(null)
    const audioRef = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState('0:00')
    const DURATION = 180 // approx 3 mins for placeholder

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateProgress = () => {
            const current = audio.currentTime
            const duration = audio.duration || DURATION
            setProgress((current / duration) * 100)

            const minutes = Math.floor(current / 60)
            const seconds = Math.floor(current % 60)
            setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }

        const handleEnded = () => setIsPlaying(false)

        audio.addEventListener('timeupdate', updateProgress)
        audio.addEventListener('ended', handleEnded)
        return () => {
            audio.removeEventListener('timeupdate', updateProgress)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const width = rect.width
        const newTime = (clickX / width) * (audioRef.current.duration || DURATION)
        audioRef.current.currentTime = newTime
    }

    return (
        <section className="music" id="music" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header center"
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-tag">Our Sound</span>
                    <h2 className="section-title">Listen To AROHA</h2>
                    <p className="section-subtitle">Get a taste of what we bring to the stage</p>
                </motion.div>

                <motion.div
                    className="music-player"
                    initial={{ y: 50, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="player-visual">
                        <div className="vinyl-container">
                            <motion.div
                                className="vinyl"
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{
                                    duration: 3,
                                    repeat: isPlaying ? Infinity : 0,
                                    ease: 'linear'
                                }}
                            >
                                <img src="/logo.jpg" alt="AROHA" className="vinyl-label" />
                            </motion.div>
                            <motion.div
                                className="tone-arm"
                                animate={{ rotate: isPlaying ? -10 : -25 }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    <div className="player-controls">
                        <div className="now-playing">
                            <span className="track-title">Soothing Vibes</span>
                            <span className="track-artist">AROHA Instrumentals</span>
                        </div>

                        <div className="progress-bar" onClick={handleProgressClick}>
                            <motion.div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="time-display">
                            <span>{currentTime}</span>
                            <span>{tracks[0].duration}</span>
                        </div>

                        <div className="controls center-controls">
                            <motion.button
                                className="control-btn play-btn"
                                onClick={handlePlayPause}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </motion.button>
                        </div>

                        <div className="social-profiles">
                            <p className="social-cta">Follow us on Instagram</p>
                            <div className="profiles-grid">
                                <a
                                    href="https://www.instagram.com/aroha_music_/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-card"
                                >
                                    <div className="profile-icon">🎸</div>
                                    <div className="profile-info">
                                        <span className="profile-role">Official Band</span>
                                        <span className="profile-name">AROHA Music</span>
                                        <span className="profile-handle">@aroha_music_</span>
                                    </div>
                                </a>
                                <a
                                    href="https://www.instagram.com/mihiraramana.music/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-card"
                                >
                                    <div className="profile-icon">🎤</div>
                                    <div className="profile-info">
                                        <span className="profile-role">Lead Singer</span>
                                        <span className="profile-name">Mihira Ramana</span>
                                        <span className="profile-handle">@mihiraramana.music</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <audio
                    ref={audioRef}
                    src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
                    loop
                />
            </div>
        </section>
    )
}

export default Music
