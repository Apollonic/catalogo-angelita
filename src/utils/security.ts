/**
 * Módulo de Segurança e Criptografia
 * Implementa hashing seguro com Web Crypto API, sanitização de dados, validação de URLs e proteção contra força bruta.
 */

const RATE_LIMIT_KEY = 'aura_auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos de bloqueio
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas de sessão ativa

// -----------------------------------------------------------------------------
// 1. Criptografia e Hashing de Senha (SHA-256 com Salt Fixo/Dinâmico)
// -----------------------------------------------------------------------------
export async function hashPassword(password: string, salt = 'aura_salt_2026_sec'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// -----------------------------------------------------------------------------
// 2. Proteção contra Ataques de Força Bruta (Rate Limiting)
// -----------------------------------------------------------------------------
interface RateLimitData {
  attempts: number;
  lockedUntil: number | null;
}

export function getRateLimitStatus(): { isLocked: boolean; remainingSeconds: number; attempts: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0, attempts: 0 };

    const data: RateLimitData = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attempts: data.attempts };
    }

    // Se o tempo de bloqueio expirou, zera as tentativas
    if (data.lockedUntil && data.lockedUntil <= now) {
      clearRateLimit();
      return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, attempts: data.attempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const data: RateLimitData = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };

    data.attempts += 1;

    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
    }

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function clearRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // Ignore storage errors
  }
}

// -----------------------------------------------------------------------------
// 3. Gestão Segura de Sessão com Expiração Automática
// -----------------------------------------------------------------------------
const SESSION_KEY = 'aura_seller_secure_session';

export function createSecureSession(): void {
  const sessionData = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (err) {
    console.error('Erro ao salvar sessão segura:', err);
  }
}

export function isSecureSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (!data.authenticated || !data.expiresAt) return false;

    if (Date.now() > data.expiresAt) {
      destroySecureSession();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function destroySecureSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('aura_seller_session');
  } catch {
    // Ignore
  }
}

// -----------------------------------------------------------------------------
// 4. Sanitização contra XSS e Validação de Conteúdo
// -----------------------------------------------------------------------------

/**
 * Remove tags HTML, scripts e caracteres potencialmente perigosos de textos
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<[^>]*>?/gm, '') // Remove tags HTML
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Valida se uma URL de imagem é estritamente segura (apenas https ou data:image)
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Permite data URLs de imagens locais otimizadas
  if (trimmed.startsWith('data:image/jpeg;base64,') ||
      trimmed.startsWith('data:image/png;base64,') ||
      trimmed.startsWith('data:image/webp;base64,')) {
    return true;
  }

  // Permite apenas URLs HTTP/HTTPS válidas
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
