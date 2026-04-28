import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Loader2, User, ChevronLeft, ArrowLeft } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  }, [isAuthenticated, navigate, location]);

  // Read conversationId from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convId = params.get('conversationId');
    if (convId) setActiveConvId(convId);
  }, [location.search]);

  // Load conversations list (and refresh when activeConvId changes
  // to ensure a freshly-created conversation appears in the sidebar)
  const loadConversations = async () => {
    try {
      const { data } = await fetchApi('/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // When a new conversation is selected from URL (redirect from "Contactar"),
  // force a sidebar refresh so the new conversation shows up immediately.
  useEffect(() => {
    if (activeConvId && isAuthenticated) {
      loadConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId || !isAuthenticated) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const { data } = await fetchApi(`/conversations/${activeConvId}/messages`);
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
        // Mark as read silently
        fetchApi(`/conversations/${activeConvId}/read`, { method: 'PATCH' }).catch(() => {});
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    setLoadingMessages(true);
    lastMessageCountRef.current = 0; // reset so first load always scrolls to bottom
    loadMessages();

    const interval = setInterval(loadMessages, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeConvId, isAuthenticated]);

  // Scroll to bottom only when new messages arrive (not on every render/poll)
  useEffect(() => {
    const count = messages.length;
    if (count > lastMessageCountRef.current && messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
    lastMessageCountRef.current = count;
  }, [messages]);

  const handleSelectConv = (id: string) => {
    navigate(`/mensajes?conversationId=${id}`, { replace: true });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { data } = await fetchApi(`/conversations/${activeConvId}/messages`, {
        method: 'POST',
        data: { content }
      });
      setMessages(prev => [...prev, data]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('No se pudo enviar el mensaje. Reintentá en unos segundos.');
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Show the chat panel if we have a conversationId — even while the
  // conversation metadata (activeConversation) is still loading from the sidebar list.
  // Messages load independently via activeConvId, so this is always safe.
  const chatIsOpen = !!activeConvId;

  // On mobile: show only sidebar or only chat
  const showSidebar = isDesktop || !chatIsOpen;
  const showChat = isDesktop || chatIsOpen;

  return (
    <div className="container" style={{ padding: '1rem 1.25rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0, minHeight: 0 }}>

        {/* Sidebar */}
        {showSidebar && (
          <div style={{
            width: isDesktop ? '300px' : '100%',
            flexShrink: 0,
            borderRight: isDesktop ? '1px solid var(--color-border)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Conversaciones</h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingConvs ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem' }}>Aún no tenés conversaciones.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>Iniciá una desde una publicación de servicio.</p>
                </div>
              ) : (
                conversations.map(conv => {
                  // conv.providerId and conv.clientId are user.id values
                  const isProvider = conv.providerId === user?.id;
                  const otherName = isProvider
                    ? (conv.client?.name || 'Cliente')
                    : (conv.providerPublicUsername || conv.provider?.name || 'Suscriptor');
                  const roleLabel = isProvider ? 'Cliente' : 'Suscriptor';
                  const lastMessage = conv.lastMessage;
                  const unread = lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: activeConvId === conv.id ? '#eff6ff' : 'transparent',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        backgroundColor: 'var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: 'var(--color-text-muted)'
                      }}>
                        <User size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                          <span style={{ fontWeight: unread ? 700 : 600, fontSize: '0.9rem', color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {otherName}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>
                            {roleLabel}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-primary)', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.service?.title || 'Servicio'}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: unread ? 'var(--color-text-main)' : 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unread ? 500 : 400 }}>
                          {lastMessage ? lastMessage.content : 'Sin mensajes aún'}
                        </p>
                      </div>
                      {unread && (
                        <div style={{ width: '9px', height: '9px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', flexShrink: 0, marginTop: '0.5rem' }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        {showChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: '#fff' }}>
            {chatIsOpen ? (
              <>
                {/* Chat header — shows skeleton until activeConversation loads */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {!isDesktop && (
                    <button
                      onClick={() => navigate('/mensajes', { replace: true })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)', padding: '0.25rem' }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color="var(--color-text-muted)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {activeConversation ? (
                      <>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {activeConversation.providerId === user?.id
                            ? (activeConversation.client?.name || 'Cliente')
                            : (activeConversation.providerPublicUsername || activeConversation.provider?.name || 'Suscriptor')
                          }
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {activeConversation.service?.title}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>Nueva conversación</p>
                    )}
                  </div>
                </div>

                {/* Messages — scroll is managed via messagesContainerRef.scrollTop, NOT scrollIntoView */}
                <div
                  ref={messagesContainerRef}
                  style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc' }}
                >
                  {loadingMessages ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: 'var(--color-text-muted)' }}>
                      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      <MessageSquare size={44} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                      <p>Iniciá la conversación enviando el primer mensaje.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '72%',
                            padding: '0.7rem 1rem',
                            borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                            backgroundColor: isMe ? 'var(--color-primary)' : '#fff',
                            color: isMe ? '#fff' : 'var(--color-text-main)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}>
                            <p style={{ margin: 0, lineHeight: 1.5, wordBreak: 'break-word', fontSize: '0.9rem' }}>{msg.content}</p>
                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.68rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', textAlign: 'right' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Escribí un mensaje..."
                      className="input"
                      style={{ flex: 1 }}
                      autoComplete="off"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newMessage.trim() || sending}
                      style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {sending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
                <MessageSquare size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Tus mensajes</h2>
                <p style={{ fontSize: '0.9rem' }}>Seleccioná una conversación para ver los mensajes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
