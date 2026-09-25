import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import AppNav from '../components/AppNav.jsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function Chat() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const showToast = useToast();
  const [messages, setMessages] = useState([]);
  const [otherName, setOtherName] = useState('...');
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Load message history and figure out who the other participant is
    api.get(`/messages/${swapId}`).then((res) => {
      if (cancelled) return;
      setMessages(res.data.messages);
    });
    api.get('/swaps').then((res) => {
      if (cancelled) return;
      const swap = res.data.swaps.find((s) => s._id === swapId);
      if (swap) {
        const other = swap.fromUser._id === user.id ? swap.toUser : swap.fromUser;
        setOtherName(other.name);
      }
    });

    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('joinSwap', swapId);
    socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('error', (msg) => showToast(typeof msg === 'string' ? msg : 'Chat error'));

    return () => {
      cancelled = true;
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { swapId, text });
    setText('');
  };

  return (
    <div>
      <AppNav />
      <main className="chat-wrap">
        <div className="container">
          <Link to="/swap-requests" className="back-link">← Back to swap requests</Link>

          <div className="pin-card rot-s chat-card">
            <div className="chat-header">
              <div className="avatar">{otherName?.[0]?.toUpperCase()}</div>
              <div>
                <div className="person-name">{otherName}</div>
                <div className="person-rating">{connected ? 'Connected' : 'Connecting...'}</div>
              </div>
            </div>

            <div className="chat-log">
              {messages.length === 0 && (
                <p className="field-hint" style={{ textAlign: 'center', marginTop: 20 }}>
                  No messages yet — say hi!
                </p>
              )}
              {messages.map((msg) => {
                const mine = (msg.sender._id || msg.sender) === user.id;
                return (
                  <div key={msg._id} className={`msg ${mine ? 'msg-me' : 'msg-them'}`}>
                    {!mine && <span className="msg-author">{msg.sender.name}</span>}
                    {msg.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="chat-input-row" onSubmit={sendMessage}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                autoComplete="off"
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
