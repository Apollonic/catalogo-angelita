import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { authService } from '../services/authService';

export const SellerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Rate limit lockout state
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    // Se já estiver autenticado, vai direto para o painel
    if (authService.isAuthenticated()) {
      navigate('/vendedora/painel', { replace: true });
      return;
    }

    const checkStatus = async () => {
      try {
        const rateLimit = authService.getRateLimit();
        if (rateLimit.isLocked) {
          setLockoutSeconds(rateLimit.remainingSeconds);
        }

        const configured = await authService.hasPasswordConfigured();
        setHasPassword(configured);
      } catch (err) {
        console.error('Erro ao checar configuração de senha:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  // Timer regressivo de bloqueio por tentativas
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutSeconds > 0) {
      setErrorMessage(`Acesso bloqueado por segurança. Aguarde ${lockoutSeconds} segundos.`);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, informe a senha.');
      return;
    }

    setSubmitting(true);

    try {
      if (!hasPassword) {
        // Fluxo de Primeiro Acesso
        if (password.trim().length < 6) {
          setErrorMessage('Por segurança, a senha mestra deve ter no mínimo 6 caracteres.');
          setSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('As senhas não coincidem. Digite novamente.');
          setSubmitting(false);
          return;
        }

        await authService.setInitialPassword(password);
        navigate('/vendedora/painel', { replace: true });
      } else {
        // Fluxo de Login por Senha
        const isValid = await authService.verifyPassword(password);
        if (isValid) {
          navigate('/vendedora/painel', { replace: true });
        } else {
          const rateLimit = authService.getRateLimit();
          if (rateLimit.isLocked) {
            setLockoutSeconds(rateLimit.remainingSeconds);
            setErrorMessage('Muitas tentativas incorretas. Acesso bloqueado por 5 minutos por segurança.');
          } else {
            const remainingAttempts = 5 - rateLimit.attempts;
            setErrorMessage(
              `Senha incorreta. Você tem mais ${remainingAttempts} ${
                remainingAttempts === 1 ? 'tentativa' : 'tentativas'
              } antes do bloqueio.`
            );
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar senha.';
      setErrorMessage(msg);
      const rateLimit = authService.getRateLimit();
      if (rateLimit.isLocked) {
        setLockoutSeconds(rateLimit.remainingSeconds);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center p-4">
        <div className="text-center text-[#666666] text-sm">
          Verificando credenciais seguras...
        </div>
      </div>
    );
  }

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="min-h-screen bg-[#faf8f6] flex flex-col justify-between p-4 sm:p-6">
      {/* Botão de retorno */}
      <div className="max-w-md mx-auto w-full pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#a66e58] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a loja pública</span>
        </Link>
      </div>

      {/* Card Centralizado de Autenticação */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="bg-white border border-[#eae4de] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#faf8f6] border border-[#eae4de] text-[#a66e58] mb-3 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">
              {hasPassword ? 'Painel da Vendedora' : 'Configurar Senha de Acesso'}
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5 leading-relaxed">
              {hasPassword
                ? 'Digite sua senha para gerenciar produtos, preços e estoque da loja.'
                : 'Primeiro acesso detectado! Crie sua senha mestra segura (mínimo de 6 caracteres).'}
            </p>
          </div>

          {/* Alerta de Bloqueio por Força Bruta */}
          {isLocked && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
              <Clock className="w-5 h-5 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <strong className="block font-semibold">Acesso bloqueado temporariamente</strong>
                <span>Aguarde {lockoutSeconds} segundos para tentar novamente.</span>
              </div>
            </div>
          )}

          {/* Mensagem de Erro Convencional */}
          {errorMessage && !isLocked && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                {hasPassword ? 'Sua Senha' : 'Nova Senha Mestra'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={hasPassword ? 'Digite a senha...' : 'Mínimo de 6 caracteres...'}
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] placeholder-[#666666]/60 focus:outline-none focus:border-[#a66e58] focus:ring-1 focus:ring-[#a66e58] disabled:bg-gray-100 disabled:opacity-60 transition-all"
                  autoFocus={!isLocked}
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#222222] p-1 disabled:opacity-40"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!hasPassword && (
              <div>
                <label className="block text-xs font-semibold text-[#444444] mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLocked}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha para confirmar..."
                  className="w-full px-3 py-2.5 bg-white border border-[#eae4de] rounded-xl text-sm text-[#222222] placeholder-[#666666]/60 focus:outline-none focus:border-[#a66e58] focus:ring-1 focus:ring-[#a66e58] disabled:bg-gray-100 disabled:opacity-60 transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isLocked}
              className="w-full py-3 px-4 bg-[#a66e58] hover:bg-[#8f5c48] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {submitting
                ? 'Validando...'
                : isLocked
                ? `Bloqueado (${lockoutSeconds}s)`
                : hasPassword
                ? 'Entrar no Painel'
                : 'Salvar Senha e Acessar'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#eae4de] text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#888888]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Proteção Criptográfica SHA-256 • Bloqueio Anti-Força Bruta
            </span>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-[#888888]">
        Catálogo Angelita — Gestão de Catálogo
      </div>
    </div>
  );
};
