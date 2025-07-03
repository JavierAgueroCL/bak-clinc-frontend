# BAK Clinic Frontend

Sistema de gestión clínica BAK - Frontend desarrollado con Next.js, React 19 y Tailwind CSS.

## 🏥 Descripción

Frontend completo para el sistema de gestión clínica BAK que implementa todas las funcionalidades de autenticación y gestión de usuarios definidas en la API backend.

## ✨ Características

- **Autenticación completa**: Login, registro, recuperación de contraseña, verificación de email
- **Gestión de usuarios**: Perfil de usuario con roles (paciente, doctor, admin)
- **Interfaz responsiva**: Diseñada con Tailwind CSS v4
- **TypeScript**: Tipado completo para mejor desarrollo y mantenibilidad
- **Context API**: Estado global de autenticación
- **Validación**: Formularios con validación en el frontend
- **Arquitectura moderna**: Next.js 15 con App Router

## 🚀 Tecnologías

- **Next.js 15.3.4** - Framework de React
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático
- **Tailwind CSS v4** - Framework de CSS
- **ESLint** - Linter para código JavaScript/TypeScript

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal con AuthProvider
│   └── page.tsx            # Página principal (Dashboard)
├── components/
│   ├── Dashboard.tsx       # Componente principal del dashboard
│   └── auth/
│       ├── LoginForm.tsx           # Formulario de inicio de sesión
│       ├── RegisterForm.tsx        # Formulario de registro
│       ├── ProfileCard.tsx         # Tarjeta de perfil de usuario
│       ├── ForgotPasswordForm.tsx  # Recuperación de contraseña
│       ├── ResetPasswordForm.tsx   # Restablecimiento de contraseña
│       └── VerifyEmailForm.tsx     # Verificación de email
├── context/
│   └── AuthContext.tsx     # Context API para autenticación
├── services/
│   └── api.ts             # Servicios de API
└── types/
    └── auth.ts            # Tipos TypeScript para autenticación
```

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd bak-clinic-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```
   Edita `.env.local` según tu configuración:
   
   **Para desarrollo local (frontend fuera de Docker):**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
   
   **Para Docker Compose (ambos servicios en Docker):**
   ```
   NEXT_PUBLIC_API_URL=http://bak-clinic-app:3000
   ```

## 🏃‍♂️ Ejecución

### Desarrollo Local
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3002](http://localhost:3002)

### Con Docker
```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Solo ejecutar (si ya está construido)
docker-compose up
```

### Producción
```bash
# Construir la aplicación
npm run build

# Ejecutar en modo producción
npm run start
```

### Linting
```bash
npm run lint
```

## 📋 Funcionalidades implementadas

### Autenticación
- ✅ **Registro de usuarios** - Con validación de campos y roles
- ✅ **Inicio de sesión** - Autenticación con JWT
- ✅ **Perfil de usuario** - Visualización y gestión del perfil
- ✅ **Recuperación de contraseña** - Envío de token por email
- ✅ **Restablecimiento de contraseña** - Con validación de token
- ✅ **Verificación de email** - Confirmación de cuenta

### Roles de usuario
- **Paciente** - Usuario estándar del sistema
- **Doctor** - Profesional médico con permisos especiales
- **Admin** - Administrador del sistema

### Componentes UI
- **Dashboard responsivo** - Layout principal adaptable
- **Formularios validados** - Con manejo de errores y estados de carga
- **Navegación intuitiva** - Cambio fluido entre vistas
- **Indicadores visuales** - Estados de verificación y roles

## 🔧 Configuración del Backend

Este frontend está diseñado para funcionar con el backend de BAK Clinic. 

### Configuración según el entorno:

**Desarrollo Local con Proxy (recomendado - evita CORS):**
- **Backend Docker**: Puerto 3000 (`http://localhost:3000`)
- **Frontend Local**: Puerto 3002 (`http://localhost:3002`)
- **Proxy Next.js**: Maneja las peticiones al backend automáticamente
- Configuración: `NEXT_PUBLIC_API_URL=` (vacío para usar proxy)

**Desarrollo Local Directo (requiere CORS en backend):**
- **Backend Docker**: Puerto 3000 (`http://localhost:3000`)
- **Frontend Local**: Puerto 3002 (`http://localhost:3002`)
- Configuración: `NEXT_PUBLIC_API_URL=http://localhost:3000`

**Docker Compose:**
- **Backend**: `bak-clinic-app:3000` (red interna Docker)
- **Frontend**: Puerto 3002 (`http://localhost:3002`)
- Configuración: `NEXT_PUBLIC_API_URL=http://bak-clinic-app:3000`

### Verificar conexión al backend:
```bash
# Verificar que el backend Docker esté corriendo
docker ps | grep bak-clinic-app

# Probar conexión al backend directamente
curl http://localhost:3000/

# Probar conexión a través del proxy Next.js (con el frontend corriendo)
curl http://localhost:3002/health
```

### Solución de problemas CORS:

Si obtienes errores de CORS como "strict-origin-when-cross-origin", usa la configuración con proxy (por defecto):
- `NEXT_PUBLIC_API_URL=` (vacío)
- Next.js actúa como proxy entre el frontend y backend
- No requiere configuración CORS en el backend

### Endpoints utilizados:
- `GET /` - Health check
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil del usuario
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña
- `POST /api/auth/verify-email` - Verificar email

## 🎨 Diseño y UX

- **Tema claro**: Interfaz limpia y profesional
- **Colores**: Paleta de azules para elementos principales
- **Responsividad**: Adaptable a dispositivos móviles y desktop
- **Accesibilidad**: Formularios con labels y validación clara
- **Estados de carga**: Indicadores visuales para operaciones asíncronas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de BAK Clinic.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el desarrollo, contacta al equipo de desarrollo.