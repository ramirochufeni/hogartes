import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApi(`/news/${id}`)
        .then(res => setArticle(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Cargando artículo...</div>;
  if (!article) return <div style={{ padding: '5rem', textAlign: 'center' }}>Extracción no encontrada.</div>;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', padding: '2rem 1.25rem', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <Link to="/noticias" className="btn flex-center" style={{ gap: '0.5rem', padding: 0, color: 'var(--color-text-muted)', marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={20} /> Volver a noticias
        </Link>
        
        <article className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          <div style={{ width: '100%', height: '400px', backgroundColor: 'var(--color-bg)' }}>
            {article.imageUrl && <img src={`http://localhost:5000${article.imageUrl}`} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          
          <div style={{ padding: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
               <div className="flex-center" style={{ gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                 <Calendar size={18} />
                 Publicado el {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
               </div>
               <button className="btn btn-outline flex-center" style={{ padding: '0.5rem 1rem', gap: '0.5rem' }}>
                 <Share2 size={16} /> Compartir
               </button>
            </div>

            <h1 className="text-h1" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              {article.title}
            </h1>

            <div className="article-content" style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--color-text-main)' }}>
              {article.content.split('\n\n').map((paragraph: string, i: number) => (
                <p key={i} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>
              ))}
            </div>
            
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                H
              </div>
              <div>
                <p style={{ fontWeight: 600 }}>Equipo de HogArtes</p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Administración Global</p>
              </div>
            </div>

          </div>
        </article>

      </div>
    </div>
  );
}
