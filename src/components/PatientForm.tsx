import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

const RESTRICOES_OPTIONS = [
  'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'
];

const ALERGIAS_OPTIONS = [
  'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'
];

export const PatientForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_activity: '',
    patologias: [] as string[],
    patologias_outro: '',
    restricoes: [] as string[],
    restricoes_outro: '',
    alergias: [] as string[],
    alergias_outro: '',
    medicamentos: '',
    suplementos: '',
    refeicoes_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_desc: '',
    observacoes: ''
  });

  // Derived Values
  const getAge = () => {
    if (!formData.data_nascimento) return null;
    const birth = new Date(formData.data_nascimento);
    const today = new Date();
    let ageVal = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      ageVal--;
    }
    return ageVal;
  };

  const getImc = () => {
    if (formData.peso_inicial && formData.altura) {
      const p = parseFloat(formData.peso_inicial);
      const h = parseFloat(formData.altura) / 100;
      if (h > 0) {
        return (p / (h * h)).toFixed(1);
      }
    }
    return null;
  };

  const age = getAge();
  const imc = getImc();

  const formatPhone = (value: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'whatsapp') {
      val = formatPhone(val as string);
    }
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleToggleOption = (listName: 'objetivos' | 'patologias' | 'restricoes' | 'alergias', value: string) => {
    setFormData(prev => {
      const list = [...prev[listName]];
      const index = list.indexOf(value);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(value);
      }
      return { ...prev, [listName]: list };
    });
  };

  const formatTime = (value: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    let h = '00';
    let m = '00';

    if (digits.length <= 2) {
      h = digits.padStart(2, '0');
    } else if (digits.length === 3) {
      h = digits.substring(0, 1).padStart(2, '0');
      m = digits.substring(1).padStart(2, '0');
    } else {
      h = digits.substring(0, 2);
      m = digits.substring(2, 4);
    }

    // Caps
    if (parseInt(h) > 23) h = '23';
    if (parseInt(m) > 59) m = '59';

    return `${h}:${m}`;
  };

  const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: formatTime(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from('pacientes').insert([{
        nutricionista_id: user.id,
        nome: formData.nome,
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivos: formData.objetivos,
        objetivo_texto: formData.objetivo_texto || null,
        nivel_atividade: formData.nivel_activity || null,
        patologias: formData.patologias,
        restricoes_alimentares: formData.restricoes,
        alergias: formData.alergias,
        medicamentos: formData.medicamentos || null,
        suplementos: formData.suplementos || null,
        refeicoes_por_dia: formData.refeicoes_dia ? parseInt(formData.refeicoes_dia) : null,
        horario_acorda: formData.horario_acorda || null,
        horario_dorme: formData.horario_dorme || null,
        litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
        atividade_fisica: formData.atividade_fisica,
        atividade_fisica_descricao: formData.atividade_fisica_desc || null,
        observacoes: formData.observacoes || null
      }]).select();

      if (error) throw error;

      setShowToast(true);
      setTimeout(() => {
        navigate(`/pacientes/${data[0].id}`);
      }, 1500);

    } catch (err: unknown) {
      console.error('Error saving patient:', err);
      setError('Ocorreu um erro ao salvar o paciente. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="content-header-flex">
          <div>
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1>Novo Paciente</h1>
            <p>Preencha os dados para cadastrar um novo paciente.</p>
          </div>
        </header>

        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="tabs-container">
            <button type="button" className={`tab-button ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>Pessoal</button>
            <button type="button" className={`tab-button ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>Clínico</button>
            <button type="button" className={`tab-button ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>Hábitos</button>
          </div>

          <div className="form-card">
            {activeTab === 'pessoal' && (
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Nome Completo*</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: Maria Oliveira" />
                </div>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                  {age !== null && <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '4px', display: 'block' }}>Idade: {age} anos</span>}
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange}>
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>WhatsApp</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" />
                </div>
              </div>
            )}

            {activeTab === 'clinico' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Peso Inicial (kg)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step="0.1" name="peso_inicial" value={formData.peso_inicial} onChange={handleChange} placeholder="70.5" />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>kg</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Altura (cm)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="170" />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>cm</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>IMC</label>
                  <input type="text" value={imc || ''} readOnly style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }} placeholder="Calculado automaticamente" />
                  {imc && <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '4px', display: 'block' }}>Indice de Massa Corporal</span>}
                </div>
                <div className="form-group">
                  <label>Nível de Atividade Física</label>
                  <select name="nivel_activity" value={formData.nivel_activity} onChange={handleChange}>
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
                      <div 
                        key={opt} 
                        className={`option-item ${formData.objetivos.includes(opt) ? 'selected' : ''}`}
                        onClick={() => handleToggleOption('objetivos', opt)}
                      >
                        <div className="option-checkbox"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <input type="text" name="objetivo_texto" value={formData.objetivo_texto} onChange={handleChange} placeholder="Outros detalhes sobre o objetivo..." style={{ marginTop: '1rem' }} />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Patologias ou Condições de Saúde</label>
                  <div className="options-grid">
                    {PATOLOGIAS_OPTIONS.map(opt => (
                      <div 
                        key={opt} 
                        className={`option-item ${formData.patologias.includes(opt) ? 'selected' : ''}`}
                        onClick={() => handleToggleOption('patologias', opt)}
                      >
                        <div className="option-checkbox"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Restrições Alimentares</label>
                  <div className="options-grid">
                    {RESTRICOES_OPTIONS.map(opt => (
                      <div 
                        key={opt} 
                        className={`option-item ${formData.restricoes.includes(opt) ? 'selected' : ''}`}
                        onClick={() => handleToggleOption('restricoes', opt)}
                      >
                        <div className="option-checkbox"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Alergias Alimentares</label>
                  <div className="options-grid">
                    {ALERGIAS_OPTIONS.map(opt => (
                      <div 
                        key={opt} 
                        className={`option-item ${formData.alergias.includes(opt) ? 'selected' : ''}`}
                        onClick={() => handleToggleOption('alergias', opt)}
                      >
                        <div className="option-checkbox"></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Medicamentos contínuos</label>
                  <textarea name="medicamentos" value={formData.medicamentos} onChange={handleChange} rows={2} placeholder="Descreva os medicamentos em uso..."></textarea>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Suplementos em uso</label>
                  <textarea name="suplementos" value={formData.suplementos} onChange={handleChange} rows={2} placeholder="Descreva os suplementos em uso..."></textarea>
                </div>
              </div>
            )}

            {activeTab === 'habitos' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Refeições por dia</label>
                  <input type="number" name="refeicoes_dia" value={formData.refeicoes_dia} onChange={handleChange} placeholder="6" />
                </div>
                <div className="form-group">
                  <label>Quantidade de água (Litros)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step="0.5" name="litros_agua" value={formData.litros_agua} onChange={handleChange} placeholder="2.5" />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>litros</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Horário que acorda</label>
                  <input type="text" name="horario_acorda" value={formData.horario_acorda} onChange={handleChange} onBlur={handleTimeBlur} placeholder="06:30" />
                </div>
                <div className="form-group">
                  <label>Horário que dorme</label>
                  <input type="text" name="horario_dorme" value={formData.horario_dorme} onChange={handleChange} onBlur={handleTimeBlur} placeholder="23:00" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" name="atividade_fisica" checked={formData.atividade_fisica} onChange={handleChange} style={{ width: 'auto' }} />
                    Pratica atividade física?
                  </label>
                </div>
                {formData.atividade_fisica && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Qual atividade e frequência semanal?</label>
                    <input type="text" name="atividade_fisica_desc" value={formData.atividade_fisica_desc} onChange={handleChange} placeholder="Ex: Musculação, 4x por semana" />
                  </div>
                )}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Observações gerais</label>
                  <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={4} placeholder="Informações adicionais importantes..."></textarea>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/pacientes')}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ marginTop: 0, paddingLeft: '2rem', paddingRight: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
                {loading ? 'Salvando...' : <><Save size={18} /> Salvar Paciente</>}
              </button>
            </div>
          </div>
        </form>
      </main>

      {showToast && (
        <div className="toast">
          <CheckCircle size={20} />
          Paciente cadastrado com sucesso!
        </div>
      )}
    </div>
  );
};
