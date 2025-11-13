import { app } from './config'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

const storage = getStorage(app)

export const uploadImageAndGetURL = async (uid: string, file: File) => {
  const fileRef = ref(storage, `wishlists/${uid}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

export const deleteImageFromURL = async (imageUrl: string) => {
  try {
    const decodedPath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0])
    const fileRef = ref(storage, decodedPath)
    await deleteObject(fileRef)
  } catch (err) {
    console.warn('Fehler beim Löschen des Bildes:', err)
  }
}
