import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ArrowLeft, User } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="content-header-flex">
          <div>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/pacientes')}>
              <ArrowLeft size={16} /> Voltar para lista
            </button>
            <h1>Perfil do Paciente</h1>
            <p>ID do Paciente: {id}</p>
          </div>
        </header>

        <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} />
          </div>
          <h2>Página em Desenvolvimento</h2>
          <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>
            A tela de visualização detalhada e evolução do paciente estará disponível em breve.
          </p>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/pacientes')}>
            Voltar para a listagem
          </button>
        </div>
      </main>
    </div>
  );
};
