import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Plus, 
  FileText, 
  Save, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { MealPlanGenerator } from './MealPlanGenerator';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

type TabType = 'pessoal' | 'clinico' | 'habitos';

const OBJETIVOS_OPTIONS = [
  'Emagrecer', 'Ganhar massa', 'Controlar diabetes', 
  'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'
];

const PATOLOGIAS_OPTIONS = [
  'Diabetes', 'Hipertensão', 'Hipotireoidismo', 
  'Hipertireoidismo', 'Síndrome do ovário policístico', 
  'Doença celíaca', 'Colesterol alto'
];

interface Consultation {
  id: string;
  paciente_id: string;
  data_consulta: string;
  peso: number;
  cintura: number | null;
  quadril: number | null;
  percentual_gordura: number | null;
  observacoes: string | null;
  proximo_retorno: string | null;
}

interface MealPlan {
  id: string;
  paciente_id: string;
  conteudo: any;
  created_at: string;
}

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Patient Data
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  
  // Modal State
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Fetch Patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch Consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });

      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData || []);

      // Fetch Meal Plans
      const { data: plansData, error: plansError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;
      setMealPlans(plansData || []);

    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Erro ao carregar dados do paciente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .update({
          nome: patient.nome,
          data_nascimento: patient.data_nascimento,
          sexo: patient.sexo,
          whatsapp: patient.whatsapp,
          email: patient.email,
          peso_inicial: parseFloat(patient.peso_inicial),
          altura: parseFloat(patient.altura),
          objetivos: patient.objetivos,
          objetivo_texto: patient.objetivo_texto,
          nivel_atividade: patient.nivel_atividade,
          patologias: patient.patologias,
          restricoes_alimentares: patient.restricoes_alimentares,
          alergias: patient.alergias,
          medicamentos: patient.medicamentos,
          suplementos: patient.suplementos,
          refeicoes_por_dia: parseInt(patient.refeicoes_por_dia),
          horario_acorda: patient.horario_acorda,
          horario_dorme: patient.horario_dorme,
          litros_agua: parseFloat(patient.litros_agua),
          atividade_fisica: patient.atividade_fisica,
          atividade_fisica_descricao: patient.atividade_fisica_descricao,
          observacoes: patient.observacoes
        })
        .eq('id', id);

      if (error) throw error;
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('consultas')
        .insert([{
          paciente_id: id,
          data_consulta: newConsultation.data_consulta,
          peso: parseFloat(newConsultation.peso),
          cintura: newConsultation.cintura ? parseFloat(newConsultation.cintura) : null,
          quadril: newConsultation.quadril ? parseFloat(newConsultation.quadril) : null,
          percentual_gordura: newConsultation.percentual_gordura ? parseFloat(newConsultation.percentual_gordura) : null,
          observacoes: newConsultation.observacoes || null,
          proximo_retorno: newConsultation.proximo_retorno || null
        }]);

      if (error) throw error;

      setShowConsultationModal(false);
      setNewConsultation({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      });
      
      fetchPatientData(); // Refresh data
    } catch (err) {
      console.error('Error adding consultation:', err);
      setError('Erro ao salvar consulta.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMealPlan = async (conteudo: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('planos_alimentares')
        .insert([{
          paciente_id: id,
          conteudo: conteudo
        }]);

      if (error) throw error;

      setIsGenerating(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchPatientData(); // Refresh list
    } catch (err) {
      console.error('Error saving meal plan:', err);
      setError('Erro ao salvar plano alimentar.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewPlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleToggleOption = (listName: string, value: string) => {
    const list = [...(patient[listName] || [])];
    const index = list.indexOf(value);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(value);
    }
    setPatient({ ...patient, [listName]: list });
  };

  const formatDataForChart = () => {
    const sorted = [...consultations].sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime());
    return sorted.map(c => ({
      date: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: c.peso
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="auth-subtitle">Carregando dados do paciente...</div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="error-message">Paciente não encontrado.</div>
          <button className="btn-secondary" onClick={() => navigate('/pacientes')}>Voltar</button>
        </main>
      </div>
    );
  }

  const chartData = formatDataForChart();

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="content-header-flex">
          <div>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/pacientes')}>
              <ArrowLeft size={16} /> Voltar para lista
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div>
                <h1 style={{ marginBottom: 0 }}>{patient.nome}</h1>
                <p style={{ margin: 0 }}>Paciente desde {formatDate(patient.created_at)}</p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* SECTION 1: DADOS DO PACIENTE */}
        <section className="profile-section">
          <div className="section-header">
            <h2><User size={24} /> Dados do Paciente</h2>
          </div>

          <div className="tabs-container">
            <button className={`tab-button ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>Pessoal</button>
            <button className={`tab-button ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>Clínico</button>
            <button className={`tab-button ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>Hábitos</button>
          </div>

          <div className="form-card">
            {activeTab === 'pessoal' && (
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Nome Completo</label>
                  <input type="text" value={patient.nome} onChange={(e) => setPatient({...patient, nome: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input type="date" value={patient.data_nascimento || ''} onChange={(e) => setPatient({...patient, data_nascimento: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select value={patient.sexo || ''} onChange={(e) => setPatient({...patient, sexo: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>WhatsApp</label>
                  <input type="tel" value={patient.whatsapp || ''} onChange={(e) => setPatient({...patient, whatsapp: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>E-mail</label>
                  <input type="email" value={patient.email || ''} onChange={(e) => setPatient({...patient, email: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === 'clinico' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Peso Inicial (kg)</label>
                  <input type="number" step="0.1" value={patient.peso_inicial || ''} onChange={(e) => setPatient({...patient, peso_inicial: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Altura (cm)</label>
                  <input type="number" value={patient.altura || ''} onChange={(e) => setPatient({...patient, altura: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nível de Atividade</label>
                  <select value={patient.nivel_atividade || ''} onChange={(e) => setPatient({...patient, nivel_atividade: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Sedentário">Sedentário</option>
                    <option value="Levemente ativo">Levemente ativo</option>
                    <option value="Moderadamente ativo">Moderadamente ativo</option>
                    <option value="Muito ativo">Muito ativo</option>
                    <option value="Extremamente ativo">Extremamente ativo</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Objetivos</label>
                  <div className="options-grid">
                    {OBJETIVOS_OPTIONS.map(opt => (
                      <div key={opt} className={`option-item ${(patient.objetivos || []).includes(opt) ? 'selected' : ''}`} onClick={() => handleToggleOption('objetivos', opt)}>
                        <div className="option-checkbox"></div> {opt}
                      </div>
                    ))}
                  </div>
                  <input type="text" value={patient.objetivo_texto || ''} onChange={(e) => setPatient({...patient, objetivo_texto: e.target.value})} placeholder="Outros detalhes..." style={{ marginTop: '1rem' }} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Patologias</label>
                  <div className="options-grid">
                    {PATOLOGIAS_OPTIONS.map(opt => (
                      <div key={opt} className={`option-item ${(patient.patologias || []).includes(opt) ? 'selected' : ''}`} onClick={() => handleToggleOption('patologias', opt)}>
                        <div className="option-checkbox"></div> {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Medicamentos em uso</label>
                  <textarea value={patient.medicamentos || ''} onChange={(e) => setPatient({...patient, medicamentos: e.target.value})} rows={2}></textarea>
                </div>
              </div>
            )}

            {activeTab === 'habitos' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Refeições por dia</label>
                  <input type="number" value={patient.refeicoes_por_dia || ''} onChange={(e) => setPatient({...patient, refeicoes_por_dia: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Água (Litros/dia)</label>
                  <input type="number" step="0.5" value={patient.litros_agua || ''} onChange={(e) => setPatient({...patient, litros_agua: e.target.value})} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={patient.atividade_fisica || false} onChange={(e) => setPatient({...patient, atividade_fisica: e.target.checked})} style={{ width: 'auto' }} />
                    Pratica atividade física?
                  </label>
                </div>
                {patient.atividade_fisica && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Descrição da atividade</label>
                    <input type="text" value={patient.atividade_fisica_descricao || ''} onChange={(e) => setPatient({...patient, atividade_fisica_descricao: e.target.value})} />
                  </div>
                )}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Observações</label>
                  <textarea value={patient.observacoes || ''} onChange={(e) => setPatient({...patient, observacoes: e.target.value})} rows={4}></textarea>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn-primary" style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }} onClick={handlePatientUpdate} disabled={saving}>
                {saving ? 'Salvando...' : <><Save size={18} style={{ marginRight: '8px' }} /> Salvar alterações</>}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: CONSULTAS */}
        <section className="profile-section">
          <div className="section-header">
            <h2><TrendingUp size={24} /> Consultas e Evolução</h2>
            <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowConsultationModal(true)}>
              <Plus size={18} style={{ marginRight: '8px' }} /> Nova Consulta
            </button>
          </div>

          {/* Gráfico de Evolução */}
          <div className="chart-container">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#64748b' }}>Evolução de Peso (kg)</h3>
            {consultations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }}
                    itemStyle={{ color: 'var(--primary-color)', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="peso" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorPeso)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                Nenhuma consulta registrada ainda para gerar o gráfico.
              </div>
            )}
          </div>

          {/* Lista de Consultas */}
          <div className="consultation-list">
            {consultations.length > 0 ? (
              consultations.map(cons => (
                <div key={cons.id} className="consultation-item">
                  <div className="consultation-header">
                    <div className="consultation-date">
                      <Calendar size={16} style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      {formatDate(cons.data_consulta)}
                    </div>
                  </div>
                  <div className="consultation-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Peso</span>
                      <span className="metric-value">{cons.peso} kg</span>
                    </div>
                    {cons.cintura && (
                      <div className="metric-item">
                        <span className="metric-label">Cintura</span>
                        <span className="metric-value">{cons.cintura} cm</span>
                      </div>
                    )}
                    {cons.quadril && (
                      <div className="metric-item">
                        <span className="metric-label">Quadril</span>
                        <span className="metric-value">{cons.quadril} cm</span>
                      </div>
                    )}
                    {cons.percentual_gordura && (
                      <div className="metric-item">
                        <span className="metric-label">% Gordura</span>
                        <span className="metric-value">{cons.percentual_gordura}%</span>
                      </div>
                    )}
                  </div>
                  {cons.observacoes && (
                    <div className="consultation-notes">
                      <strong>Observações:</strong> {cons.observacoes}
                    </div>
                  )}
                  {cons.proximo_retorno && (
                    <div className="next-return">
                      <Clock size={14} /> Próximo retorno em {formatDate(cons.proximo_retorno)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-message" style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhuma consulta registrada ainda.
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: PLANOS ALIMENTARES */}
        <section className="profile-section">
          <div className="section-header">
            <h2><FileText size={24} /> Planos Alimentares</h2>
            {!isGenerating ? (
              <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setIsGenerating(true)}>
                <Sparkles size={18} style={{ marginRight: '8px' }} /> Gerar Plano Alimentar
              </button>
            ) : (
              <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => setIsGenerating(false)}>
                Cancelar Geração
              </button>
            )}
          </div>

          {isGenerating ? (
            <MealPlanGenerator patient={patient} onSave={handleSaveMealPlan} saving={saving} />
          ) : (
            <div className="meal-plan-history">
              {mealPlans.length > 0 ? (
                mealPlans.map(plan => (
                  <div key={plan.id} className="meal-plan-item" onClick={() => handleViewPlan(plan)} style={{ cursor: 'pointer' }}>
                    <div className="meal-plan-date">
                      <FileText size={18} color="var(--primary-color)" />
                      Plano gerado em {formatDate(plan.created_at)}
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                ))
              ) : (
                <div className="empty-message" style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum plano alimentar gerado ainda.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modal Visualizar Plano */}
      {showPlanModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="var(--primary-color)" />
                <h2 style={{ margin: 0 }}>Plano Alimentar - {formatDate(selectedPlan.created_at)}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowPlanModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="days-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedPlan.conteudo.plano_semanal.map((dia: any) => (
                  <div key={dia.dia} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{dia.dia}</h3>
                    <div className="meals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      {Object.entries(dia.refeicoes).map(([mealKey, options]: [string, any]) => (
                        <div key={mealKey}>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                            {mealKey.replace(/_/g, ' ')}
                          </h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                            {options.map((opt: string, i: number) => (
                              <li key={i} style={{ marginBottom: '4px', display: 'flex', gap: '6px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1', marginTop: '8px' }}></div>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPlanModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Consulta */}
      {showConsultationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nova Consulta</h2>
              <button className="modal-close" onClick={() => setShowConsultationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddConsultation}>
              <div className="modal-body">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label>Data da Consulta*</label>
                    <input type="date" required value={newConsultation.data_consulta} onChange={(e) => setNewConsultation({...newConsultation, data_consulta: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg)*</label>
                    <input type="number" step="0.1" required value={newConsultation.peso} onChange={(e) => setNewConsultation({...newConsultation, peso: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Cintura (cm)</label>
                    <input type="number" step="0.1" value={newConsultation.cintura} onChange={(e) => setNewConsultation({...newConsultation, cintura: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quadril (cm)</label>
                    <input type="number" step="0.1" value={newConsultation.quadril} onChange={(e) => setNewConsultation({...newConsultation, quadril: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>% de Gordura</label>
                    <input type="number" step="0.1" value={newConsultation.percentual_gordura} onChange={(e) => setNewConsultation({...newConsultation, percentual_gordura: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Próximo Retorno</label>
                    <input type="date" value={newConsultation.proximo_retorno} onChange={(e) => setNewConsultation({...newConsultation, proximo_retorno: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Observações</label>
                    <textarea value={newConsultation.observacoes} onChange={(e) => setNewConsultation({...newConsultation, observacoes: e.target.value})} rows={3}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowConsultationModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Consulta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast">
          <CheckCircle size={20} />
          Alterações salvas com sucesso!
        </div>
      )}
    </div>
  );
};
