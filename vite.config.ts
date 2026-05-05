import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'api-relay',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/gerar-plano' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const patientData = JSON.parse(body);
                  const apiKey = env.GOOGLE_API_KEY;

                  if (!apiKey) {
                    throw new Error('Chave GOOGLE_API_KEY não encontrada no seu arquivo .env local.');
                  }

                  const prompt = `
Você é um nutricionista profissional.
Gere um plano alimentar semanal com base nos dados abaixo.

⚠️ Regras:
- Responda APENAS em JSON válido
- Não use markdown
- Não escreva explicações
- Respeite restrições e alergias

Dados do paciente:
${JSON.stringify(patientData, null, 2)}

Formato obrigatório:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["", "", "", "", ""],
        "lanche_manha": ["", "", "", "", ""],
        "almoco": ["", "", "", "", ""],
        "lanche_tarde": ["", "", "", "", ""],
        "jantar": ["", "", "", "", ""]
      }
    }
  ]
}

Regras:
- gerar 7 dias
- 5 opções por refeição
- evitar repetição
- usar alimentos comuns no Brasil
`;

                  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }]
                    })
                  });

                  const data = await response.json() as any;
                  if (data.error) throw new Error(data.error.message);

                  let content = data.candidates[0].content.parts[0].text;
                  content = content.replace(/```json\n?|```/g, '').trim();
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(content);
                } catch (error: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
