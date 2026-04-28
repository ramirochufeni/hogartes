import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Mail,
  Phone,
  MessageCircle,
  AlertTriangle,
  User,
  Send
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import type { Service } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { BLOCKED_TERMS } from '../../backend/src/helpers/profanityFilter'; // We can safely import this from backend in this monolithic setup, or just copy the logic. 

// Local profanity filter to avoid importing from outside src if strictly prohibited, 
// but since this is TS we can just redefine it here to be safe:
const containsProfanity = (text: string) => {
  if (!text) return false;
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED_TERMS.some(term => {
    const normalizedTerm = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedTerm);
  });
};

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContacting, setIsContacting] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsAverage, setReviewsAverage] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewHover, setReviewHover] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Questions State
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchApi(`/services/${id}`),
      fetchApi(`/services/${id}/reviews`),
      fetchApi(`/services/${id}/questions`)
    ])
      .then(([serviceRes, reviewsRes, questionsRes]) => {
        setService(serviceRes.data);
        setReviews(reviewsRes.data.reviews || []);
        setReviewsAverage(reviewsRes.data.average);
        setReviewsCount(reviewsRes.data.count || 0);
        setQuestions(questionsRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (reviewRating === 0) {
      setReviewError('Por favor selecciona una calificación.');
      return;
    }

    if (containsProfanity(reviewText)) {
      setReviewError('Tu reseña contiene lenguaje inapropiado. Editala antes de publicarla.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { data } = await fetchApi(`/services/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: reviewText })
      });
      // Update local state
      setReviews([data, ...reviews]);
      setReviewsCount(prev => prev + 1);
      // Recalculate average roughly
      const newAverage = reviewsAverage
        ? ((reviewsAverage * reviewsCount) + reviewRating) / (reviewsCount + 1)
        : reviewRating;
      setReviewsAverage(Math.round(newAverage * 10) / 10);

      setReviewRating(0);
      setReviewText('');
    } catch (error: any) {
      setReviewError(error.message || 'Error al publicar la reseña.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError('');

    if (!questionText.trim()) {
      setQuestionError('La pregunta no puede estar vacía.');
      return;
    }

    if (containsProfanity(questionText)) {
      setQuestionError('Tu pregunta contiene lenguaje inapropiado.');
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const { data } = await fetchApi(`/services/${id}/questions`, {
        method: 'POST',
        body: JSON.stringify({ content: questionText })
      });
      setQuestions([data, ...questions]);
      setQuestionText('');
    } catch (error: any) {
      setQuestionError(error.message || 'Error al publicar la pregunta.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    const answerText = answerTexts[questionId];

    setAnswerErrors({ ...answerErrors, [questionId]: '' });

    if (!answerText?.trim()) {
      setAnswerErrors({ ...answerErrors, [questionId]: 'La respuesta no puede estar vacía.' });
      return;
    }

    if (containsProfanity(answerText)) {
      setAnswerErrors({ ...answerErrors, [questionId]: 'La respuesta contiene lenguaje inapropiado.' });
      return;
    }

    setIsSubmittingAnswer({ ...isSubmittingAnswer, [questionId]: true });
    try {
      const { data } = await fetchApi(`/questions/${questionId}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ answer: answerText })
      });

      // Update question in list
      setQuestions(questions.map(q => q.id === questionId ? data : q));

      // Clear input
      const newAnswerTexts = { ...answerTexts };
      delete newAnswerTexts[questionId];
      setAnswerTexts(newAnswerTexts);
    } catch (error: any) {
      setAnswerErrors({ ...answerErrors, [questionId]: error.message || 'Error al publicar la respuesta.' });
    } finally {
      setIsSubmittingAnswer({ ...isSubmittingAnswer, [questionId]: false });
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (user?.role === 'ADMIN') {
      alert('Los administradores no pueden iniciar conversaciones.');
      return;
    }

    if (user?.role === 'PROVIDER') {
      if ((service?.provider as any)?.userId === user?.id) {
        alert('No podés iniciar una conversación con vos mismo.');
        return;
      }
      alert('Solo los clientes pueden iniciar conversaciones con los suscriptores.');
      return;
    }

    setIsContacting(true);
    try {
      const { data } = await fetchApi(`/conversations/service/${id}`, { method: 'POST' });
      navigate(`/mensajes?conversationId=${data.id}`);
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al intentar iniciar la conversación.');
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '50vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '800px', height: '400px', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--color-bg)' }}></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container flex-center" style={{ minHeight: '50vh' }}>
        <h2 className="text-muted">Servicio no encontrado</h2>
      </div>
    );
  }

  const providerName = service.provider?.publicUsername || service.provider?.user?.name || 'Prestador no identificado';
  const phone = service.provider?.phone || 'No especificado';
  const isOwner = user?.id === (service.provider as any)?.userId;

  const locationText =
    service.provider?.city || service.provider?.province
      ? `${service.provider?.city || ''}${service.provider?.city && service.provider?.province ? ', ' : ''
      }${service.provider?.province || ''}`
      : 'Ubicación no especificada';

  const serviceImage = service.coverImage
    ? `http://localhost:5000${service.coverImage}`
    : 'https://via.placeholder.com/1200x400?text=Sin+imagen';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 600px', minWidth: '0' }}>

          {/* HEADER */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-gray" style={{ color: 'var(--color-text-muted)' }}>
                {service.subcategory?.category?.name || 'Sin categoría'}
              </span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>•</span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                {service.subcategory?.name || 'General'}
              </span>
            </div>

            <h1 className="text-h1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {service.title}
            </h1>

            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div className="flex-center" style={{ gap: '0.25rem', color: reviewsAverage ? '#f59e0b' : 'var(--color-text-muted)' }}>
                <Star size={18} fill={reviewsAverage ? "#f59e0b" : "none"} />
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {reviewsAverage ? `${reviewsAverage} (${reviewsCount} opinion${reviewsCount !== 1 ? 'es' : ''})` : 'Sin calificaciones'}
                </span>
              </div>

              <div className="flex-center text-muted" style={{ gap: '0.25rem' }}>
                <MapPin size={16} />
                {locationText}
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: 'none', backgroundColor: '#f0f2f5' }}>
            <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={serviceImage} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* VIDEO */}
          {service.videoUrl && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 className="text-h3" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🎬 Video del servicio
              </h3>
              <video controls src={`http://localhost:5000${service.videoUrl}`} style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '400px', backgroundColor: '#000' }}>
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          )}

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '3rem' }}>
            <h2 className="text-h2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Descripción del servicio
            </h2>
            <div className="text-body" style={{ lineHeight: 1.8, color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
              {service.description}
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '3rem' }}>
            <h2 className="text-h2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Opiniones sobre el servicio
            </h2>

            {/* REVIEW FORM */}
            {isAuthenticated && user?.role === 'CLIENT' && !isOwner && !reviews.some(r => r.userId === user?.id) && (
              <form onSubmit={handleReviewSubmit} className="card" style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--color-bg)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Dejar una reseña</p>

                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                    >
                      <Star size={24} fill={(reviewHover || reviewRating) >= star ? "#f59e0b" : "none"} color={(reviewHover || reviewRating) >= star ? "#f59e0b" : "var(--color-border)"} />
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Escribe aquí tu experiencia con este profesional (opcional)..."
                  className="card"
                  style={{ width: '100%', padding: '0.75rem 1rem', boxShadow: 'none', marginBottom: '1rem', border: reviewError ? '1px solid red' : '1px solid var(--color-border)' }}
                  rows={3}
                ></textarea>

                {reviewError && (
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <AlertTriangle size={16} />
                    {reviewError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Publicando...' : 'Publicar opinión'}
                  </button>
                </div>
              </form>
            )}

            {/* REVIEWS LIST */}
            {reviews.length === 0 ? (
              <p className="text-muted" style={{ marginBottom: '2rem' }}>
                Aún no hay valoraciones para este servicio.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{review.userName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem', color: '#f59e0b' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} fill={review.rating >= star ? "#f59e0b" : "none"} color={review.rating >= star ? "#f59e0b" : "var(--color-border)"} />
                        ))}
                      </div>
                      {review.comment && (
                        <p style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUESTIONS SECTION */}
          <div>
            <h2 className="text-h2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Preguntas y Respuestas
            </h2>

            {/* QUESTION FORM */}
            {isAuthenticated && user?.role === 'CLIENT' && !isOwner && (
              <form onSubmit={handleQuestionSubmit} className="card" style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--color-bg)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Hacer una pregunta al profesional</p>

                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="¿Tenés alguna duda sobre el servicio?..."
                  className="card"
                  style={{ width: '100%', padding: '0.75rem 1rem', boxShadow: 'none', marginBottom: '1rem', border: questionError ? '1px solid red' : '1px solid var(--color-border)' }}
                  rows={2}
                ></textarea>

                {questionError && (
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <AlertTriangle size={16} />
                    {questionError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingQuestion}>
                    {isSubmittingQuestion ? 'Enviando...' : 'Preguntar'}
                  </button>
                </div>
              </form>
            )}

            {/* QUESTIONS LIST */}
            {questions.length === 0 ? (
              <p className="text-muted">Todavía no hay preguntas de usuarios para este servicio.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {questions.map((question) => (
                  <div key={question.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <User size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{question.userName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)' }}>
                        {question.content}
                      </p>

                      {/* ANSWER DISPLAY */}
                      {question.answer ? (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--color-primary-light)' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {question.answeredByName?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div style={{ marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-primary)', marginRight: '0.5rem' }}>{question.answeredByName || providerName}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {question.answeredAt && new Date(question.answeredAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--color-text-main)' }}>
                              {question.answer}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* ANSWER FORM FOR OWNER */
                        isAuthenticated && isOwner && (
                          <form onSubmit={(e) => handleAnswerSubmit(e, question.id)} style={{ marginTop: '1rem', marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="text"
                                className="input"
                                placeholder="Escribe una respuesta..."
                                value={answerTexts[question.id] || ''}
                                onChange={(e) => setAnswerTexts({ ...answerTexts, [question.id]: e.target.value })}
                                style={{ flex: 1, padding: '0.5rem 1rem' }}
                              />
                              <button type="submit" className="btn btn-primary" disabled={isSubmittingAnswer[question.id]} style={{ padding: '0 1rem' }}>
                                <Send size={18} />
                              </button>
                            </div>
                            {answerErrors[question.id] && (
                              <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{answerErrors[question.id]}</div>
                            )}
                          </form>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div style={{ flex: '1 1 350px', position: 'sticky', top: '100px' }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleContact}
                disabled={isContacting}
                style={{ width: '100%', fontSize: '1.125rem', padding: '1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', opacity: isContacting ? 0.7 : 1 }}
              >
                <MessageCircle size={22} />
                {isContacting ? 'Conectando...' : 'Contactar / Enviar Mensaje'}
              </button>

              <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Comunicación segura garantizada
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

            <h3 className="text-h3" style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>
              Información del Prestador
            </h3>

            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-border)', borderRadius: '50%', backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=random)`, backgroundSize: 'cover' }}></div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{providerName}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                <Phone size={18} color="var(--color-text-muted)" />
                <span style={{ fontSize: '0.95rem' }}>{phone}</span>
              </div>
              <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--color-text-muted)" />
                <span style={{ fontSize: '0.95rem' }}>{locationText}</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

            <h3 className="text-h3" style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>
              Reputación en HogArtes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Only show "Identidad Verificada" if the provider status is VERIFIED */}
              {service.provider?.verificationStatus === 'VERIFIED' && (
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <ShieldCheck size={24} color="#10b981" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#10b981' }}>
                      Identidad Verificada
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Documentación validada
                    </p>
                  </div>
                </div>
              )}

              {/* Only show "Recomendado" if average is >= 3 */}
              {reviewsAverage !== null && reviewsAverage >= 3 && (
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={24} color="var(--color-primary)" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                      Recomendado
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Calificación promedio: {reviewsAverage}
                    </p>
                  </div>
                </div>
              )}

              {/* Neutral state if no reputation badges are applicable */}
              {service.provider?.verificationStatus !== 'VERIFIED' && (!reviewsAverage || reviewsAverage < 3) && (
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                  <ShieldCheck size={24} color="var(--color-text-muted)" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                      Profesional Nuevo
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Aún construyendo su reputación
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-center" style={{ justifyContent: 'center', gap: '0.5rem', opacity: 0.7 }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: '0.875rem' }}>Transacción segura vía HogArtes</span>
          </div>
        </div>
      </div>
    </div>
  );
}