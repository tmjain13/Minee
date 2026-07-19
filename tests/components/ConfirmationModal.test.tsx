import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationModal from '../../src/components/ConfirmationModal';

describe('ConfirmationModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Are you sure?"
        message="This action cannot be undone."
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title, message, and buttons when isOpen is true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Record"
        message="Are you sure you want to delete this diary entry?"
        confirmLabel="Confirm Delete"
        cancelLabel="Keep It"
      />
    );

    expect(screen.getByText('Delete Record')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this diary entry?')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep It')).toBeInTheDocument();
  });

  it('calls onClose when cancel or close button is clicked', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Are you sure?"
        message="This action cannot be undone."
        cancelLabel="Cancel Action"
      />
    );

    const cancelBtn = screen.getByText('Cancel Action');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const closeIconBtn = screen.getByTitle('Close modal');
    fireEvent.click(closeIconBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Are you sure?"
        message="This action cannot be undone."
        confirmLabel="Confirm Action"
      />
    );

    const confirmBtn = screen.getByText('Confirm Action');
    fireEvent.click(confirmBtn);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
