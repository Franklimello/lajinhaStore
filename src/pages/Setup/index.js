import { useState, useEffect } from 'react';
import { FaStore, FaPhone, FaFire, FaCreditCard, FaUserShield, FaPalette, FaCheckCircle, FaSpinner, FaArrowRight, FaArrowLeft, FaDownload, FaCopy, FaInfoCircle, FaClock, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaBook, FaSearch, FaKey, FaIdCard, FaServer, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Informações da Loja', icon: FaStore },
  { id: 2, title: 'Contato', icon: FaPhone },
  { id: 3, title: 'Firebase', icon: FaFire },
  { id: 4, title: 'Pagamento PIX', icon: FaCreditCard },
  { id: 5, title: 'Administradores', icon: FaUserShield },
  { id: 6, title: 'Temas (Opcional)', icon: FaPalette },
];

export default function Setup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Informações da Loja
    storeName: '',
    storeSubtitle: '',
    appUrl: '',
    appDescription: '',
    
    // Horário de Atendimento
    weekdaysLabel: 'Segunda a Sábado',
    weekdaysTime: '8h às 19h',
    weekdaysTimeFormatted: '08:00 - 19:00',
    sundayLabel: 'Domingo',
    sundayTime: '8h às 11h',
    sundayTimeFormatted: '08:00 - 11:00',
    deliveryTime: '30 a 60 minutos',
    
    // Contato
    contactPhone: '',
    contactAddress: '',
    whatsappNumber: '',
    
    // Firebase
    firebaseApiKey: '',
    firebaseAuthDomain: '',
    firebaseProjectId: '',
    firebaseStorageBucket: '',
    firebaseMessagingSenderId: '',
    firebaseAppId: '',
    firebaseMeasurementId: '',
    firebaseVapidKey: '',
    
    // PIX
    pixKey: '',
    pixCity: '',
    pixReceiverName: '',
    
    // Admins
    adminUid1: '',
    adminUid2: '',
    
    // Analytics
    gaId: '',
    
    // Temas
    themePrimary: '#3B82F6',
    themeSecondary: '#8B5CF6',
    gradientPrimary: 'from-blue-500 to-blue-600',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('setupConfig');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar configuração:', e);
      }
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('setupConfig', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const value = formData[field];
    let error = null;

    switch (field) {
      case 'storeName':
        if (!value || value.trim() === '') error = 'Nome da loja é obrigatório';
        break;
      case 'contactPhone':
        if (!value || value.trim() === '') error = 'Telefone é obrigatório';
        break;
      case 'whatsappNumber':
        if (!value || value.trim() === '') {
          error = 'WhatsApp é obrigatório';
        } else if (!/^\d+$/.test(value.replace(/\s/g, ''))) {
          error = 'Apenas números são aceitos';
        }
        break;
      case 'firebaseProjectId':
        if (!value || value.trim() === '') error = 'Firebase Project ID é obrigatório';
        break;
      case 'firebaseApiKey':
        if (!value || value.trim() === '') error = 'Firebase API Key é obrigatória';
        break;
      case 'adminUid1':
        if (!value || value.trim() === '') error = 'Pelo menos um admin é obrigatório';
        break;
      case 'pixKey':
        if (!value || value.trim() === '') error = 'Chave PIX é obrigatória';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateStep = (step) => {
    let isValid = true;
    const fieldsToValidate = {
      1: ['storeName'],
      2: ['contactPhone', 'whatsappNumber', 'contactAddress'],
      3: ['firebaseProjectId', 'firebaseApiKey', 'firebaseAuthDomain', 'firebaseStorageBucket', 'firebaseMessagingSenderId', 'firebaseAppId'],
      4: ['pixKey', 'pixCity', 'pixReceiverName'],
      5: ['adminUid1'],
    };

    if (fieldsToValidate[step]) {
      fieldsToValidate[step].forEach(field => {
        if (!validateField(field)) isValid = false;
        setTouched(prev => ({ ...prev, [field]: true }));
      });
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateEnvFile = () => {
    const envContent = `# ============================================
# CONFIGURAÇÕES GERADAS AUTOMATICAMENTE
# Data: ${new Date().toLocaleString('pt-BR')}
# ============================================

# Informações da Loja
REACT_APP_STORE_NAME=${formData.storeName}
REACT_APP_STORE_SUBTITLE=${formData.storeSubtitle || 'Seu supermercado com os melhores produtos'}
REACT_APP_CONTACT_PHONE=${formData.contactPhone}
REACT_APP_CONTACT_ADDRESS=${formData.contactAddress}
REACT_APP_WHATSAPP_NUMBER=${formData.whatsappNumber}
REACT_APP_APP_URL=${formData.appUrl || 'https://seusite.com.br'}
REACT_APP_APP_DESCRIPTION=${formData.appDescription || 'Seu supermercado online'}

# Horário de Atendimento
REACT_APP_STORE_HOURS_WEEKDAYS_LABEL=${formData.weekdaysLabel || 'Segunda a Sábado'}
REACT_APP_STORE_HOURS_WEEKDAYS_TIME=${formData.weekdaysTime || '8h às 19h'}
REACT_APP_STORE_HOURS_WEEKDAYS_TIME_FORMATTED=${formData.weekdaysTimeFormatted || '08:00 - 19:00'}
REACT_APP_STORE_HOURS_SUNDAY_LABEL=${formData.sundayLabel || 'Domingo'}
REACT_APP_STORE_HOURS_SUNDAY_TIME=${formData.sundayTime || '8h às 11h'}
REACT_APP_STORE_HOURS_SUNDAY_TIME_FORMATTED=${formData.sundayTimeFormatted || '08:00 - 11:00'}
REACT_APP_STORE_DELIVERY_TIME=${formData.deliveryTime || '30 a 60 minutos'}

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=${formData.firebaseApiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${formData.firebaseAuthDomain}
REACT_APP_FIREBASE_PROJECT_ID=${formData.firebaseProjectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${formData.firebaseStorageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${formData.firebaseMessagingSenderId}
REACT_APP_FIREBASE_APP_ID=${formData.firebaseAppId}
${formData.firebaseMeasurementId ? `REACT_APP_FIREBASE_MEASUREMENT_ID=${formData.firebaseMeasurementId}` : ''}
${formData.firebaseVapidKey ? `REACT_APP_FIREBASE_VAPID_KEY=${formData.firebaseVapidKey}` : ''}

# Administradores
REACT_APP_ADMIN_UID=${formData.adminUid1}
${formData.adminUid2 ? `REACT_APP_ADMIN_UID_2=${formData.adminUid2}` : ''}

# PIX Configuration
REACT_APP_PIX_KEY=${formData.pixKey}
REACT_APP_PIX_CITY=${formData.pixCity}
REACT_APP_PIX_RECEIVER_NAME=${formData.pixReceiverName}

# Google Analytics
${formData.gaId ? `REACT_APP_GA_ID=${formData.gaId}` : ''}

# Temas (Opcional)
REACT_APP_THEME_PRIMARY=${formData.themePrimary}
REACT_APP_THEME_SECONDARY=${formData.themeSecondary}
REACT_APP_GRADIENT_PRIMARY=${formData.gradientPrimary}
`;

    return envContent;
  };

  const downloadEnvFile = () => {
    const content = generateEnvFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const content = generateEnvFile();
    navigator.clipboard.writeText(content).then(() => {
      alert('Configurações copiadas para a área de transferência!');
    });
  };

  const handleFinish = () => {
    if (validateStep(currentStep)) {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
      }, 1500);
    }
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <FaCheckCircle className="text-xl" />
                  ) : (
                    <Icon className="text-xl" />
                  )}
                </div>
                <p className={`mt-2 text-xs font-medium text-center max-w-[100px] ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const GuideCard = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon className="text-white text-lg" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-600">Clique para {isOpen ? 'ocultar' : 'ver'} instruções detalhadas</p>
            </div>
          </div>
          {isOpen ? (
            <FaChevronUp className="text-gray-600" />
          ) : (
            <FaChevronDown className="text-gray-600" />
          )}
        </button>
        {isOpen && (
          <div className="px-5 py-4 border-t border-blue-200 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  const InputField = ({ label, field, type = 'text', placeholder, required = false, helpText, autoComplete = null, guide = null }) => {
    const hasError = touched[field] && errors[field];
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
          {!required && <span className="text-gray-400 text-xs ml-2">(Opcional)</span>}
        </label>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            hasError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 bg-white shadow-sm`}
        />
        {guide && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 flex items-start gap-2">
              <FaBook className="mt-0.5 flex-shrink-0" />
              <span className="font-semibold">Como encontrar:</span>
            </p>
            <div className="mt-1 text-xs text-amber-700 ml-5">
              {guide}
            </div>
          </div>
        )}
        {helpText && (
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <FaInfoCircle />
            {helpText}
          </p>
        )}
        {hasError && (
          <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <FaStore className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Informações da Loja</h2>
              <p className="text-gray-600 mt-2">Configure os dados básicos da sua loja</p>
            </div>
            
            <InputField
              label="Nome da Loja"
              field="storeName"
              placeholder="Ex: Supermercado Online"
              required
              helpText="Este nome aparecerá em toda a aplicação"
              guide="Nome comercial da sua loja. Aparece no header, títulos das páginas e em toda a interface"
            />
            
            <InputField
              label="Subtítulo"
              field="storeSubtitle"
              placeholder="Ex: Seu supermercado com os melhores produtos"
              helpText="Breve descrição que aparece junto ao nome"
              guide="Slogan ou frase curta que identifica sua loja. Aparece no header ao lado do nome"
            />
            
            <GuideCard 
              title="🌐 URL do Site - Preencha Após o Deploy" 
              icon={FaExternalLinkAlt}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-xs font-semibold flex items-center gap-2 mb-1">
                    <FaInfoCircle />
                    ⚠️ Importante:
                  </p>
                  <p className="text-amber-700 text-xs ml-5">
                    Este campo pode ser deixado em branco por enquanto! Preencha APENAS depois que você fizer o deploy do site.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fluxo correto:</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-2 text-xs">
                    <li><strong>Agora (durante setup):</strong> Deixe em branco! ✅ Não precisa preencher ainda</li>
                    <li><strong>Depois:</strong> Configure tudo (Firebase, PIX, etc.) e faça o build do projeto</li>
                    <li><strong>Depois:</strong> Faça o deploy do site (Firebase Hosting, Vercel, Netlify, etc.)</li>
                    <li><strong>Por último:</strong> Quando o site estiver no ar, volte aqui ou edite o <code className="bg-gray-100 px-1 rounded">.env.local</code> e atualize com a URL real</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Onde encontrar a URL após o deploy:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                    <li><strong>Firebase Hosting:</strong> 
                      <ol className="list-decimal list-inside ml-3 mt-1">
                        <li>Execute <code className="bg-gray-100 px-1 rounded">npm run build</code></li>
                        <li>Execute <code className="bg-gray-100 px-1 rounded">firebase deploy</code></li>
                        <li>A URL aparecerá no terminal (ex: https://seu-projeto.web.app)</li>
                      </ol>
                    </li>
                    <li><strong>Vercel/Netlify:</strong> Aparece no painel do serviço após conectar o repositório</li>
                    <li><strong>Domínio próprio:</strong> Se você conectou um domínio personalizado, use ele aqui</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs font-semibold">💡 Importante:</p>
                  <p className="text-blue-700 text-xs mt-1 ml-2">
                    Esta URL é usada para SEO e compartilhamento nas redes sociais. O sistema funciona normalmente mesmo sem ela durante o desenvolvimento. Você pode atualizar depois no arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code>
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="URL do Site (Opcional - Preencha Após Deploy)"
              field="appUrl"
              type="url"
              placeholder="https://seusite.com.br (deixe em branco por enquanto)"
              helpText="Pode deixar em branco durante o setup inicial. Preencha depois do deploy."
              guide="Deixe em branco agora! Após fazer o deploy do site (Firebase Hosting, Vercel, etc.), atualize com a URL real. Você pode editar depois no .env.local"
            />
            
            <InputField
              label="Descrição (SEO)"
              field="appDescription"
              placeholder="Descrição do seu supermercado online..."
              helpText="Usado para SEO e redes sociais (máximo 160 caracteres recomendado)"
              guide="Descrição que aparece em resultados de busca e ao compartilhar nas redes sociais. Seja objetivo e inclua palavras-chave"
            />
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                Horário de Atendimento
              </h3>
              
              <GuideCard 
              title="🕐 Como Configurar os Horários" 
              icon={FaClock}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Explicação dos Campos:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                    <li><strong>Label:</strong> Texto que aparece antes do horário (ex: "Segunda a Sábado", "Domingo")</li>
                    <li><strong>Horário Simples:</strong> Formato curto usado no Hero (ex: "8h às 19h")</li>
                    <li><strong>Horário Formatado:</strong> Formato completo usado no Carrinho (ex: "08:00 - 19:00")</li>
                    <li><strong>Tempo de Entrega:</strong> Descrição do tempo (ex: "30 a 60 minutos", "Em até 2 horas")</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs font-semibold">💡 Dica:</p>
                  <p className="text-blue-700 text-xs mt-1 ml-2">
                    Use o mesmo horário real da sua loja. Isso ajuda os clientes a saber quando você atende e quando podem receber entregas.
                  </p>
                </div>
              </div>
            </GuideCard>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Label Dias Úteis"
                  field="weekdaysLabel"
                  placeholder="Ex: Segunda a Sábado"
                  helpText="Texto que aparece antes do horário dos dias úteis"
                  guide="Exemplo: 'Segunda a Sábado', 'Segunda a Sexta', 'De Segunda a Sexta'"
                />
                
                <InputField
                  label="Horário Dias Úteis"
                  field="weekdaysTime"
                  placeholder="Ex: 8h às 19h"
                  helpText="Horário simples usado no Hero (formato: Xh às Xh)"
                  guide="Formato curto: '8h às 19h', '9h às 18h', '7h às 20h'"
                />
                
                <InputField
                  label="Horário Dias Úteis (Formatado)"
                  field="weekdaysTimeFormatted"
                  placeholder="Ex: 08:00 - 19:00"
                  helpText="Horário formatado usado no Carrinho (formato: 00:00 - 00:00)"
                  guide="Formato completo: '08:00 - 19:00', '09:00 - 18:00', '07:00 - 20:00'"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputField
                  label="Label Domingo"
                  field="sundayLabel"
                  placeholder="Ex: Domingo"
                  guide="Geralmente apenas 'Domingo', mas pode ser 'Domingos e Feriados' se aplicável"
                />
                
                <InputField
                  label="Horário Domingo"
                  field="sundayTime"
                  placeholder="Ex: 8h às 11h"
                  helpText="Horário simples usado no Hero"
                  guide="Formato curto: '8h às 11h', '9h às 13h'. Se não abre domingo, deixe vazio ou use 'Fechado'"
                />
                
                <InputField
                  label="Horário Domingo (Formatado)"
                  field="sundayTimeFormatted"
                  placeholder="Ex: 08:00 - 11:00"
                  helpText="Horário formatado usado no Carrinho"
                  guide="Formato completo: '08:00 - 11:00'. Se fechado: 'Fechado'"
                />
              </div>
              
              <div className="mt-4">
                <InputField
                  label="Tempo de Entrega"
                  field="deliveryTime"
                  placeholder="Ex: 30 a 60 minutos"
                  helpText="Descrição do tempo médio de entrega"
                  guide="Tempo real de entrega. Exemplos: '30 a 60 minutos', 'Em até 2 horas', '45 a 90 minutos'"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4">
                <FaPhone className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Informações de Contato</h2>
              <p className="text-gray-600 mt-2">Como seus clientes podem entrar em contato</p>
            </div>
            
            <GuideCard 
              title="📞 Formato Correto dos Contatos" 
              icon={FaPhone}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Telefone de Contato:</h4>
                  <p className="text-xs ml-2">
                    Use o formato internacional: <code className="bg-gray-100 px-2 py-1 rounded">+55-00-00000-0000</code>
                  </p>
                  <p className="text-xs ml-2 mt-1 text-gray-600">
                    Exemplo: <code className="bg-gray-100 px-2 py-1 rounded">+55-33-98888-8888</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">WhatsApp:</h4>
                  <p className="text-xs ml-2">
                    Apenas números, sem espaços, parênteses ou traços
                  </p>
                  <p className="text-xs ml-2 mt-1 text-gray-600">
                    Formato: <code className="bg-gray-100 px-2 py-1 rounded">5519999999999</code> (código do país + DDD + número)
                  </p>
                  <p className="text-xs ml-2 mt-1 text-amber-700">
                    ⚠️ Sempre comece com 55 (Brasil) + DDD (sem zero) + número completo
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Telefone de Contato"
              field="contactPhone"
              type="tel"
              placeholder="+55-00-00000-0000"
              required
              helpText="Formato internacional: +55-00-00000-0000"
              guide="Exemplo: +55-33-98888-8888 (formato: +país-DDD-número)"
            />
            
            <InputField
              label="WhatsApp"
              field="whatsappNumber"
              type="tel"
              placeholder="5519999999999"
              required
              helpText="Apenas números, sem espaços ou traços"
              guide="Formato: 55 + DDD (sem zero) + número. Exemplo: 5519999999999 (55=Brasil, 19=DDD, 999999999=número)"
            />
            
            <InputField
              label="Endereço"
              field="contactAddress"
              placeholder="Cidade, Estado"
              required
              guide="Localização da loja. Exemplo: Lajinha, MG ou São Paulo, SP"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
                <FaFire className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Configurações Firebase</h2>
              <p className="text-gray-600 mt-2">Credenciais do seu projeto Firebase</p>
            </div>
            
            <GuideCard 
              title="🔍 Guia Completo: Como Configurar Firebase" 
              icon={FaBook}
              defaultOpen={true}
            >
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaExternalLinkAlt className="text-blue-600" />
                    Passo 1: Acessar Firebase Console
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Acesse: <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">console.firebase.google.com <FaExternalLinkAlt className="text-xs" /></a></li>
                    <li>Faça login com sua conta Google</li>
                    <li>Clique em "Adicionar projeto" ou selecione um existente</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaServer className="text-blue-600" />
                    Passo 2: Criar Projeto (se necessário)
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Dê um nome ao projeto (ex: "meu-supermercado")</li>
                    <li>Aceite os termos e clique em "Criar projeto"</li>
                    <li>Aguarde alguns segundos enquanto o Firebase cria o projeto</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaIdCard className="text-blue-600" />
                    Passo 3: Adicionar App Web
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>No painel do projeto, clique no ícone de <strong>&lt;/&gt; Web</strong></li>
                    <li>Registre seu app com um nome (ex: "Supermercado Web")</li>
                    <li>Marque a opção "Também configure o Firebase Hosting" (opcional)</li>
                    <li>Clique em "Registrar app"</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaKey className="text-blue-600" />
                    Passo 4: Copiar Credenciais
                  </h4>
                  <p className="mb-2 ml-2">Você verá um objeto JavaScript com todas as credenciais. Copie cada valor:</p>
                  <div className="bg-gray-100 rounded-lg p-3 ml-2 text-xs font-mono">
                    <div className="space-y-1">
                      <div><span className="text-purple-600">apiKey:</span> "AIza..." ← <strong>Firebase API Key</strong></div>
                      <div><span className="text-purple-600">authDomain:</span> "projeto.firebaseapp.com" ← <strong>Firebase Auth Domain</strong></div>
                      <div><span className="text-purple-600">projectId:</span> "meu-projeto" ← <strong>Firebase Project ID</strong></div>
                      <div><span className="text-purple-600">storageBucket:</span> "projeto.appspot.com" ← <strong>Firebase Storage Bucket</strong></div>
                      <div><span className="text-purple-600">messagingSenderId:</span> "123456789" ← <strong>Messaging Sender ID</strong></div>
                      <div><span className="text-purple-600">appId:</span> "1:123:web:abc" ← <strong>Firebase App ID</strong></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-xs font-semibold flex items-center gap-2 mb-1">
                    <FaCheckCircle />
                    Dica Rápida:
                  </p>
                  <p className="text-green-700 text-xs ml-6">
                    Todas as credenciais aparecem na mesma tela após registrar o app. Não precisa procurar em vários lugares!
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Firebase Project ID"
              field="firebaseProjectId"
              placeholder="seu-projeto-id"
              required
              guide="No Firebase Console → Configurações do projeto (ícone de engrenagem) → Geral. Está no topo da página como 'ID do projeto'"
            />
            
            <InputField
              label="Firebase API Key"
              field="firebaseApiKey"
              placeholder="AIza..."
              required
              guide="Após registrar o app web, aparece na tela de credenciais como 'apiKey'. Começa sempre com 'AIza'"
            />
            
            <InputField
              label="Firebase Auth Domain"
              field="firebaseAuthDomain"
              placeholder="seu-projeto.firebaseapp.com"
              required
              guide="Após registrar o app, aparece como 'authDomain'. Geralmente é: [seu-projeto-id].firebaseapp.com"
            />
            
            <InputField
              label="Firebase Storage Bucket"
              field="firebaseStorageBucket"
              placeholder="seu-projeto.appspot.com"
              required
              guide="Aparece como 'storageBucket' nas credenciais. Geralmente é: [seu-projeto-id].appspot.com"
            />
            
            <InputField
              label="Firebase Messaging Sender ID"
              field="firebaseMessagingSenderId"
              placeholder="123456789012"
              required
              guide="Aparece como 'messagingSenderId' nas credenciais. É um número de 12 dígitos"
            />
            
            <InputField
              label="Firebase App ID"
              field="firebaseAppId"
              placeholder="1:123456789012:web:..."
              required
              guide="Aparece como 'appId' nas credenciais. Formato: 1:[números]:web:[código]"
            />
            
            <GuideCard 
              title="📊 Firebase Measurement ID e VAPID Key (Opcionais)" 
              icon={FaSearch}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Firebase Measurement ID:</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                    <li>Firebase Console → Configurações do projeto → Geral</li>
                    <li>Role até a seção "Seus apps"</li>
                    <li>Encontre "ID de medição" (começa com G-)</li>
                    <li>Ou ative Google Analytics no projeto para gerar automaticamente</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Firebase VAPID Key:</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                    <li>Firebase Console → Configurações do projeto → Cloud Messaging</li>
                    <li>Na aba "Web Push certificates"</li>
                    <li>Clique em "Gerar novo par de chaves"</li>
                    <li>Copie a chave gerada</li>
                    <li className="text-amber-700 font-semibold">⚠️ Necessário apenas para notificações push no navegador</li>
                  </ol>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Firebase Measurement ID (Opcional)"
              field="firebaseMeasurementId"
              placeholder="G-XXXXXXXXXX"
              helpText="Para Google Analytics integrado"
              guide="Firebase Console → Configurações → Geral → ID de medição (formato: G-XXXXXXXXXX)"
            />
            
            <InputField
              label="Firebase VAPID Key (Opcional)"
              field="firebaseVapidKey"
              placeholder="Chave VAPID para notificações push"
              helpText="Necessário apenas para notificações push no navegador"
              guide="Firebase Console → Configurações → Cloud Messaging → Web Push certificates → Gerar novo par"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
                <FaCreditCard className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Pagamento PIX</h2>
              <p className="text-gray-600 mt-2">Configure seus dados para recebimento via PIX</p>
            </div>
            
            <GuideCard 
              title="💳 Guia de Configuração PIX" 
              icon={FaCreditCard}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Tipos de Chave PIX:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                    <li><strong>CPF/CNPJ:</strong> Apenas números, sem pontos ou traços (ex: 12345678900)</li>
                    <li><strong>Email:</strong> Seu email cadastrado no banco</li>
                    <li><strong>Chave Aleatória:</strong> Código gerado pelo banco (UUID)</li>
                    <li><strong>Telefone:</strong> Número com DDD (ex: 5519999999999)</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-xs font-semibold">Onde encontrar:</p>
                  <p className="text-green-700 text-xs mt-1 ml-2">
                    Acesse o app do seu banco → PIX → Minhas chaves → Copie a chave escolhida
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Chave PIX"
              field="pixKey"
              placeholder="CPF, CNPJ, Email ou Chave Aleatória"
              required
              helpText="Qualquer tipo de chave PIX válida cadastrada no seu banco"
              guide="App do Banco → PIX → Minhas chaves → Copie a chave escolhida (CPF, Email, Telefone ou Aleatória)"
            />
            
            <InputField
              label="Cidade"
              field="pixCity"
              placeholder="CIDADE"
              required
              helpText="Nome da cidade em MAIÚSCULAS (ex: SAO PAULO, BELO HORIZONTE)"
              guide="Use o nome oficial da cidade onde está localizado seu estabelecimento, em LETRAS MAIÚSCULAS"
            />
            
            <InputField
              label="Nome do Recebedor"
              field="pixReceiverName"
              placeholder="Nome Completo"
              required
              guide="Nome completo da pessoa física ou razão social da empresa que receberá os pagamentos PIX"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                <FaUserShield className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Administradores</h2>
              <p className="text-gray-600 mt-2">Defina quem terá acesso ao painel administrativo</p>
            </div>
            
            <GuideCard 
              title="👤 Como Encontrar o UID do Administrador" 
              icon={FaUserShield}
              defaultOpen={true}
            >
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaIdCard className="text-purple-600" />
                    Passo a Passo:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1">Firebase Console <FaExternalLinkAlt className="text-xs" /></a></li>
                    <li>Selecione seu projeto</li>
                    <li>No menu lateral, clique em <strong>"Authentication"</strong> (Autenticação)</li>
                    <li>Na aba <strong>"Users"</strong> (Usuários), você verá a lista de usuários cadastrados</li>
                    <li>Cada usuário tem uma coluna <strong>"User UID"</strong> - esse é o código que você precisa</li>
                    <li>Copie o UID completo (é um código longo como: <code className="bg-gray-100 px-1 rounded">ZG5D6IrTRTZl5SDoEctLAtr4WkE2</code>)</li>
                  </ol>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-800 text-xs font-semibold flex items-center gap-2 mb-1">
                    <FaInfoCircle />
                    Dica Importante:
                  </p>
                  <p className="text-purple-700 text-xs ml-5">
                    Se você ainda não tem usuário criado, crie primeiro em "Authentication" → "Users" → "Add user" (Email/Password). Depois copie o UID gerado.
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-xs font-semibold flex items-center gap-2 mb-1">
                    <FaInfoCircle />
                    Segurança:
                  </p>
                  <p className="text-amber-700 text-xs ml-5">
                    Apenas usuários com UID configurado aqui terão acesso ao painel administrativo. Certifique-se de copiar o UID correto!
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Admin UID 1"
              field="adminUid1"
              placeholder="user-id-1"
              required
              helpText="UID do primeiro administrador (obrigatório)"
              guide="Firebase Console → Authentication → Users → Copie o 'User UID' do seu usuário"
            />
            
            <InputField
              label="Admin UID 2 (Opcional)"
              field="adminUid2"
              placeholder="user-id-2"
              helpText="UID de um segundo administrador (opcional)"
              guide="Mesmo processo: Firebase Console → Authentication → Users → Copie o UID de outro usuário"
            />
            
            <GuideCard 
              title="📊 Como Configurar Google Analytics (Opcional)" 
              icon={FaSearch}
            >
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Opção 1: Usar Firebase Analytics</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                    <li>Firebase Console → Configurações do projeto → Geral</li>
                    <li>Role até "Seus apps" → Encontre "ID de medição" (começa com G-)</li>
                    <li>Copie esse ID diretamente</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Opção 2: Google Analytics Direto</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                    <li>Acesse <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">analytics.google.com <FaExternalLinkAlt className="text-xs" /></a></li>
                    <li>Crie uma propriedade (ou use existente)</li>
                    <li>Vá em Administrador → Propriedade → Informações da propriedade</li>
                    <li>Copie o "ID de medição" (formato: G-XXXXXXXXXX)</li>
                  </ol>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs font-semibold">💡 Dica:</p>
                  <p className="text-blue-700 text-xs mt-1 ml-2">
                    Se você conectou Google Analytics ao Firebase, pode usar o mesmo ID de medição do Firebase.
                  </p>
                </div>
              </div>
            </GuideCard>
            
            <InputField
              label="Google Analytics ID (Opcional)"
              field="gaId"
              placeholder="G-XXXXXXXXXX"
              helpText="ID do Google Analytics para rastreamento"
              guide="Firebase Console → Configurações → Geral → ID de medição (G-XXXXXXXXXX) OU Google Analytics → Propriedade → ID de medição"
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-4">
                <FaPalette className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Personalização de Temas</h2>
              <p className="text-gray-600 mt-2">Customize as cores do seu sistema (opcional)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themePrimary}
                    onChange={(e) => handleChange('themePrimary', e.target.value)}
                    className="w-20 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.themePrimary}
                    onChange={(e) => handleChange('themePrimary', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeSecondary}
                    onChange={(e) => handleChange('themeSecondary', e.target.value)}
                    className="w-20 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.themeSecondary}
                    onChange={(e) => handleChange('themeSecondary', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gradiente Primário (Tailwind CSS)
              </label>
              <input
                type="text"
                value={formData.gradientPrimary}
                onChange={(e) => handleChange('gradientPrimary', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="from-blue-500 to-blue-600"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: from-blue-500 to-blue-600</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mt-6">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="space-y-3">
                <div
                  className="h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ background: `linear-gradient(to right, ${formData.themePrimary}, ${formData.themeSecondary})` }}
                >
                  Botão de Exemplo
                </div>
                <div className="flex gap-3">
                  <div
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: formData.themePrimary }}
                  />
                  <div
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: formData.themeSecondary }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <FaCheckCircle className="text-white text-5xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Configuração Concluída! 🎉</h1>
          <p className="text-gray-600 mb-8">
            Suas configurações foram salvas. Agora você precisa criar o arquivo <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
          </p>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={downloadEnvFile}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <FaDownload />
              Baixar arquivo .env.local
            </button>
            
            <button
              onClick={copyToClipboard}
              className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FaCopy />
              Copiar conteúdo
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
            <p className="text-sm text-blue-800 mb-2 font-semibold">Próximos passos:</p>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Baixe ou copie o arquivo .env.local</li>
              <li>Coloque o arquivo na raiz do projeto (mesma pasta do package.json)</li>
              <li>Reinicie o servidor de desenvolvimento (Ctrl+C e npm start)</li>
              <li>Suas configurações estarão ativas!</li>
            </ol>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
          >
            Ir para o site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Configuração Inicial
          </h1>
          <p className="text-gray-600">Configure seu sistema em poucos passos</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <StepIndicator />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <FaArrowLeft />
            Anterior
          </button>
          
          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              Próximo
              <FaArrowRight />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Finalizar
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Info */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Passo {currentStep} de {STEPS.length}
        </div>
      </div>
    </div>
  );
}

