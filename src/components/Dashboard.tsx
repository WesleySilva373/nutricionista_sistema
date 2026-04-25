import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { 
  Users, 
  ChevronRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Patient {
  id: string;
  nome: string;
  consultas?: {
    data_consulta: string;
    proximo_retorno: string | null;
  }[];
}

interface PatientData {
  id: string;
  nome: string;
  consultas: {
    data_consulta: string;
    proximo_retorno: string | null;
  }[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [weekConsultations, setWeekConsultations] = useState<number>(0);
  const [patientsWithoutReturn, setPatientsWithoutReturn] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Total Patients
      const { count: patientsCount, error: patientsError } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user.id);

      if (patientsError) throw patientsError;
      setTotalPatients(patientsCount || 0);

      // 2. Consultations this week
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6)).toISOString().split('T')[0];

      const { count: consultationsCount, error: consultationsError } = await supabase
        .from('consultas')
        .select('id, pacientes!inner(id)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user.id)
        .gte('data_consulta', firstDay)
        .lte('data_consulta', lastDay);

      if (consultationsError) throw consultationsError;
      setWeekConsultations(consultationsCount || 0);

      // 3. Patients without return
      const { data: patientsData, error: listError } = await supabase
        .from('pacientes')
        .select('id, nome, consultas(data_consulta, proximo_retorno)')
        .eq('nutricionista_id', user.id);

      if (listError) throw listError;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const todayStr = new Date().toISOString().split('T')[0];

      const noReturn = ((patientsData as unknown as PatientData[]) || []).filter(p => {
        const consults = p.consultas || [];
        if (consults.length === 0) return false;

        const sorted = [...consults].sort((a, b) => 
          new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
        );
        const lastConsult = sorted[0];
        const lastDate = new Date(lastConsult.data_consulta);

        const hasFutureReturn = consults.some(c => 
          c.proximo_retorno && c.proximo_retorno > todayStr
        );

        return lastDate < thirtyDaysAgo && !hasFutureReturn;
      });

      setPatientsWithoutReturn(noReturn);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const initFetch = async () => {
      await fetchDashboardData();
    };
    initFetch();
  }, [fetchDashboardData]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="header-section">
          <h1>Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Nutricionista'}</h1>
          <p>Confira o resumo da sua clínica hoje.</p>
        </header>

        <div className="cards-grid">
          <div className="dashboard-card">
            <div className="card-title">
              <Users size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} />
              Total de Pacientes
            </div>
            {loading ? (
              <div className="card-value">...</div>
            ) : (
              <div className="card-value">{totalPatients}</div>
            )}
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Pacientes ativos no sistema
            </p>
          </div>

          <div className="dashboard-card">
            <div className="card-title">
              <Calendar size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} />
              Consultas da Semana
            </div>
            {loading ? (
              <div className="card-value">...</div>
            ) : (
              <div className="card-value">{weekConsultations}</div>
            )}
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Registradas nos últimos 7 dias
            </p>
          </div>

          <div className="dashboard-card">
            <div className="card-title">
              <AlertCircle size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} />
              Pacientes sem retorno
            </div>
            {loading ? (
              <div className="empty-message">Carregando lista...</div>
            ) : patientsWithoutReturn.length > 0 ? (
              <ul className="no-return-list">
                {patientsWithoutReturn.slice(0, 5).map(patient => (
                  <li key={patient.id} className="no-return-item">
                    <Link to={`/pacientes/${patient.id}`} className="patient-link">
                      {patient.nome}
                    </Link>
                    <ChevronRight size={16} color="#94a3b8" />
                  </li>
                ))}
                {patientsWithoutReturn.length > 5 && (
                  <li className="no-return-item">
                    <Link to="/pacientes" className="patient-link" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                      Ver todos os {patientsWithoutReturn.length} pacientes
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <p className="empty-message">Nenhum paciente sem retorno no momento</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
