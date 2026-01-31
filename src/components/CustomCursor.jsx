import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isClicking, setIsClicking] = useState(false)

    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 700 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        // Check if it's a touch device
        if ('ontouchstart' in window) return

        const moveCursor = (e) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        const handleMouseEnter = () => setIsHovering(true)
        const handleMouseLeave = () => setIsHovering(false)
        const handleMouseDown = () => setIsClicking(true)
        const handleMouseUp = () => setIsClicking(false)

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        // Add hover listeners to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .member-card, .venue-card, .track')
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleMouseEnter)
            el.addEventListener('mouseleave', handleMouseLeave)
        })

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter)
                el.removeEventListener('mouseleave', handleMouseLeave)
            })
        }
    }, [cursorX, cursorY, isVisible])

    // Re-attach listeners when DOM changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const handleMouseEnter = () => setIsHovering(true)
            const handleMouseLeave = () => setIsHovering(false)

            const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .member-card, .venue-card, .track')
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', handleMouseEnter)
                el.addEventListener('mouseleave', handleMouseLeave)
            })
        })

        observer.observe(document.body, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [])

    if ('ontouchstart' in window) return null

    return (
        <>
            {/* Vinyl Disc Cursor */}
            <motion.div
                className="cursor-vinyl"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                    opacity: isVisible ? 1 : 0,
                }}
                animate={{
                    scale: isClicking ? 0.85 : isHovering ? 1.3 : 1,
                    rotate: isHovering ? 180 : 0,
                }}
                transition={{
                    scale: { duration: 0.15 },
                    rotate: { duration: 0.4, ease: 'easeOut' }
                }}
            >
                {/* Vinyl disc SVG */}
                <svg viewBox="0 0 40 40" width="40" height="40">
                    {/* Outer disc */}
                    <circle cx="20" cy="20" r="18" fill="#1a1a2e" stroke="#E8A87C" strokeWidth="1.5" />
                    {/* Grooves */}
                    <circle cx="20" cy="20" r="14" fill="none" stroke="#2d2d44" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="11" fill="none" stroke="#2d2d44" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="8" fill="none" stroke="#2d2d44" strokeWidth="0.5" />
                    {/* Center label */}
                    <circle cx="20" cy="20" r="5" fill="#E8A87C" />
                    {/* Center hole */}
                    <circle cx="20" cy="20" r="1.5" fill="#1a1a2e" />
                    {/* Shine highlight */}
                    <ellipse cx="14" cy="14" rx="4" ry="2" fill="rgba(255,255,255,0.1)" transform="rotate(-45 14 14)" />
                </svg>
            </motion.div>
        </>
    )
}

export default CustomCursor
