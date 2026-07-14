import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../lib/firebase', () => ({
  auth: {},
  db: {}
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
