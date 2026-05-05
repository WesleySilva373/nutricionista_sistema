import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Coffee, 
  Sun, 
  Apple, 
  Utensils, 
  Moon,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';

interface MealPlanGeneratorProps {
  patient: any;
  onSave: (content: any) => Promise<void>;
  saving: boolean;
}

export const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ patient, onSave, saving }) => {
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const generateMealPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
      });

      if (!response.ok) {
        let errorMsg = `Erro ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setMealPlan(data);
      // Auto-expand first day
      if (data.plano_semanal && data.plano_semanal.length > 0) {
        setExpandedDay(data.plano_semanal[0].dia);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOption = (dayIndex: number, mealKey: string, optionIndex: number, newValue: string) => {
    const newPlan = { ...mealPlan };
    newPlan.plano_semanal[dayIndex].refeicoes[mealKey][optionIndex] = newValue;
    setMealPlan(newPlan);
  };

  const handleAddOption = (dayIndex: number, mealKey: string) => {
    const newPlan = { ...mealPlan };
    newPlan.plano_semanal[dayIndex].refeicoes[mealKey].push('');
    setMealPlan(newPlan);
  };

  const handleRemoveOption = (dayIndex: number, mealKey: string, optionIndex: number) => {
    const newPlan = { ...mealPlan };
    newPlan.plano_semanal[dayIndex].refeicoes[mealKey].splice(optionIndex, 1);
    setMealPlan(newPlan);
  };

  const getMealIcon = (key: string) => {
    switch (key) {
      case 'cafe_da_manha': return <Coffee size={18} />;
      case 'lanche_manha': return <Apple size={18} />;
      case 'almoco': return <Sun size={18} />;
      case 'lanche_tarde': return <Apple size={18} />;
      case 'jantar': return <Moon size={18} />;
      default: return <Utensils size={18} />;
    }
  };

  const getMealLabel = (key: string) => {
    switch (key) {
      case 'cafe_da_manha': return 'Café da Manhã';
      case 'lanche_manha': return 'Lanche da Manhã';
      case 'almoco': return 'Almoço';
      case 'lanche_tarde': return 'Lanche da Tarde';
      case 'jantar': return 'Jantar';
      default: return key.replace(/_/g, ' ');
    }
  };

  return (
    <div className="meal-plan-generator" style={{ marginTop: '3rem', borderTop: '2px solid #f1f5f9', paddingTop: '3rem' }}>
      {!mealPlan && !loading && (
        <div className="empty-state" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          backgroundColor: 'white', 
          borderRadius: '24px', 
          border: '2px dashed #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            backgroundColor: '#f0fdf4', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary-color)'
          }}>
            <Sparkles size={40} fill="var(--primary-color)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
              Plano Alimentar Inteligente
            </h3>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              Nossa IA analisará os dados clínicos, objetivos e restrições de <strong>{patient.nome}</strong> para criar um plano semanal único.
            </p>
          </div>
          <button 
            className="btn-primary" 
            style={{ 
              width: 'auto', 
              padding: '1rem 2.5rem', 
              fontSize: '1.1rem', 
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(46, 204, 113, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }} 
            onClick={generateMealPlan}
          >
            <Sparkles size={22} /> Começar Geração
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem' }}>
            <Loader2 size={100} className="animate-spin" color="var(--primary-color)" style={{ opacity: 0.2 }} />
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: 'var(--primary-color)'
            }}>
              <Sparkles size={40} className="animate-pulse" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Criando o Plano Ideal...</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Processando restrições e calculando sugestões nutricionais.</p>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#fef2f2', 
          color: '#ef4444', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          marginBottom: '2rem',
          border: '1px solid #fee2e2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={24} />
            <strong style={{ fontSize: '1.1rem' }}>Ops! Ocorreu um erro:</strong>
          </div>
          <p>{error}</p>
          <button 
            className="btn-secondary" 
            style={{ backgroundColor: 'white', border: '1px solid #fee2e2', color: '#ef4444' }} 
            onClick={generateMealPlan}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {mealPlan && !loading && (
        <div className="generated-plan-container animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2.5rem',
            padding: '1.5rem 2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Sugestão de Plano Semanal</h3>
              <p style={{ color: '#64748b', margin: '4px 0 0' }}>Revise as opções abaixo e clique para editar se necessário.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setMealPlan(null)} 
                style={{ 
                  background: 'none', 
                  border: '1px solid #cbd5e1', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#64748b'
                }}
              >
                Descartar
              </button>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', backgroundColor: '#059669', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '10px' }} 
                onClick={() => onSave(mealPlan)}
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Salvando...' : 'Salvar Plano'}
              </button>
            </div>
          </div>

          <div className="days-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {mealPlan.plano_semanal.map((dia: any, dayIndex: number) => (
              <div key={dia.dia} className="day-card" style={{ 
                backgroundColor: 'white', 
                borderRadius: '20px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', 
                overflow: 'hidden', 
                border: '1px solid #f1f5f9',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div 
                  className="day-header" 
                  onClick={() => setExpandedDay(expandedDay === dia.dia ? null : dia.dia)}
                  style={{ 
                    padding: '1.5rem 2rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    backgroundColor: expandedDay === dia.dia ? '#f0fdf4' : 'white',
                    borderBottom: expandedDay === dia.dia ? '1px solid #dcfce7' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--primary-color)', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 6px -1px rgba(46, 204, 113, 0.2)'
                    }}>
                      {dia.dia.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-color)' }}>{dia.dia}</span>
                  </div>
                  {expandedDay === dia.dia ? <ChevronUp size={28} color="var(--primary-color)" /> : <ChevronDown size={28} color="#94a3b8" />}
                </div>

                {expandedDay === dia.dia && (
                  <div className="day-body" style={{ padding: '2.5rem' }}>
                    <div className="meals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                      {Object.entries(dia.refeicoes).map(([mealKey, options]: [string, any]) => (
                        <div key={mealKey} className="meal-section" style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            marginBottom: '1.5rem', 
                            paddingBottom: '0.75rem',
                            borderBottom: '2px solid #f1f5f9'
                          }}>
                            <div style={{ color: 'var(--primary-color)', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '10px' }}>
                              {getMealIcon(mealKey)}
                            </div>
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '0.95rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.15em',
                              color: '#64748b'
                            }}>
                              {getMealLabel(mealKey)}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {options.map((option: string, optIndex: number) => (
                              <div key={optIndex} className="option-input-wrapper group" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ 
                                  flex: 1, 
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <input 
                                    type="text" 
                                    value={option} 
                                    onChange={(e) => handleEditOption(dayIndex, mealKey, optIndex, e.target.value)}
                                    placeholder="Adicione um alimento..."
                                    style={{ 
                                      width: '100%',
                                      padding: '0.85rem 1.15rem', 
                                      fontSize: '1rem',
                                      border: '2px solid #f1f5f9',
                                      borderRadius: '12px',
                                      backgroundColor: '#f8fafc',
                                      transition: 'all 0.2s',
                                      outline: 'none',
                                      color: 'var(--text-color)',
                                      fontWeight: 500
                                    }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(46, 204, 113, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f8fafc';
                                      e.currentTarget.style.borderColor = '#f1f5f9';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  />
                                </div>
                                <button 
                                  onClick={() => handleRemoveOption(dayIndex, mealKey, optIndex)}
                                  style={{ 
                                    background: '#fee2e2', 
                                    border: 'none', 
                                    color: '#ef4444', 
                                    cursor: 'pointer', 
                                    padding: '10px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    opacity: 0.7
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                                  title="Remover item"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => handleAddOption(dayIndex, mealKey)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: 'white', 
                                border: '2px dashed #2ecc71', 
                                color: 'var(--primary-color)', 
                                cursor: 'pointer', 
                                fontSize: '0.9rem', 
                                fontWeight: 700, 
                                padding: '0.85rem',
                                borderRadius: '12px',
                                marginTop: '0.5rem',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0fdf4';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <Plus size={18} /> Adicionar Opção
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '3.5rem', 
            padding: '2.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '24px',
            border: '2px solid #dcfce7',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ color: 'var(--primary-color)', backgroundColor: 'white', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <Save size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Tudo pronto!</h4>
              <p style={{ color: '#166534', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                Revise as opções acima e clique no botão para salvar o plano no perfil de {patient.nome}.
              </p>
            </div>
            <button 
              className="btn-primary" 
              style={{ 
                width: 'auto', 
                backgroundColor: '#059669', 
                padding: '1.25rem 4rem', 
                fontSize: '1.2rem',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }} 
              onClick={() => onSave(mealPlan)}
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              {saving ? 'Salvando...' : 'Salvar Plano Alimentar Completo'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

