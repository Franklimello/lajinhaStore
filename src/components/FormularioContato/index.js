import React, { useState } from 'react';
import { FaEnvelope, FaUser, FaComment, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const FormularioContato = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // URL da função Firebase (será configurada após o deploy)
  const FIREBASE_FUNCTION_URL = 'https://us-central1-compreaqui-324df.cloudfunctions.net/enviarEmail';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar e-mail');
      }

      setSuccess(true);
      setFormData({ nome: '', email: '', mensagem: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-6">
            <FaCheck />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            E-mail Enviado com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua mensagem foi enviada. Entraremos em contato em breve.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Enviar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-blue-600 text-4xl mb-4">
            <FaEnvelope />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Entre em Contato
          </h1>
          <p className="text-gray-600">
            Envie sua mensagem e entraremos em contato em breve
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="mensagem" className="block text-sm font-semibold text-gray-700 mb-2">
              <FaComment className="inline mr-2" />
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Digite sua mensagem aqui..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.mensagem.length}/5000 caracteres
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-3" />
                Enviando...
              </span>
            ) : (
              '📧 Enviar Mensagem'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sua mensagem será enviada para: frank.melo.wal@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormularioContato;
