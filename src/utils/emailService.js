import api from './axios';

// Template para correo de bienvenida profesional
const generateWelcomeEmailHTML = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a FinderGoal!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #84cc16 0%, #f97316 100%);
          color: white;
          padding: 32px 24px 16px 24px;
          text-align: center;
        }
        .logo {
          width: 90px;
          height: 90px;
          border-radius: 16px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 2em;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
        }
        .content {
          padding: 32px 24px 24px 24px;
        }
        .welcome-text {
          font-size: 1.3em;
          color: #1a202c;
          margin-bottom: 18px;
          text-align: center;
          font-weight: 600;
        }
        .welcome-name {
          color: #84cc16;
          font-weight: 700;
        }
        .intro-text {
          font-size: 1.1em;
          color: #4a5568;
          text-align: center;
          margin-bottom: 24px;
          line-height: 1.7;
        }
        .features {
          background: #f7fafc;
          border-radius: 14px;
          padding: 24px 18px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
        }
        .feature {
          display: flex;
          align-items: flex-start;
          margin-bottom: 18px;
        }
        .feature:last-child {
          margin-bottom: 0;
        }
        .feature-emoji {
          font-size: 1.7em;
          margin-right: 16px;
        }
        .feature-content {
          flex: 1;
        }
        .feature-title {
          font-size: 1.08em;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 3px 0;
        }
        .feature-description {
          font-size: 0.98em;
          color: #718096;
          line-height: 1.5;
          margin: 0;
        }
        .cta-section {
          text-align: center;
          margin: 32px 0 0 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
          color: white;
          text-decoration: none;
          padding: 16px 36px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1em;
          margin: 0 auto;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(132, 204, 22, 0.18);
          border: none;
          cursor: pointer;
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #65a30d 0%, #84cc16 100%);
        }
        .footer {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        .footer-title {
          font-size: 1.1em;
          font-weight: 600;
          margin: 0 0 10px 0;
          color: #84cc16;
        }
        .footer-tagline {
          font-size: 0.95em;
          margin: 0 0 10px 0;
          opacity: 0.8;
          line-height: 1.5;
        }
        .copyright {
          margin-top: 10px;
          font-size: 0.85em;
          opacity: 0.7;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 8px;
          }
          .header, .content, .footer {
            padding: 14px 4px;
          }
          .logo {
            width: 60px;
            height: 60px;
          }
          .title {
            font-size: 1.3em;
          }
          .welcome-text {
            font-size: 1.05em;
          }
          .intro-text {
            font-size: 0.98em;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://findergoal.com/findergoal_logo.webp" alt="FinderGoal Logo" class="logo" />
          <div class="title">¡Bienvenido a FinderGoal!</div>
        </div>
        <div class="content">
          <div class="welcome-text">
            ¡Hola <span class="welcome-name">${userName}</span>!
          </div>
          <p class="intro-text">
            Te damos la bienvenida a FinderGoal.<br/>
            Ya puedes buscar partidos, conectar con jugadores y disfrutar del fútbol.<br/>
            ¡Nos alegra tenerte en la comunidad!
          </p>
          <div class="features">
            <div class="feature">
              <span class="feature-emoji">⚽️</span>
              <div class="feature-content">
                <div class="feature-title">Encuentra Partidos</div>
                <div class="feature-description">Explora cientos de partidos cerca de ti con filtros avanzados y ubicación precisa.</div>
              </div>
            </div>
            <div class="feature">
              <span class="feature-emoji">🤝</span>
              <div class="feature-content">
                <div class="feature-title">Conecta con Jugadores</div>
                <div class="feature-description">Únete a una comunidad activa de jugadores con perfiles verificados.</div>
              </div>
            </div>
            <div class="feature">
              <span class="feature-emoji">📅</span>
              <div class="feature-content">
                <div class="feature-title">Organiza Partidos</div>
                <div class="feature-description">Crea y gestiona tus propios partidos con herramientas profesionales.</div>
              </div>
            </div>
            <div class="feature">
              <span class="feature-emoji">💬</span>
              <div class="feature-content">
                <div class="feature-title">WhatsApp Parser</div>
                <div class="feature-description">Convierte listados de WhatsApp en partidos organizados automáticamente.</div>
              </div>
            </div>
          </div>
          <div class="cta-section">
            <a href="https://findergoal.com" class="cta-button" target="_blank" rel="noopener">Ir a FinderGoal</a>
          </div>
        </div>
        <div class="footer">
          <div class="footer-title">FinderGoal</div>
          <div class="footer-tagline">Conectando jugadores, creando partidos</div>
          <div class="copyright">© 2025 FinderGoal. Todos los derechos reservados.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función para enviar correo de bienvenida
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const emailData = {
      to: userEmail,
      subject: "¡Bienvenido a FinderGoal!",
      html: generateWelcomeEmailHTML(userName, userEmail)
    };
    const response = await api.post('/email/send', emailData);
    console.log('Correo de bienvenida enviado exitosamente:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error enviando correo de bienvenida:', error);
    return { success: false, error: error.message };
  }
};

// Función para enviar correo personalizado
export const sendCustomEmail = async (to, subject, htmlContent) => {
  try {
    const emailData = {
      to,
      subject,
      html: htmlContent
    };

    const response = await api.post('/email/send', emailData);
    console.log('Correo enviado exitosamente:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error enviando correo:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar si el correo se envió correctamente
export const isEmailSent = (result) => {
  return result && result.success === true;
}; 