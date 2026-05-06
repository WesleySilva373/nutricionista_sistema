import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Leaf } from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from('nutricionistas').insert([
        {
          id: authData.user.id,
          nome: fullName,
          email: email,
        },
      ]);

      if (dbError) {
        console.error('Error saving profile:', dbError);
      }

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
            Crie planos<br />
            alimentares em<br />
            segundos
          </h1>
          <p>
            Gerenciar seus pacientes nunca foi tão fácil. Com o poder da Inteligência Artificial, 
            você cria dietas personalizadas instantaneamente e foca no que realmente importa: a saúde deles.
          </p>
        </div>

        <div className="modern-auth-right">
          <div className="modern-auth-card">
            {error && <div className="error-message" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="fullName">Nome Completo</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Sua saúde em primeiro lugar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Criando conta...' : 'Começar Gratuitamente'}
              </button>
            </form>

            <div className="auth-footer">
              Já tem conta? <Link to="/login">Faça login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
