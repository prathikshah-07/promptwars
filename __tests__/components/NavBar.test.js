/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/components/Navbar';

beforeEach(() => {
  window.localStorage.clear();
});

describe('Navbar', () => {
  it('renders the primary nav links', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
    expect(screen.getByText('Track Complaint')).toBeInTheDocument();
  });

  it('defaults the language selector to English when nothing is stored', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Select language')).toHaveValue('en');
  });

  it('picks up a previously stored language on mount', async () => {
    window.localStorage.setItem('sb_lang', 'hi');
    render(<Navbar />);
    await waitFor(() => expect(screen.getByLabelText('Select language')).toHaveValue('hi'));
  });

  it('updates localStorage and dispatches sb-lang-change when the language is changed', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    render(<Navbar />);

    fireEvent.change(screen.getByLabelText('Select language'), { target: { value: 'ta' } });

    expect(window.localStorage.getItem('sb_lang')).toBe('ta');
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'sb-lang-change', detail: 'ta' })
    );
  });
});