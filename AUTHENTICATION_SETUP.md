# Configuración de Autenticación con Google OAuth

Este proyecto incluye autenticación con Google OAuth. Sigue estos pasos para configurarla:

## 1. Configuración de Google OAuth

### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ API

### Paso 2: Configurar OAuth 2.0
1. Ve a "Credentials" en el menú lateral
2. Haz clic en "Create Credentials" → "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Configura las URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:5173` (para desarrollo)
   - **Authorized redirect URIs**: `http://localhost:5173` (para desarrollo)
5. Copia el **Client ID** generado

### Paso 3: Configurar en el proyecto
1. El archivo `.env` ya está configurado con el Google Client ID
2. La configuración se carga automáticamente al iniciar la aplicación

## 2. Configuración del Backend

Tu backend debe tener un endpoint para manejar la autenticación con Google:

### Endpoint para Google:
```
POST /auth/google
Body: { credential: "google_jwt_token" }
```

### Respuesta esperada:
```json
{
  "access_token": "jwt_token_del_backend",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "nombre": "Nombre Usuario",
    "avatar": "https://example.com/avatar.jpg",
    "fechaRegistro": "2025-06-25T02:28:28.878Z"
  }
}
```

## 3. Verificación

1. Reinicia el servidor de desarrollo
2. Ve a la página de login/registro
3. Deberías ver el botón de Google
4. Verifica en la consola del navegador que no hay errores de configuración

## 4. Producción

Para producción, actualiza las URLs en Google Cloud Console:
- Cambia `http://localhost:5173` por tu dominio de producción
- Actualiza las variables de entorno en tu servidor de producción

## Notas Importantes

- **Seguridad**: El Client Secret solo debe estar en el backend
- **HTTPS**: En producción, asegúrate de usar HTTPS
- **Dominios**: Configura correctamente los dominios autorizados en Google Cloud Console

## Solución de Problemas

### Error: "Google Client ID no configurado"
- Verifica que el archivo `.env` existe y tiene el formato correcto
- Reinicia el servidor de desarrollo

### Error: "Credenciales inválidas"
- Verifica que las URLs de redirección estén configuradas correctamente
- Asegúrate de que el backend esté manejando correctamente los tokens 