// components/drivers/MessageForm.tsx
import { useState } from 'react';

interface MessageFormProps {
  onSend: (message: string) => void;
  isSending: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSend, isSending }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message to Driver</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to send to driver about document issues..."
          className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default MessageForm;