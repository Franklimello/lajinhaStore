# 📧 Exemplo de Integração Frontend - Envio de E-mails

## 🎯 Integração com React

### 1. Hook Personalizado para Envio de E-mails

```javascript
// hooks/useEmail.js
import { useState } from 'react';

const FIREBASE_FUNCTION_URL = 'https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail';

export const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const enviarEmail = async (dados) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar e-mail');
      }

      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    enviarEmail,
    loading,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(false);
    }
  };
};
```

### 2. Componente de Formulário de Contato

```jsx
// components/FormularioContato.jsx
import React, { useState } from 'react';
import { useEmail } from '../hooks/useEmail';

const FormularioContato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: ''
  });

  const { enviarEmail, loading, error, success, reset } = useEmail();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await enviarEmail(formData);
      setFormData({ nome: '', email: '', mensagem: '' });
    } catch (err) {
      console.error('Erro ao enviar e-mail:', err);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          E-mail Enviado com Sucesso!
        </h3>
        <p className="text-green-700 mb-4">
          Sua mensagem foi enviada. Entraremos em contato em breve.
        </p>
        <button
          onClick={reset}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Enviar Nova Mensagem
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📧 Entre em Contato
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem *
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            required
            rows={5}
            maxLength={5000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite sua mensagem aqui..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.mensagem.length}/5000 caracteres
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </span>
          ) : (
            '📧 Enviar Mensagem'
          )}
        </button>
      </form>
    </div>
  );
};

export default FormularioContato;
```

## 🌐 Integração com JavaScript Puro

### 1. Função de Envio Simples

```javascript
// emailService.js
class EmailService {
  constructor(functionUrl) {
    this.functionUrl = functionUrl;
  }

  async enviarEmail(dados) {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar e-mail');
      }

      return result;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw error;
    }
  }
}

// Uso
const emailService = new EmailService('https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail');

// Exemplo de uso
document.getElementById('formContato').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const dados = {
    nome: formData.get('nome'),
    email: formData.get('email'),
    mensagem: formData.get('mensagem')
  };

  try {
    const result = await emailService.enviarEmail(dados);
    alert('E-mail enviado com sucesso!');
    e.target.reset();
  } catch (error) {
    alert('Erro ao enviar e-mail: ' + error.message);
  }
});
```

### 2. HTML do Formulário

```html
<!-- formulario.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contato - E-commerce</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: red; margin-top: 10px; }
        .success { color: green; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>📧 Entre em Contato</h1>
    
    <form id="formContato">
        <div class="form-group">
            <label for="nome">Nome Completo *</label>
            <input type="text" id="nome" name="nome" required>
        </div>
        
        <div class="form-group">
            <label for="email">E-mail *</label>
            <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
            <label for="mensagem">Mensagem *</label>
            <textarea id="mensagem" name="mensagem" rows="5" required maxlength="5000"></textarea>
        </div>
        
        <button type="submit" id="btnEnviar">📧 Enviar Mensagem</button>
        
        <div id="mensagemStatus"></div>
    </form>

    <script src="emailService.js"></script>
    <script>
        const emailService = new EmailService('https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail');
        
        document.getElementById('formContato').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnEnviar = document.getElementById('btnEnviar');
            const statusDiv = document.getElementById('mensagemStatus');
            
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
            statusDiv.innerHTML = '';
            
            const formData = new FormData(e.target);
            const dados = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                mensagem: formData.get('mensagem')
            };
            
            try {
                const result = await emailService.enviarEmail(dados);
                statusDiv.innerHTML = '<div class="success">✅ E-mail enviado com sucesso!</div>';
                e.target.reset();
            } catch (error) {
                statusDiv.innerHTML = `<div class="error">❌ Erro: ${error.message}</div>`;
            } finally {
                btnEnviar.disabled = false;
                btnEnviar.textContent = '📧 Enviar Mensagem';
            }
        });
    </script>
</body>
</html>
```

## 🔧 Configuração de Ambiente

### 1. Variáveis de Ambiente (React)

```javascript
// .env.local
REACT_APP_FIREBASE_FUNCTION_URL=https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail
```

### 2. Uso com Variáveis de Ambiente

```javascript
const FIREBASE_FUNCTION_URL = process.env.REACT_APP_FIREBASE_FUNCTION_URL || 
  'https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail';
```

## 🛡️ Validações Adicionais

### 1. Validação de E-mail no Frontend

```javascript
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validarFormulario = (dados) => {
  const erros = [];
  
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (!validarEmail(dados.email)) {
    erros.push('E-mail inválido');
  }
  
  if (!dados.mensagem || dados.mensagem.trim().length < 10) {
    erros.push('Mensagem deve ter pelo menos 10 caracteres');
  }
  
  if (dados.mensagem && dados.mensagem.length > 5000) {
    erros.push('Mensagem muito longa (máximo 5000 caracteres)');
  }
  
  return erros;
};
```

## 📊 Monitoramento e Logs

### 1. Adicionar Logs de Debug

```javascript
const enviarEmailComLogs = async (dados) => {
  console.log('Iniciando envio de e-mail:', {
    timestamp: new Date().toISOString(),
    dados: { ...dados, mensagem: dados.mensagem.substring(0, 50) + '...' }
  });
  
  try {
    const result = await enviarEmail(dados);
    console.log('E-mail enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};
```

## 🚀 Próximos Passos

1. **Implementar rate limiting** no frontend
2. **Adicionar captcha** para evitar spam
3. **Implementar retry logic** para falhas temporárias
4. **Adicionar loading states** mais sofisticados
5. **Implementar cache** para evitar envios duplicados
