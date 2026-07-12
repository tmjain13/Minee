import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export const SadhanaTracker: React.FC = () => {
  const { user } = useAuth();
  const [diary, setDiary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSadhana = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'sadhana', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDiary(docSnap.data().diary || '');
        }
      } catch (error) {
        console.error("Error fetching sadhana:", error);
      }
    };
    fetchSadhana();
  }, [user?.uid]);

  const saveSadhana = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'sadhana', user.uid), {
        diary,
        updatedAt: new Date().toISOString()
      }, { merge: true });
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
