import React from 'react';
import { Helmet } from 'react-helmet-async';

const PoliticaPrivacidade = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade - Sup Lajinha</title>
        <meta name="description" content="Política de Privacidade do Supermercado Online Lajinha. Saiba como protegemos seus dados pessoais." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Política de Privacidade</h1>
          
          <p className="text-gray-600 mb-4">
            <strong>Última atualização:</strong> 31 de outubro de 2025
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introdução</h2>
              <p className="mb-4">
                O Supermercado Online Lajinha ("nós", "nosso" ou "aplicativo") respeita a privacidade 
                dos usuários e está comprometido em proteger os dados pessoais coletados através do 
                nosso aplicativo móvel e site. Esta Política de Privacidade descreve como coletamos, 
                usamos, armazenamos e protegemos suas informações pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Informações que Coletamos</h2>
              <p className="mb-3">Coletamos as seguintes informações pessoais quando você utiliza nosso aplicativo:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Dados de Conta:</strong> Nome completo, endereço de e-mail e senha (quando você cria uma conta)</li>
                <li><strong>Informações de Autenticação:</strong> Dados do seu perfil do Google (quando você faz login com Google), incluindo nome e e-mail</li>
                <li><strong>Dados de Pedidos:</strong> Endereço de entrega, número de telefone e informações de pagamento necessárias para processar seus pedidos</li>
                <li><strong>Informações de Uso:</strong> Dados sobre como você utiliza o aplicativo, incluindo produtos visualizados, pedidos realizados e preferências</li>
                <li><strong>Dados de Dispositivo:</strong> Informações técnicas do dispositivo móvel, incluindo modelo, sistema operacional e identificadores únicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Como Usamos suas Informações</h2>
              <p className="mb-3">Utilizamos suas informações pessoais para os seguintes propósitos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Processamento de Pedidos:</strong> Para processar, confirmar, enviar e entregar seus pedidos de produtos</li>
                <li><strong>Autenticação e Segurança:</strong> Para autenticar sua identidade e proteger sua conta contra acesso não autorizado</li>
                <li><strong>Comunicação:</strong> Para enviar notificações sobre o status dos pedidos, atualizações do aplicativo e informações relevantes sobre nossos serviços</li>
                <li><strong>Melhoria dos Serviços:</strong> Para analisar o uso do aplicativo e melhorar a experiência do usuário, funcionalidades e serviços oferecidos</li>
                <li><strong>Suporte ao Cliente:</strong> Para responder a suas dúvidas, solicitações e fornecer suporte técnico quando necessário</li>
                <li><strong>Personalização:</strong> Para personalizar o conteúdo e recomendar produtos baseados em suas preferências e histórico de compras</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Compartilhamento de Informações</h2>
              <p className="mb-4">
                <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins comerciais.</strong>
              </p>
              <p className="mb-3">Podemos compartilhar suas informações apenas nas seguintes situações:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Prestadores de Serviços:</strong> Com empresas terceirizadas que nos auxiliam na operação do aplicativo (como serviços de pagamento, entrega e análise de dados), desde que estes prestadores se comprometam a manter a confidencialidade de seus dados</li>
                <li><strong>Exigências Legais:</strong> Quando necessário para cumprir obrigações legais, responder a processos judiciais ou proteger nossos direitos legais</li>
                <li><strong>Com seu Consentimento:</strong> Quando você autorizar explicitamente o compartilhamento de suas informações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Armazenamento e Segurança</h2>
              <p className="mb-4">
                Suas informações pessoais são armazenadas de forma segura utilizando serviços de infraestrutura 
                confiáveis (Firebase/Google Cloud Platform). Implementamos medidas de segurança técnicas e 
                organizacionais apropriadas para proteger seus dados contra acesso não autorizado, alteração, 
                divulgação ou destruição.
              </p>
              <p className="mb-4">
                Dados de autenticação são protegidos por criptografia e senhas são armazenadas de forma 
                segura usando algoritmos de hash. No entanto, nenhum método de transmissão ou armazenamento 
                pela internet é 100% seguro, e não podemos garantir segurança absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Retenção de Dados</h2>
              <p className="mb-4">
                Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos 
                nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. 
                Quando você excluir sua conta, removeremos ou anonimizaremos suas informações pessoais, exceto 
                quando a retenção for necessária para cumprir obrigações legais ou resolver disputas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Seus Direitos</h2>
              <p className="mb-3">Você tem os seguintes direitos em relação às suas informações pessoais:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Acesso:</strong> Solicitar acesso às suas informações pessoais que mantemos</li>
                <li><strong>Correção:</strong> Solicitar correção de informações incompletas ou incorretas</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de suas informações pessoais (conforme permitido por lei)</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de suas informações pessoais em determinadas circunstâncias</li>
                <li><strong>Portabilidade:</strong> Solicitar uma cópia dos seus dados em formato estruturado e de uso comum</li>
              </ul>
              <p className="mb-4">
                Para exercer esses direitos, entre em contato conosco através dos canais de atendimento 
                disponibilizados no aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="mb-4">
                Nosso aplicativo pode utilizar cookies e tecnologias similares para melhorar sua experiência, 
                analisar o uso do aplicativo e personalizar o conteúdo. Você pode controlar o uso de cookies 
                através das configurações do seu dispositivo ou navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Menores de Idade</h2>
              <p className="mb-4">
                Nosso aplicativo não é destinado a menores de 18 anos. Não coletamos intencionalmente informações 
                pessoais de menores de idade. Se tomarmos conhecimento de que coletamos informações de um menor, 
                tomaremos medidas para excluir essas informações o mais rápido possível.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Alterações nesta Política</h2>
              <p className="mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas 
                práticas ou por outros motivos operacionais, legais ou regulamentares. Notificaremos você sobre 
                alterações significativas através do aplicativo ou por e-mail. Recomendamos que você revise esta 
                política periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contato</h2>
              <p className="mb-4">
                Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade 
                ou ao tratamento de suas informações pessoais, entre em contato conosco através dos seguintes canais:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="mb-2"><strong>Supermercado Online Lajinha</strong></p>
                <p className="mb-2">Através do aplicativo: Acesse a seção "Contato" ou "Suporte"</p>
                <p className="mb-2">Ou através da página de contato em nosso site</p>
              </div>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800">
                <strong>Consentimento:</strong> Ao utilizar nosso aplicativo, você concorda com a coleta e uso 
                de suas informações conforme descrito nesta Política de Privacidade.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoliticaPrivacidade;




