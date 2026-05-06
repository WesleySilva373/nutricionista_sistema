import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { 
  Plus, 
  Search, 
  User, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Patient {
  id: string;
  nome: string;
  objetivos: string[];
  consultas: { data_consulta: string }[];
}

export const PatientList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, objetivos, consultas(data_consulta)')
        .eq('nutricionista_id', user.id)
        .order('nome');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const initFetch = async () => {
      await fetchPatients();
    };
    initFetch();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastConsultationDate = (consultas: { data_consulta: string }[]) => {
    if (!consultas || consultas.length === 0) return 'Nenhuma consulta';
    const sorted = [...consultas].sort((a, b) => 
      new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
    );
    return new Date(sorted[0].data_consulta).toLocaleDateString('pt-BR');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="content-header-flex">
          <div>
            <h1>Pacientes</h1>
            <p>Gerencie seus pacientes cadastrados</p>
          </div>
          <button 
            className="btn-primary" 
            style={{ marginTop: 0, paddingLeft: '1.5rem', paddingRight: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate('/pacientes/novo')}
          >
            <Plus size={20} />
            Novo Paciente
          </button>
        </header>

        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Objetivo</th>
                  <th>Última Consulta</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id} onClick={() => navigate(`/pacientes/${patient.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 240, 255, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{patient.nome}</span>
                      </div>
                    </td>
                    <td>{patient.objetivos?.join(', ') || 'Nenhum'}</td>
                    <td>{getLastConsultationDate(patient.consultas)}</td>
                    <td><ChevronRight size={20} color="#cbd5e1" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="form-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p className="empty-message">Nenhum paciente encontrado.</p>
            {searchTerm && <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.5rem' }}>Tente buscar por outro nome.</p>}
            {!searchTerm && !patients.length && (
              <button 
                className="btn-primary" 
                style={{ width: 'auto', margin: '1.5rem auto 0' }}
                onClick={() => navigate('/pacientes/novo')}
              >
                Cadastrar Primeiro Paciente
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
