import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const requestsRef = collection(db, 'songRequests')

// Add a song request to Firestore
export const addSongRequest = async (request) => {
    await addDoc(requestsRef, {
        ...request,
        status: 'pending',
        createdAt: serverTimestamp()
    })
}
