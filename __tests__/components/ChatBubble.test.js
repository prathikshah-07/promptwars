/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import ChatBubble from '@/components/ChatBubble';

describe('ChatBubble', () => {
  it('renders the message text', () => {
    render(<ChatBubble role="user" text="What documents do I need for a PAN card?" />);
    expect(screen.getByText('What documents do I need for a PAN card?')).toBeInTheDocument();
  });

  it('does not show the "Smart Bharat" label for a user message', () => {
    render(<ChatBubble role="user" text="Hello" />);
    expect(screen.queryByText('Smart Bharat')).not.toBeInTheDocument();
  });

  it('shows the "Smart Bharat" label for an AI message', () => {
    render(<ChatBubble role="ai" text="Here is your answer." />);
    expect(screen.getByText('Smart Bharat')).toBeInTheDocument();
  });

  it('renders an optional note when provided', () => {
    render(<ChatBubble role="ai" text="Answer" note="Quick-reference answer (AI momentarily unavailable)" />);
    expect(screen.getByText('Quick-reference answer (AI momentarily unavailable)')).toBeInTheDocument();
  });

  it('does not render a note element when none is provided', () => {
    const { container } = render(<ChatBubble role="ai" text="Answer" />);
    expect(container.querySelector('.opacity-75')).not.toBeInTheDocument();
  });
});