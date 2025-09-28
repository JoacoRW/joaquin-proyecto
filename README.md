# 🚀 Joaquín Proyecto - Sistema de Autenticación Serverless

Sistema completo de autenticación con AWS Cognito, Lambda y Frontend web.

## 📁 Estructura del Proyecto

```
Joaquin_Proyecto/
├── 🔧 Backend (Serverless AWS)
│   ├── src/                 # Funciones Lambda
│   ├── serverless.yml       # Configuración Serverless
│   └── package.json        # Dependencias backend
│
├── 🌐 Frontend Web
│   └── Pagina/             # Aplicación web completa
│       ├── index.html      # Página de login/registro
│       ├── dashboard.html  # Dashboard post-login
│       ├── style.css       # Estilos modernos
│       └── script.js       # Lógica de autenticación
│
└── 🛠️ Scripts de Deployment
    ├── start-web.ps1       # Script Windows para abrir la web
    └── start-web.sh        # Script Unix para abrir la web
```

## 🎯 Comandos Principales

### **🚀 Deploy y abrir página automáticamente:**
```bash
npm run deploy-and-web
```
✨ **¡Esto hace todo automáticamente!**
- Deploya el backend a AWS
- Inicia el servidor web local
- Abre la página en tu navegador
- Muestra las URLs importantes

### **📦 Solo deploy backend:**
```bash
npm run deploy
# o también:
serverless deploy
```

### **🌐 Solo abrir página web:**
```bash
# Opción 1: Con npm
npm run web

# Opción 2: Con script PowerShell
npm run start-web

# Opción 3: Manual
cd Pagina
python -m http.server 8000
# Luego abrir http://localhost:8000
```

## 🔗 URLs del Sistema

Después del deploy, el sistema estará disponible en:

### **🖥️ Frontend (Página Web):**
```
http://localhost:8000
```

### **⚡ Backend APIs:**
- **Login:** `POST https://[API-ID].execute-api.us-east-1.amazonaws.com/dev/login`
- **Registro:** `POST https://[API-ID].execute-api.us-east-1.amazonaws.com/dev/createUser`
- **Nueva Contraseña:** `POST https://[API-ID].execute-api.us-east-1.amazonaws.com/dev/setNewPassword`
- **Usuario Info:** `GET https://[API-ID].execute-api.us-east-1.amazonaws.com/me`
- **Refresh Token:** `POST https://[API-ID].execute-api.us-east-1.amazonaws.com/auth/refresh`

## 🎮 Cómo Usar la Aplicación

### 1. **Desplegar el sistema:**
```bash
npm run deploy-and-web
```

### 2. **Crear una cuenta:**
- Abre http://localhost:8000 (se abre automáticamente)
- Haz clic en "crear una cuenta"
- Completa: username, email (formato: user@domain.com), password

### 3. **Iniciar sesión:**
- Usa tu **email** como username
- Ingresa tu contraseña
- Si es primera vez, establece nueva contraseña

### 4. **¡Listo!**
- Serás redirigido al dashboard
- Podrás ver tu información de usuario

## ✨ Características del Sistema

### **🔐 Autenticación Completa:**
- ✅ Registro de usuarios
- ✅ Login con validación
- ✅ Cambio de contraseña temporal
- ✅ Refresh tokens automático
- ✅ Dashboard con info del usuario

### **🎨 Frontend Moderno:**
- ✅ Diseño responsive (móvil/desktop)
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros
- ✅ Loading states
- ✅ Animaciones suaves

### **⚡ Backend Serverless:**
- ✅ AWS Lambda functions
- ✅ AWS Cognito User Pool
- ✅ API Gateway con CORS
- ✅ DynamoDB para permisos
- ✅ Logs detallados

## 🔧 Comandos de Desarrollo

```bash
# Ver logs de una función específica
serverless logs -f login

# Deploy solo una función
serverless deploy function -f login

# Correr en modo offline (desarrollo)
npm run offline

# Ver información del stack
serverless info
```

## 📋 Requisitos

- **Node.js** 18+
- **Python** 3.x (para servidor web local)
- **AWS CLI** configurado
- **Serverless Framework** 3+

## 🚨 Solución de Problemas

### **❌ Error "Error de conexión":**
- Verificar que el deploy fue exitoso
- Revisar que las URLs en `script.js` coincidan con el deploy
- Verificar CORS headers en las funciones Lambda

### **❌ Error "Usuario no encontrado":**
- Crear usuario primero usando el formulario de registro
- Usar el **email** como username para login

### **❌ "NEW_PASSWORD_REQUIRED":**
- Es normal en el primer login
- Seguir el flujo para establecer nueva contraseña

---

## 🎯 **¡Comando mágico para empezar!**

```bash
npm run deploy-and-web
```

¡Esto hace todo automáticamente y abre tu página web! 🚀