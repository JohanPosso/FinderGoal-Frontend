# Guía de Deployment - DateFootball

## 🚀 Netlify Deployment

### Archivos de configuración creados:

1. **`public/_redirects`** - Maneja el enrutamiento de React Router
2. **`netlify.toml`** - Configuración de build y deploy
3. **`vercel.json`** - Configuración para Vercel (opcional)

### Pasos para deploy en Netlify:

1. **Conecta tu repositorio** a Netlify
2. **Configura las variables de entorno** en Netlify:
   ```
   VITE_API_URL=https://tu-backend-url.com
   VITE_GOOGLE_CLIENT_ID=738269751915-ppicnv6ti2qs14jk6e783p2jqase90bt.apps.googleusercontent.com
   VITE_OPENCAGE_API_KEY=b39862cc5b1643ae86dd2e69d63c034f
   VITE_GEMINI_API_KEY=AIzaSyCpwOQ5vkgfCwqsp8OJfma-cE2S4-tlJOQ
   VITE_REDIRECT_URI=https://tu-app-url.netlify.app
   ```

3. **Configura Google OAuth** para producción:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Agrega tu dominio de Netlify a "Authorized JavaScript origins"
   - Ejemplo: `https://tu-app.netlify.app`

### Configuración de build:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

## 🔧 Variables de entorno para producción:

```env
# Backend URL (reemplaza con tu URL real)
VITE_API_URL=https://tu-backend-url.com

# Google OAuth (mantén el mismo Client ID)
VITE_GOOGLE_CLIENT_ID=738269751915-ppicnv6ti2qs14jk6e783p2jqase90bt.apps.googleusercontent.com

# API Keys
VITE_OPENCAGE_API_KEY=b39862cc5b1643ae86dd2e69d63c034f
VITE_GEMINI_API_KEY=AIzaSyCpwOQ5vkgfCwqsp8OJfma-cE2S4-tlJOQ

# URL de redirección
VITE_REDIRECT_URI=https://tu-app-url.netlify.app
```

## 🌐 Dominios autorizados en Google Cloud Console:

Agrega estos dominios a tu Google OAuth Client ID:

### Authorized JavaScript origins:
```
http://localhost:5173
https://tu-app.netlify.app
https://tu-app-url.netlify.app
```

### Authorized redirect URIs:
```
http://localhost:5173
https://tu-app.netlify.app
https://tu-app-url.netlify.app
```

## ✅ Verificación post-deploy:

1. **Rutas funcionan**: `/login`, `/register`, `/dashboard`, etc.
2. **Google OAuth funciona**: Botón de Google en login/register
3. **API conecta**: Las peticiones llegan a tu backend
4. **Navegación**: Los enlaces internos funcionan correctamente

## 🐛 Solución de problemas comunes:

### Error 404 en rutas:
- Verifica que `public/_redirects` esté en el repositorio
- Confirma que `netlify.toml` esté configurado correctamente

### Google OAuth no funciona:
- Verifica que el dominio esté en Google Cloud Console
- Confirma que las variables de entorno estén configuradas

### API no conecta:
- Verifica que `VITE_API_URL` apunte a tu backend
- Confirma que tu backend esté desplegado y funcionando 