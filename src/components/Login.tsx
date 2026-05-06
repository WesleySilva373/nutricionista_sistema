import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Leaf, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email ou senha inválidos.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="modern-auth-content">
        <div className="modern-auth-left">
          <div className="modern-auth-logo">
            <Leaf size={36} />
            <span>NutriSystem</span>
          </div>
          <h1>
            Bem-vindo<br />
            de volta
          </h1>
          <p>
            Acesse seu painel para visualizar o progresso de seus pacientes, criar novos 
            planos alimentares com IA e gerenciar sua clínica de onde estiver.
          </p>
        </div>

        <div className="modern-auth-right">
          <div className="modern-auth-card">
            {error && <div className="error-message" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {loading ? 'Entrando...' : <><LogIn size={20} /> Entrar no sistema</>}
              </button>
            </form>

            <div className="auth-footer">
              Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
