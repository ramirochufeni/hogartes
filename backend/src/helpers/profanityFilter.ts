/**
 * Simple Spanish profanity filter.
 * Validates content in reviews, questions, and answers.
 */
const BLOCKED_TERMS = [
  'idiota', 'imbecil', 'imbécil', 'estupido', 'estúpido', 'estupida', 'estúpida',
  'tonto', 'tonta', 'bobo', 'boba', 'tarado', 'tarada', 'pelotudo', 'pelotuda',
  'boludo', 'boluda', 'cretino', 'cretina', 'inutil', 'inútil',
  'puta', 'puto', 'mierda', 'carajo', 'concha', 'verga', 'pene', 'culo', 'caca',
  'joder', 'coño', 'cabron', 'cabrón', 'gilipollas', 'pendejo', 'pendeja',
  'hdp', 'hijo de puta', 'hija de puta',
  'negro', 'negra', 'gordo', 'gorda', 'marica', 'maricón', 'travelo', 'trolo',
  'matar', 'muerte', 'amenaza', 'golpear',
  'basura', 'malo', 'pésimo', 'horrible', 'asqueroso'
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED_TERMS.some(term => {
    const normalizedTerm = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedTerm);
  });
}

export { BLOCKED_TERMS };
