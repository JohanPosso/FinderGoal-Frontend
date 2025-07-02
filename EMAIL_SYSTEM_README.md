# Sistema de Correos Electrónicos - FinderGoal

## 📧 Descripción General

El sistema de correos electrónicos de FinderGoal permite el envío automático de correos de bienvenida a usuarios que se registran con Google, así como el envío de correos personalizados y masivos desde el panel de administración.

## 🚀 Características Implementadas

### 1. Correos de Bienvenida Automáticos
- **Trigger**: Se envían automáticamente cuando un usuario se registra o inicia sesión con Google
- **Contenido**: Template HTML personalizado con diseño atractivo
- **Información incluida**: Nombre del usuario, características de la plataforma, enlaces de acción

### 2. Panel de Configuración de Correos
- **Ruta**: `/email-settings` (requiere autenticación)
- **Funcionalidades**:
  - Prueba de correos de bienvenida
  - Envío de correos personalizados
  - Envío de correos masivos
  - Gestión de destinatarios

### 3. Templates HTML Responsivos
- Diseño moderno con gradientes deportivos
- Colores del tema FinderGoal (lime y orange)
- Compatible con todos los clientes de correo
- Incluye enlaces de acción y información de contacto

## 🛠️ Arquitectura del Sistema

### Archivos Principales

```
src/
├── utils/
│   ├── emailService.js          # Servicio principal de correos
│   └── useEmail.js              # Hook personalizado para correos
├── components/
│   └── EmailNotification.jsx    # Componente de notificaciones
├── pages/
│   └── EmailSettings.jsx        # Panel de configuración
└── routes/
    └── AppRoutes.jsx            # Rutas incluyendo email-settings
```

### Flujo de Envío de Correos

1. **Usuario se registra con Google** → `Login.jsx` / `Register.jsx`
2. **Se llama a `sendWelcomeEmail()`** → `emailService.js`
3. **Se envía petición al backend** → `POST /email/send`
4. **Se muestra notificación** → `EmailNotification.jsx`

## 📋 Endpoints del Backend

### Envío de Correos
```
POST /email/send
Content-Type: application/json

Body:
{
  "to": "destinatario@ejemplo.com",
  "subject": "Asunto del correo",
  "html": "<h1>Contenido HTML del correo</h1>"
}
```

### Respuesta Esperada
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "unique-message-id"
}
```

## 🎨 Templates de Correo

### Correo de Bienvenida
- **Asunto**: "¡Bienvenido a FinderGoal! ⚽ Tu aventura futbolística comienza ahora"
- **Características**:
  - Header con logo y gradiente deportivo
  - Saludo personalizado con nombre del usuario
  - Lista de características de la plataforma
  - Botón de llamada a la acción
  - Footer con información de contacto

### Estructura HTML
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a FinderGoal!</title>
  <style>
    /* Estilos CSS inline para compatibilidad */
    body { font-family: 'Segoe UI', sans-serif; }
    .header { background: linear-gradient(135deg, #84cc16 0%, #f97316 100%); }
    /* ... más estilos ... */
  </style>
</head>
<body>
  <div class="container">
    <!-- Contenido del correo -->
  </div>
</body>
</html>
```

## 🔧 Configuración y Uso

### 1. Configuración del Backend
Asegúrate de que tu backend tenga configurado:
- Servidor SMTP (Gmail, SendGrid, etc.)
- Variables de entorno para credenciales
- Endpoint `/email/send` funcionando

### 2. Variables de Entorno
```env
# Backend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
```

### 3. Uso en el Frontend

#### Envío Automático (Login/Register)
```javascript
import { sendWelcomeEmail } from '../utils/emailService';

// En el handler de Google OAuth
const emailResult = await sendWelcomeEmail(userEmail, userName);
if (emailResult.success) {
  console.log("Correo enviado exitosamente");
}
```

#### Envío Manual (Panel de Administración)
```javascript
import { useEmail } from '../utils/useEmail';

const { sendCustom, sendBulk, isLoading, error } = useEmail();

// Envío personalizado
await sendCustom('usuario@email.com', 'Asunto', '<h1>Contenido</h1>');

// Envío masivo
await sendBulk(['email1@test.com', 'email2@test.com'], 'Asunto', '<h1>Contenido</h1>');
```

## 🎯 Funcionalidades del Panel de Administración

### 1. Correo de Bienvenida
- Campo para email de prueba
- Campo para nombre del usuario
- Botón para enviar correo de prueba
- Validación de campos

### 2. Correo Personalizado
- Campo para destinatario
- Campo para asunto
- Editor de contenido HTML
- Vista previa del correo

### 3. Correo Masivo
- Campo para asunto
- Editor de contenido HTML
- Gestión de lista de destinatarios
- Agregar/eliminar emails
- Contador de destinatarios

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas
- Verificación de formato de email
- Validación de campos requeridos
- Manejo de errores del backend
- Timeouts para evitar spam

### Consideraciones de Seguridad
- Los correos se envían solo desde el backend
- No se almacenan credenciales en el frontend
- Rate limiting recomendado en el backend
- Logs de envío para auditoría

## 📊 Monitoreo y Logs

### Logs del Frontend
```javascript
// Envío exitoso
console.log('Correo de bienvenida enviado exitosamente:', response.data);

// Error de envío
console.error('Error enviando correo de bienvenida:', error);
console.warn('No se pudo enviar el correo de bienvenida:', emailResult.error);
```

### Métricas Recomendadas
- Tasa de envío exitoso
- Tasa de apertura de correos
- Tiempo de respuesta del servidor SMTP
- Errores por tipo de cliente de correo

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
1. **Templates Dinámicos**: Sistema de templates con variables
2. **Programación de Correos**: Envío programado
3. **Analytics**: Seguimiento de apertura y clics
4. **Listas de Distribución**: Gestión de suscriptores
5. **Correos Transaccionales**: Confirmaciones, recordatorios
6. **A/B Testing**: Pruebas de diferentes templates

### Integraciones
1. **SendGrid**: Para mejor deliverability
2. **Mailchimp**: Para marketing por email
3. **Postmark**: Para correos transaccionales
4. **Resend**: Alternativa moderna

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Correo no se envía
- Verificar configuración SMTP
- Revisar logs del backend
- Confirmar que el endpoint `/email/send` responde

#### 2. Correo llega a spam
- Configurar SPF, DKIM, DMARC
- Usar servicios como SendGrid
- Evitar palabras spam en el asunto

#### 3. Template no se renderiza
- Usar CSS inline
- Probar en diferentes clientes de correo
- Verificar compatibilidad HTML

### Debugging
```javascript
// Habilitar logs detallados
const DEBUG_EMAIL = true;

if (DEBUG_EMAIL) {
  console.log('Enviando correo:', { to, subject, html });
}
```

## 📞 Soporte

Para problemas o preguntas sobre el sistema de correos:
1. Revisar logs del backend y frontend
2. Verificar configuración SMTP
3. Probar con email de prueba
4. Contactar al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para ser escalable y mantenible. Se recomienda implementar rate limiting y monitoreo en producción. 