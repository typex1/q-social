'use client';

import { useState, useEffect } from 'react';
import { createMessage, getMessages, ApiError } from './lib/api-client';
import type { Message } from '../shared/types/message';
import './globals.css';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const data = await getMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load messages');
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newMessage = await createMessage(content);
      setMessages([newMessage, ...messages]);
      setContent('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to post message');
      }
    } finally {
      setLoading(false);
    }
  }

  const remainingChars = 280 - content.length;

  return (
    <main className="container">
      <h1>Q-Social</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={280}
          disabled={loading}
        />
        <div className="form-footer">
          <span className={remainingChars < 0 ? 'error' : ''}>
            {remainingChars} characters remaining
          </span>
          <button type="submit" disabled={loading || !content.trim()}>
            Post
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="feed">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p>{message.content}</p>
            <time>{new Date(message.createdAt).toLocaleString()}</time>
          </div>
        ))}
      </div>
    </main>
  );
}
