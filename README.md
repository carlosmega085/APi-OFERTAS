# API Plataforma SaaS & Cumplimiento Normativo (v1.0)

Este repositorio contiene la **API REST** para una plataforma móvil multi-tenant diseñada para conectar a empresas, consultores profesionales y proveedores certificados en un ecosistema unificado de certificaciones y cumplimiento normativo.

El proyecto combina un **módulo legacy de administración SaaS** y un **módulo operativo de cumplimiento y diagnóstico**, ambos protegidos mediante **JWT local**.

---

## Stack Tecnológico

- **Core**: Node.js & Express (ES Modules)
- **Base de datos**: MySQL & Sequelize ORM
- **Almacenamiento de archivos**: Supabase Storage (Bucket: `comprobantes`)
- **Validación de esquemas**: Joi
- **Autenticación**:
  - **SaaS Admin**: Autenticación local mediante **JSON Web Token (JWT)** (requiere rol de `admin`).
  - **Plataforma Operativa**: Autenticación local mediante **JSON Web Token (JWT)**.
- **Tareas Programadas**: Node-Cron (Servicio de limpieza y mantenimiento automático).

---

## Estructura del Proyecto

El backend está organizado siguiendo una arquitectura desacoplada basada en capas (Modelos, Controladores, Servicios y Rutas):

```text
API-ofertas-SAAS-MOVIL/
│
├── config/              # Configuración de DB, JWT y credenciales
│   ├── database.js      # Conexión principal de Sequelize
│   └── jwt.js           # Clave secreta y configuración del token local
│
├── controllers/         # Controladores (Recepción de peticiones HTTP)
│   ├── saas/            # Controladores del motor de administración SaaS
│   ├── auth.controller.js
│   ├── diagnostico.controller.js
│   └── ...
│
├── database/            # Archivos y scripts de base de datos
│
├── docs/                # Documentación extendida
│   └── saas-admin.md    # Manual de la API SaaS Admin
│
├── empresas/            # Modelos y servicios del inquilino (Tenant)
│
├── middlewares/         # Autenticación, roles, aislamiento de datos y Multer
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── uploadDocs.middleware.js
│
├── models/              # Modelos de Sequelize y configuración de relaciones
│   ├── index.js         # Punto central de asociaciones de base de datos
│   ├── Usuario.js
│   ├── EmpresaPerfil.js
│   ├── Consultor.js
│   ├── Auditor.js
│   ├── Diagnostico.js
│   └── Recomendacion.js
│
├── planes/              # Módulo de planes de suscripción
│
├── routes/              # Definición de endpoints
│   ├── index.js         # Enrutador principal de la plataforma operativa (/api)
│   ├── saas.routes.js   # Enrutador de administración global SaaS (/api/saas)
│   └── ...
│
├── services/            # Capa de lógica de negocio (El corazón de la API)
│   ├── auth.service.js
│   ├── diagnostico.service.js
│   └── cleanup.service.js
│
├── suscripciones/       # Gestión de membresías y pagos de empresas clientes
│
├── tests/               # Pruebas de integración y unitarias
│
├── utils/               # Helpers, respuestas HTTP unificadas
│
└── validations/         # Esquemas de validación de payloads con Joi
```

---

## Guía de Inicio Rápido (Setup)

### 1. Configurar Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente plantilla:

