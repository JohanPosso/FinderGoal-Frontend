# Parser de WhatsApp para FinderGoal

## 🚀 Nueva Funcionalidad: Procesamiento Automático de Listados de WhatsApp

### ¿Qué hace?

Esta nueva funcionalidad permite a los usuarios pegar listados de WhatsApp de partidos de fútbol y que la IA extraiga automáticamente toda la información relevante para crear un partido en la aplicación.

### 🎯 Características

- **Procesamiento Inteligente**: Utiliza Google Gemini AI para analizar y extraer información de listados de WhatsApp
- **Extracción Automática**: Identifica y extrae:
  - Fecha del partido
  - Hora del partido
  - Ubicación/cancha
  - Tipo de fútbol (5v5, 7v7, 11v11, etc.)
  - Precio por persona
  - Lista de jugadores confirmados
- **Validación Inteligente**: Detecta automáticamente si el texto es un listado válido de WhatsApp
- **Interfaz Intuitiva**: Modal fácil de usar con preview de datos extraídos
- **Integración Perfecta**: Los datos se aplican automáticamente al formulario de creación de partidos

### 📱 Cómo Usar

1. **Accede a Crear Partido**: Ve a la página de crear partido
2. **Haz clic en "Pegar Listado de WhatsApp"**: Botón naranja prominente en el formulario
3. **Pega tu listado**: Puedes pegar directamente desde WhatsApp o escribir manualmente
4. **Procesa con IA**: Haz clic en "Procesar con IA" para extraer la información
5. **Revisa y Aplica**: Verifica los datos extraídos y haz clic en "Aplicar Datos"
6. **Ajusta si es necesario**: Los datos se aplican automáticamente al formulario

### 📋 Formato de Listado Soportado

La funcionalidad reconoce listados como este:

```
Partido sábado 21 de junio

Cancha 4, piso 2, de la 63 con 30

Fútbol 7-7 (14 cupos)

hora 3:00pm

$16.000 por persona (pagar y enviar comprobante lo antes posible)

Nequi: 320 2268452

1. Orlando✅
2. Gustavo✅
3. Mateo✅
4. Santiago Guevara
5. Orlando 2✅
6. Carlos Rodríguez✅
7. William Gómez 1
8. William Gómez 2
9. Mateo1✅
10. Orlando 3✅
11. Camilo Cardenas.
12. Juan Carlos
13. Mateo 2
```

### 🔧 Configuración Requerida

Para que funcione la IA, necesitas configurar la API Key de Google Gemini:

1. **Obtén una API Key**: Ve a [Google AI Studio](https://aistudio.google.com/)
2. **Crea un proyecto**: Si no tienes uno
3. **Genera una API Key**: Para el modelo Gemini
4. **Configura la variable de entorno**: Agrega en tu archivo `.env`:

```env
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

### 🛠️ Archivos Creados/Modificados

#### Nuevos Archivos:
- `src/utils/whatsappParser.js` - Lógica de procesamiento con IA
- `src/components/WhatsappParser.jsx` - Componente del modal
- `WHATSAPP_PARSER_README.md` - Esta documentación

#### Archivos Modificados:
- `src/pages/CreateMatch.jsx` - Integración del parser

### 🎨 Características de la UI

- **Diseño Consistente**: Mantiene el tema Sporty & Energetic de la aplicación
- **Animaciones Suaves**: Usa Framer Motion para transiciones fluidas
- **Validación Visual**: Indicadores visuales de formato válido/inválido
- **Preview de Datos**: Muestra claramente qué información se extrajo
- **Responsive**: Funciona perfectamente en móvil y desktop

### 🔍 Funciones Principales

#### `parseWhatsappList(whatsappText)`
Procesa el texto con Gemini AI y extrae información estructurada.

#### `isValidWhatsappList(text)`
Valida si el texto parece ser un listado válido de WhatsApp.

#### `cleanWhatsappText(text)`
Limpia y formatea el texto para mejor procesamiento.

### 🚨 Manejo de Errores

- **Validación de Formato**: Detecta si el texto no es un listado válido
- **Errores de API**: Maneja errores de conexión con Gemini AI
- **Datos Incompletos**: Funciona incluso si faltan algunos campos
- **Feedback Visual**: Mensajes claros de error y éxito

### 💡 Casos de Uso

1. **Organizadores de Partidos**: Copian listados de WhatsApp y crean partidos rápidamente
2. **Grupos de Fútbol**: Procesan listados existentes para migrar a la plataforma
3. **Administradores**: Importan datos de otros grupos o aplicaciones
4. **Usuarios Casuales**: Convierten conversaciones de WhatsApp en partidos organizados

### 🔮 Futuras Mejoras

- **Soporte para Imágenes**: Procesar capturas de pantalla de WhatsApp
- **Múltiples Formatos**: Soporte para otros formatos de listados
- **Historial de Procesamiento**: Guardar listados procesados anteriormente
- **Edición de Datos**: Permitir editar datos extraídos antes de aplicar
- **Exportación**: Exportar listados procesados a otros formatos

### 📞 Soporte

Si tienes problemas con esta funcionalidad:

1. Verifica que tu API Key de Gemini esté configurada correctamente
2. Asegúrate de que el listado tenga el formato esperado
3. Revisa la consola del navegador para errores específicos
4. Contacta al equipo de desarrollo si persisten los problemas

---

¡Disfruta creando partidos de fútbol de manera más eficiente! ⚽ 