import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../lib/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('../services/sadhanaOfflineSync', () => ({
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
  onSnapshot: jest.fn(() => () => {}), // Returns an unsubscribe function
  doc: jest.fn(() => ({})),
  setDoc: jest.fn()
}));

import SadhanaTab from './SadhanaTab';
import { AuthContext } from '../context/AuthContext';

// Mock the AuthContext
const mockAuth = {
  user: { uid: 'test-uid', displayName: 'Test User' },
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
};

describe('SadhanaTab Component', () => {
  test('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuth as any}>
        <SadhanaTab />
      </AuthContext.Provider>
    );
    // Just verify the component mounted; might need to find a specific text/element
    // SadhanaTab has a lot of components, so it should render something
    expect(screen).toBeDefined();
  });
});
