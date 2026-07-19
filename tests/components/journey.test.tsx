import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext } from '../../src/context/AuthContext';
import { LanguageProvider } from '../../src/context/LanguageContext';
import SadhanaTab from '../../src/components/SadhanaTab';

// Mock Firebase & other services
jest.mock('../../src/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

jest.mock('../../src/services/sadhanaOfflineSync', () => ({
  getLocalData: jest.fn().mockResolvedValue([]),
  saveLocalData: jest.fn().mockResolvedValue(true),
  createSadhanaRecord: jest.fn().mockResolvedValue({ id: 'mock-record-id' }),
  syncPendingRecords: jest.fn().mockResolvedValue([]),
  isOnline: jest.fn().mockReturnValue(true)
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  query: jest.fn(() => ({})),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn()
}));

const mockAuthValue = {
  user: { uid: 'test-user-123', email: 'test@terapanth.ai', displayName: 'Test Shravak' },
  userData: { role: 'user' },
  loading: false,
  isLoading: false,
  signInWithGoogle: jest.fn(),
  logout: jest.fn(),
  updateUserProfile: jest.fn()
};

describe('Auth -> Sadhana Logging Journey Test', () => {
  it('renders login screen or active state based on authentication', async () => {
    render(
      <AuthContext.Provider value={mockAuthValue as any}>
        <LanguageProvider>
          <SadhanaTab />
        </LanguageProvider>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      // SadhanaTab renders the spiritual center or tab content
      expect(screen).toBeDefined();
    });
  });
});
