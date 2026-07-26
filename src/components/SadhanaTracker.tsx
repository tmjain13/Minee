import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { devLog } from '../lib/devLog';

export const SadhanaTracker: React.FC = () => {
  const { user } = useAuth();
  const [diary, setDiary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSadhana = async () => {
      if (!user?.uid) return;
      // First check local storage for instant offline availability
      const localData = localStorage.getItem(`sadhana_diary_${user.uid}`);
      if (localData) {
        setDiary(localData);
      }
      try {
        const docRef = doc(db, 'sadhana', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteDiary = docSnap.data().diary || '';
          setDiary(remoteDiary);
          localStorage.setItem(`sadhana_diary_${user.uid}`, remoteDiary);
        }
      } catch (error: any) {
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
          devLog("SadhanaTracker: Operating in offline mode using local cache");
        } else {
          devLog("SadhanaTracker: Unable to fetch remote sadhana document", error?.message || error);
        }
      }
    };
    fetchSadhana();
  }, [user?.uid]);

  const saveSadhana = async () => {
    if (!user?.uid) return;
    setLoading(true);
    localStorage.setItem(`sadhana_diary_${user.uid}`, diary);
    try {
      await setDoc(doc(db, 'sadhana', user.uid), {
        diary,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err: any) {
      devLog("Sadhana saved locally in offline mode:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Daily Sadhana Diary</h2>
      <textarea 
        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        value={diary}
        onChange={(e) => setDiary(e.target.value)}
        rows={4}
      />
      <button 
        onClick={saveSadhana}
        className="mt-2 w-full bg-orange-500 text-white py-2 rounded-lg font-medium"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Sadhana'}
      </button>
    </div>
  );
};
