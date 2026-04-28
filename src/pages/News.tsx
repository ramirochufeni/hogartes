import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { ArrowRight, Calendar } from 'lucide-react';

export default function News() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/news')
      .then(res => setNewsList(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = newsList.find(n => n.isFeatured) || newsList[0];
  const others = newsList.filter(n => n.id !== featured?.id);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', padding: '3rem 1.25rem', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <header className="flex-between" style={{ marginBottom: '3rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 className="text-h1">Novedades y Noticias</h1>
          <p className="text-muted hide-mobile">Enterate de las últimas actualizaciones de la plataforma.</p>
        </header>

        {loading ? (
           <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>Cargando articulos...</div>
        ) : newsList.length === 0 ? (
           <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>No hay noticias publicadas aún.</div>
        ) : (
          <>
            {featured && (
              <Link to={`/noticias/${featured.id}`} className="card" style={{ display: 'block', padding: 0, overflow: 'hidden', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ height: '350px', width: '100%', position: 'relative', backgroundColor: 'var(--color-bg)' }}>
                   {featured.imageUrl && <img src={`http://localhost:5000${featured.imageUrl}`} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                </div>
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '2.5rem', color: 'white', maxWidth: '800px' }}>
                   {featured.isFeatured && <span className="badge badge-blue">Destacado</span>}
                   <h2 className="text-h2" style={{ color: 'white', fontSize: '2.5rem', marginTop: '1rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{featured.title}</h2>
                </div>
              </Link>
            )}

            <div className="grid-3" style={{ gap: '2rem' }}>
              {others.map(article => (
                <Link to={`/noticias/${article.id}`} key={article.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-bg)' }}>
                     {article.imageUrl && <img src={`http://localhost:5000${article.imageUrl}`} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                   </div>
                   <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                     <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                       <Calendar size={14} />
                       <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{article.title}</h3>
                     
                     <span className="text-hover-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: 'auto' }}>
                       Leer completo <ArrowRight size={16} />
                     </span>
                   </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
