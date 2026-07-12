// src/lib/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export type UploadType = 'avatar' | 'gallery';

export const uploadUserImage = async (
  file: File, 
  uid: string, 
  type: UploadType
): Promise<string> => {
  // Respecting the storage.rules paths defined previously
  const path = type === 'avatar' 
    ? `avatars/${uid}/profile.jpg` 
    : `gallery/${uid}/${Date.now()}_${file.name}`;
    
  const storageRef = ref(storage, path);
  
  // Metadata for security validation
  const metadata = {
    contentType: file.type,
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(snapshot.ref);
};
