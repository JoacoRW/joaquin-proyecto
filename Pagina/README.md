# 🌐 Frontend - Sistema de Autenticación

Este es el frontend web para el sistema de autenticación con AWS Cognito y Serverless.

## 📁 Archivos

- **`index.html`** - Página principal con login y registro
- **`style.css`** - Estilos CSS modernos y responsive
- **`script.js`** - Lógica JavaScript para autenticación
- **`dashboard.html`** - Dashboard simple post-login

## 🚀 Cómo usar

### 1. Abrir la aplicación
Simplemente abre `index.html` en tu navegador web.

### 2. Crear una cuenta
1. Haz clic en "Haz clic aquí para crear una"
2. Completa el formulario:
   - **Username**: Cualquier nombre de usuario
   - **Email**: Debe ser un email válido (formato: usuario@dominio.com)
   - **Password**: Mínimo 8 caracteres, mayúsculas, minúsculas y números

### 3. Iniciar sesión
1. Usa tu **email** como username
2. Ingresa tu contraseña
3. Si es tu primer login, deberás establecer una nueva contraseña

### 4. Dashboard
Después del login exitoso serás redirigido al dashboard donde podrás ver tu información de usuario.

## ✨ Características

- ✅ **Validación en tiempo real** de email y contraseña
- ✅ **Diseño responsive** (funciona en móviles)
- ✅ **Manejo de errores** con mensajes claros
- ✅ **Loading states** durante las peticiones
- ✅ **Integración completa** con el backend serverless
- ✅ **Flujo completo** de autenticación (login → nueva contraseña → dashboard)

## 🎨 Diseño

- **Estilo moderno** con gradientes y sombras
- **Card centrada** para mejor UX
- **Iconos FontAwesome** para elementos visuales
- **Animaciones suaves** y transiciones
- **Colores**: Gradiente azul-púrpura (#667eea → #764ba2)

## 🔗 Endpoints utilizados

El frontend se conecta automáticamente a estos endpoints del backend:

- `POST /login` - Autenticación de usuarios
- `POST /createUser` - Registro de nuevos usuarios
- `POST /setNewPassword` - Cambio de contraseña temporal
- `GET /me` - Información del usuario autenticado
- `POST /auth/refresh` - Renovación de tokens

## 🔧 Configuración

Las URLs de la API están configuradas en `script.js`:

```javascript
const API_BASE_URL = 'https://2l83g90ljg.execute-api.us-east-1.amazonaws.com/dev';
const API_BASE_URL_HTTP = 'https://saex8k8zpc.execute-api.us-east-1.amazonaws.com';
```

Si cambias los endpoints del backend, actualiza estas URLs.

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge (versiones modernas)
- ✅ Dispositivos móviles (iOS/Android)
- ✅ Tablets y desktop
- ⚠️ Requiere JavaScript habilitado

## 🔐 Seguridad

- Los tokens se almacenan en `localStorage` del navegador
- Las contraseñas se validan según las políticas de Cognito
- Las peticiones usan HTTPS
- Manejo automático de refresh tokens

---

💡 **Tip**: Abre las herramientas de desarrollador (F12) para ver logs detallados en la consola.