```env
PORT=3000

# Base de Datos (MySQL)
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=app_ofertas_saas

# Autenticación JWT Local
JWT_SECRET=tu_secreto_super_seguro_para_jwt

# Supabase Storage Integration
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=tu_supabase_anon_or_service_key

# La autenticación es 100% mediante JWT Local (no se requiere integración externa con Clerk).
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar las librerías necesarias:

```bash
npm install
```

### 3. Sincronizar y Sembrar la Base de Datos

Para forzar la recreación de las tablas limpias y sembrar los planes iniciales configurados en la plataforma, corre el script de sincronización de Sequelize:

```bash
npm run db:force
```

### 4. Iniciar Servidor

- **Modo Producción**:
  ```bash
  npm start
  ```
- **Modo Desarrollo (con recarga automática de Nodemon)**:
  ```bash
  npm run dev
  ```

---

## Mapeo y Endpoints de la API

La API cuenta con dos contextos principales de ejecución:

### 1. API Global SaaS Admin (`/api/saas`)

_Protección:_ Requiere cabecera `Authorization: Bearer <jwt_local_token>` de un usuario con rol de **admin**.

- **Empresas (`/empresas`)**:
  - `POST /` - Crear empresa con su usuario administrador, suscripción inicial pendiente y juegos/turnos por defecto.
  - `GET /` - Listar todas las empresas con sus estados y planes.
  - `GET /:id` - Obtener detalle completo de un inquilino (tenant).
  - `PUT /:id` - Editar información o cambiar el estado (activo/inactivo).
  - `DELETE /:id` - Anulación (Soft Delete) de la empresa.
- **Credenciales (`/empresas/:id/admin`)**:
  - `GET /` - Consultar administrador de la empresa.
  - `PUT /:usuarioId` - Resetear credenciales de acceso (username/password).
- **Planes (`/planes`)**:
  - `POST /` | `GET /` | `PUT /:id` | `DELETE /:id` - Gestión del catálogo de planes de suscripción.
- **Suscripciones (`/suscripciones`)**:
  - `POST /` - Registrar nueva suscripción en estado `pendiente`.
  - `GET /` - Listar historial completo de membresías.
  - `PUT /:id/aprobar` - Aprobar membresía pendiente e iniciar fechas de vigencia.
  - `PUT /:id/denegar` - Rechazar transacción transaccionalmente.
- **Monitoreo (`/monitoreo` y `/status-empresas`)**:
  - `GET /monitoreo` - KPIs globales de uso y salud de la plataforma SaaS.

> [!NOTE]
> Para más información sobre los payloads y esquemas JSON del panel administrativo, consulta la [Documentación SaaS Admin](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/docs/saas-admin.md).

---

### 2. API Operativa y de Cumplimiento (`/api`)

_Protección:_ Rutas operativas privadas protegidas mediante cabecera `Authorization: Bearer <jwt_local_token>`.

#### Autenticación y Registro (`/auth`)

- `POST /login` - Inicio de sesión unificado para todos los perfiles de usuario. Retorna un JWT local.
- `POST /register-cliente-empresa` - Registro de empresas clientes (Categorías A o B). Permite cargar un logotipo en formato `multipart/form-data`.
- `POST /register-consultor` - Registro público de consultores. Requiere subir documentos obligatorios como Currículum Vitae (PDF/Imagen) y Título universitario.
- `POST /register-auditor` - Registro de auditores en formación. Requiere Currículum y Título universitario.

#### Administración Operativa (`/admin/perfiles`)

- `GET /empresas`, `GET /consultores`, `GET /auditores` - Listado de solicitudes de perfil para validación (filtrable por `estado_perfil`).
- `PATCH /empresas/:id/validar`, `PATCH /consultores/:id/validar`, `PATCH /auditores/:id/validar` - Aprobar o rechazar perfiles pendientes para darles de alta en la plataforma.

#### Dashboard por Rol (`/dashboard`)

- `GET /` - Retorna los KPIs, actividades recientes, perfiles y recomendaciones específicas adaptadas automáticamente al rol del usuario autenticado (Empresa, Consultor o Auditor).

#### Módulo de Diagnósticos y Recomendaciones (`/diagnosticos`)

- `GET /` - Listar diagnósticos higiénico-sanitarios según el rol (el consultor ve los suyos, el auditor ve en los que asiste, y la empresa solo ve los finalizados).
- `POST /` - Crear diagnóstico inicial en estado `borrador` (Consultor).
- `POST /:id/recomendaciones` - Agregar recomendaciones de mejora en bloque y asociar proveedores oficiales.
- `GET /:id` - Obtener detalle del diagnóstico y sus recomendaciones.
- `PATCH /:id/finalizar` - Cerrar diagnóstico para que sea visible por la empresa evaluada.

#### Catálogo de Proveedores Verificados (`/proveedores` y `/admin/proveedores`)

- `GET /` - Listar catálogo de proveedores para recomendaciones sanitarias.
- `GET /:id` - Detalle de un proveedor.
- `POST /` | `PUT /:id` | `DELETE /:id` - Creación, edición y desactivación de proveedores autorizados (Solo Rol Admin).

#### Gestión de Cuenta Propia (`/perfil`)

- `GET /me` - Obtener datos del perfil propio de la sesión.
- `PUT /me` - Modificar información de perfil y actualizar documentos en Supabase.
  - _Regla Crítica_: Si un consultor/auditor edita campos sensibles (`cedula`) o actualiza `curriculum` o `titulo`, su perfil volverá automáticamente a estado `pendiente` de validación.

#### Directorio Compartido (`/directorio`)

- `GET /consultores` - Directorio de consultores aprobados (Accesible por cualquier usuario autenticado).
- `GET /empresas` - Directorio de empresas aprobadas con perfiles públicos (Accesible por Consultor, Auditor y Admin).
- `GET /auditores` - Directorio de auditores en formación aprobados (Accesible por Consultor y Admin).

#### Módulo de Mensajería Interna (`/mensajeria`)

- `GET /conversaciones` - Obtener lista de chats/conversaciones del usuario actual ordenados por el último mensaje.
- `POST /conversaciones` - Obtener o iniciar un chat con otro usuario enviando `{ receptor_id }`.
- `GET /conversaciones/:id/mensajes` - Consultar el historial de mensajes de un chat y marcarlos como leídos automáticamente.
- `POST /conversaciones/:id/mensajes` - Enviar un nuevo mensaje dentro de un chat.

