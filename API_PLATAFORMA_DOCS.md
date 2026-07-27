# 📚 Manual de Integración Técnica: API de Certificaciones y Cumplimiento Normativo (v1.0)

Este documento detalla la arquitectura, los esquemas de base de datos y la especificación de los endpoints de la API REST para la plataforma móvil de certificaciones y cumplimiento normativo.

La plataforma implementa un modelo **SaaS multi-tenant** y conecta a tres entidades principales:

1. **Empresas (Categoría A y B)** que solicitan certificaciones y diagnósticos.
2. **Consultores** (profesionales calificados) que realizan diagnósticos y recomiendan insumos.
3. **Auditores en formación** que pasan por un proceso de revisión y entrenamiento.

---

## 🛠️ Stack Tecnológico

- **Core**: Node.js & Express (ES Modules)
- **Base de datos**: MySQL & Sequelize ORM
- **Almacenamiento de archivos**: Supabase Storage (Bucket: `comprobantes`)
- **Validación de esquemas**: Joi
- **Autenticación**: JSON Web Token (JWT) local

---

## 🗄️ Modelos de Base de Datos y Relaciones

### 1. Modelo: `Usuario` (`usuarios`)

Representa las cuentas de acceso.

- `id` (Integer, PK, auto-increment)
- `empresa_id` (Integer, FK) - Inquilino al que pertenece.
- `tienda_id` (Integer, FK, Nullable) - Sucursal (opcional).
- `nombre` (String)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, hash Bcrypt)
- `rol` (Enum: `admin`, `vendedor`, `empresa`, `consultor`, `auditor`)
- `estado` (Enum: `activo`, `inactivo`, default: `activo`)

### 2. Modelo: `EmpresaPerfil` (`empresa_perfiles`)

Información de perfil extendida para Empresas Categoría A y B.

- `id` (Integer, PK)
- `empresa_id` (Integer, FK) - Tenant asignado a esta empresa cliente.
- `usuario_id` (Integer, FK) - Cuenta de usuario representante.
- `razon_social` (String)
- `rup` (String) - Registro Único de Proveedores o similar.
- `descripcion` (Text, Nullable)
- `representante_nombre` (String)
- `representante_telefono` (String)
- `representante_correo` (String)
- `programa_requisitos` (Text, Nullable)
- `tipo_servicio` (String, Nullable)
- `logo_url` (String, Nullable) - URL pública en Supabase.
- `estado_perfil` (Enum: `pendiente`, `aprobado`, `rechazado`, default: `pendiente`)

### 3. Modelo: `Consultor` (`consultores`)

Perfil del profesional certificado.

- `id` (Integer, PK)
- `usuario_id` (Integer, FK) - Cuenta del profesional.
- `empresa_id` (Integer, FK) - Vinculado al tenant global de la plataforma (`1`).
- `cedula` (String, Unique)
- `correo` (String)
- `telefono` (String)
- `cv_url` (String)
- `titulo_url` (String)
- `maestria_url` (String, Nullable)
- `carta1_url` (String, Nullable)
- `carta2_url` (String, Nullable)
- `carta3_url` (String, Nullable)
- `proforma_url` (String, Nullable)
- `foto_url` (String, Nullable)
- `estado_perfil` (Enum: `pendiente`, `aprobado`, `rechazado`, default: `pendiente`)

### 4. Modelo: `Auditor` (`auditores`)

Perfil del auditor en formación.

- `id` (Integer, PK)
- `usuario_id` (Integer, FK) - Cuenta del auditor.
- `empresa_id` (Integer, FK) - Vinculado al tenant global de la plataforma (`1`).
- `cedula` (String, Unique)
- `correo` (String)
- `telefono` (String)
- `cv_url` (String)
- `titulo_url` (String)
- `capacitacion_url` (String, Nullable)
- `carta1_url` (String, Nullable)
- `maestria_url` (String, Nullable)
- `carta1_url`, `carta2_url`, `carta3_url` (String, Nullable)
- `foto_url` (String, Nullable)
- `estado_perfil` (Enum: `pendiente`, `aprobado`, `rechazado`, default: `pendiente`)

### 5. Modelo: `Diagnostico` (`diagnosticos`)

Representa la evaluación higiénico-sanitaria y de cumplimiento realizada a una empresa por un consultor.

- `id` (Integer, PK, auto-increment)
- `empresa_id` (Integer, FK) - Empresa evaluada.
- `consultor_id` (Integer, FK) - Consultor evaluador.
- `auditor_id` (Integer, FK, Nullable) - Auditor participante/sombra.
- `puntaje_cumplimiento` (Decimal) - Calificación final (0.00% a 100.00%).
- `observaciones` (Text, Nullable) - Apuntes generales.
- `estado` (Enum: `borrador`, `finalizado`, default: `borrador`)

### 6. Modelo: `Recomendacion` (`recomendaciones`)

Sugerencias de mejoras higiénicas o de insumos surgidas de un diagnóstico específico.

- `id` (Integer, PK, auto-increment)
- `diagnostico_id` (Integer, FK) - Diagnóstico origen.
- `tipo_sugerencia` (Enum: `insumo`, `servicio`, `equipo`)
- `descripcion` (Text) - Detalle de la recomendación.
- `norma_asociada` (String, Nullable) - Reglamento sanitario de referencia.
- `proveedor_id` (Integer, FK, Nullable) - Proveedor verificado recomendado.

---

## 🔐 Autenticación

Base URL: `/api/auth`

### 1. Iniciar Sesión (`POST /login`)

Permite autenticarse a cualquier rol de usuario.

- **Payload (JSON)**:

```json
{
  "username": "juan.consultor",
  "password": "mi_password_segura"
}
```

- **Respuesta (200)**:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 5,
      "nombre": "Juan Pérez",
      "username": "juan.consultor",
      "rol": "consultor",
      "empresa_id": 1,
      "tienda_id": null
    }
  }
}
```

---

## 📝 Registro de Perfiles (Público)

Base URL: `/api/auth`

> **Nota de carga**: Todos los endpoints de registro utilizan formato `multipart/form-data` para recibir archivos y texto simultáneamente.

### 1. Registro de Empresa Cliente (`POST /register-cliente-empresa`)

- **Campos de Texto**:
  - `nombre_empresa` (Requerido) - Nombre comercial.
  - `username` (Requerido) - Para la cuenta del representante.
  - `password` (Requerido) - Mínimo 6 caracteres.
  - `razon_social` (Requerido)
  - `rup` (Requerido)
  - `descripcion` (Opcional)
  - `representante_nombre` (Requerido)
  - `representante_telefono` (Requerido)
  - `representante_correo` (Requerido)
  - `programa_requisitos` (Opcional)
  - `tipo_servicio` (Opcional)
- **Archivos**:
  - `logo` (Opcional) - Imagen del logotipo de la empresa.

### 2. Registro de Consultor (`POST /register-consultor`)

- **Campos de Texto**:
  - `nombre` (Requerido)
  - `username` (Requerido)
  - `password` (Requerido)
  - `cedula` (Requerido)
  - `correo` (Requerido)
  - `telefono` (Requerido)
- **Archivos**:
  - `curriculum` (Requerido) - Documento PDF o Imagen.
  - `titulo` (Requerido) - Documento PDF o Imagen.
  - `maestria` (Opcional) - Documento PDF o Imagen.
  - `carta1`, `carta2`, `carta3` (Opcionales) - Recomendaciones (PDF/Imagen).
  - `proforma` (Opcional) - PDF o Imagen.
  - `foto` (Opcional) - Foto de carnet (Imagen).

### 3. Registro de Auditor en Formación (`POST /register-auditor`)

- **Campos de Texto**:
  - `nombre` (Requerido)
  - `username` (Requerido)
  - `password` (Requerido)
  - `cedula` (Requerido)
  - `correo` (Requerido)
  - `telefono` (Requerido)
- **Archivos**:
  - `curriculum` (Requerido) - PDF o Imagen.
  - `titulo` (Requerido) - PDF o Imagen.
  - `capacitacion` (Opcional) - Documento PDF o Imagen.
  - `carta1`, `carta2`, `carta3` (Opcionales) - Recomendaciones (PDF/Imagen).
  - `foto` (Opcional) - Foto de carnet (Imagen).

---

## 👑 Administración y Validación de Perfiles (Privado)

Base URL: `/api/admin/perfiles`

> **Nota de Cabecera**: Requiere la cabecera `Authorization: Bearer <JWT_TOKEN>` de un usuario con `rol: 'admin'`.

### 1. Listar Perfiles Pendientes o Historial

Retorna el listado de perfiles con la información de usuario asociada cargada.

- **GET `/empresas`**
- **GET `/consultores`**
- **GET `/auditores`**
- _Filtro opcional (Query Param)_: `?estado_perfil=pendiente` (Valores: `pendiente`, `aprobado`, `rechazado`).

### 2. Aprobar o Rechazar Perfiles

Permite dar de alta o rechazar una solicitud.

- **PATCH `/empresas/:id/validar`**
- **PATCH `/consultores/:id/validar`**
- **PATCH `/auditores/:id/validar`**
- **Payload (JSON)**:

```json
{
  "estado_perfil": "aprobado" // o "rechazado"
}
```

- **Respuesta (200)**:

```json
{
  "success": true,
  "message": "Perfil actualizado a aprobado",
  "data": {
    "id": 1,
    "estado_perfil": "aprobado",
    "updated_at": "2026-07-04T02:00:00.000Z"
  }
}
```

---

## 📊 Dashboard Dinámico por Rol (Privado)

Base URL: `/api/dashboard`

> **Nota de Cabecera**: Requiere la cabecera `Authorization: Bearer <JWT_TOKEN>` del usuario logueado.

### 1. Obtener Dashboard (`GET /`)

Detecta el rol del usuario autenticado en el token y sirve el payload adaptado para su pantalla en la aplicación móvil.

#### A. Ejemplo de respuesta para rol `empresa` (200):
```json
{
  "success": true,
  "message": "Dashboard de empresa obtenido exitosamente",
  "data": {
    "perfil": {
      "razon_social": "Alimentos de la Abuela S.A.",
      "rup": "RUP-998877",
      "representante_nombre": "Carlos Gómez",
      "tipo_servicio": "Consultoría Sanitaria",
      "logo_url": "https://supabase.co/storage/v1/object/public/logos/1.png",
      "estado_perfil": "aprobado"
    },
    "kpis": {
      "score_cumplimiento": 85.50,
      "diagnosticos_realizados": 3,
      "recomendaciones_recibidas": 7
    },
    "diagnosticos_recientes": [
      {
        "id": 1,
        "puntaje_cumplimiento": "85.50",
        "estado": "finalizado",
        "created_at": "2026-07-16T12:00:00.000Z",
        "Consultor": {
          "id": 2,
          "Usuario": { "nombre": "Dra. Sofía Martínez" }
        }
      }
    ],
    "recomendaciones_sugeridas": [
      {
        "id": 3,
        "tipo_sugerencia": "equipo",
        "descripcion": "Instalar lavamanos de pedal en zona de preparación",
        "norma_asociada": "Norma Técnica RTCA 67.01",
        "Proveedor": {
          "nombre": "Inox Equipos Industriales",
          "telefono": "+505 8888-8888",
          "email": "ventas@inoxequipos.com"
        }
      }
    ]
  }
}
```

#### B. Ejemplo de respuesta para rol `consultor` (200):
```json
{
  "success": true,
  "message": "Dashboard de consultor obtenido exitosamente",
  "data": {
    "perfil": {
      "id": 2,
      "cedula": "121-120280-0001A",
      "correo": "sofia.martinez@email.com",
      "telefono": "+505 7777-6666",
      "estado_perfil": "aprobado"
    },
    "kpis": {
      "empresas_atendidas": 4,
      "diagnosticos_completados": 10,
      "diagnosticos_en_borrador": 1
    },
    "diagnosticos_recientes": [
      {
        "id": 1,
        "puntaje_cumplimiento": "85.50",
        "estado": "finalizado",
        "created_at": "2026-07-16T12:00:00.000Z",
        "Empresa": {
          "id": 5,
          "nombre": "Alimentos de la Abuela S.A."
        }
      }
    ]
  }
}
```

#### C. Ejemplo de respuesta para rol `auditor` (200):
```json
{
  "success": true,
  "message": "Dashboard de auditor obtenido exitosamente",
  "data": {
    "perfil": {
      "id": 3,
      "cedula": "001-050695-0002B",
      "correo": "pedro.auditor@email.com",
      "telefono": "+505 5555-4444",
      "estado_perfil": "aprobado"
    },
    "kpis": {
      "auditorias_asistidas": 3
    },
    "auditorias_shadow_recientes": [
      {
        "id": 1,
        "puntaje_cumplimiento": "85.50",
        "estado": "finalizado",
        "created_at": "2026-07-16T12:00:00.000Z",
        "Empresa": { "nombre": "Alimentos de la Abuela S.A." },
        "Consultor": {
          "Usuario": { "nombre": "Dra. Sofía Martínez" }
        }
      }
    ]
  }
}
```

---

## 📋 Módulo de Diagnósticos y Recomendaciones (Privado)

Base URL: `/api/diagnosticos`

> **Nota de Cabecera**: Requiere la cabecera `Authorization: Bearer <JWT_TOKEN>` de un usuario con sesión activa.

### 1. Listar Diagnósticos (`GET /`)

Retorna la lista de diagnósticos según el rol del usuario:
*   **Consultor**: Todos los creados por él (incluyendo borradores).
*   **Auditor**: En los que asiste (`auditor_id`).
*   **Empresa**: Solo los pertenecientes a ella que estén en estado `'finalizado'`.

- **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Diagnósticos obtenidos exitosamente.",
  "data": [
    {
      "id": 1,
      "empresa_id": 5,
      "consultor_id": 2,
      "auditor_id": null,
      "puntaje_cumplimiento": "0.00",
      "observaciones": "Establecimiento limpio.",
      "estado": "borrador",
      "created_at": "2026-07-16T12:00:00.000Z",
      "Empresa": { "id": 5, "nombre": "Empresa Cliente S.A." },
      "Consultor": {
        "id": 2,
        "cedula": "121-120280-0001A",
        "Usuario": { "nombre": "Dra. Sofía Martínez" }
      }
    }
  ]
}
```

### 2. Crear Diagnóstico (`POST /`)

Exclusivo para el rol `consultor`.

- **Payload (JSON)**:
```json
{
  "empresa_id": 5,
  "auditor_id": 3,
  "puntaje_cumplimiento": 85.00,
  "observaciones": "Se requiere instalar lavamanos adicional.",
  "estado": "borrador"
}
```

### 3. Agregar Recomendaciones en Bloque (`POST /:id/recomendaciones`)

Exclusivo para el `consultor` creador del diagnóstico. El diagnóstico debe estar en estado `'borrador'`.

- **Payload (JSON)**:
```json
{
  "recomendaciones": [
    {
      "tipo_sugerencia": "equipo",
      "descripcion": "Instalar grifería de pedal.",
      "norma_asociada": "RTCA 67.01",
      "proveedor_id": 1
    }
  ]
}
```

### 4. Obtener Detalle de Diagnóstico (`GET /:id`)

Retorna la información del diagnóstico con sus recomendaciones sugeridas.
*   **Empresas**: Solo acceden si el diagnóstico pertenece a ellas y está `'finalizado'`.
*   **Consultores/Auditores**: Solo si son dueños o asistentes.

- **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Detalle del diagnóstico obtenido.",
  "data": {
    "id": 1,
    "puntaje_cumplimiento": "85.00",
    "observaciones": "Se requiere instalar lavamanos adicional.",
    "estado": "finalizado",
    "recomendaciones": [
      {
        "id": 1,
        "tipo_sugerencia": "equipo",
        "descripcion": "Instalar grifería de pedal.",
        "norma_asociada": "RTCA 67.01",
        "Proveedor": {
          "nombre": "Inox Equipos Industriales",
          "telefono": "+505 8888-8888",
          "email": "ventas@inoxequipos.com"
        }
      }
    ]
  }
}
```

### 5. Finalizar Diagnóstico (`PATCH /:id/finalizar`)

Exclusivo para el `consultor` creador. Pasa el diagnóstico a `'finalizado'`, haciendo visible el diagnóstico para la Empresa.

- **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Diagnóstico finalizado exitosamente. Ahora es visible para la empresa.",
  "data": {
    "id": 1,
    "estado": "finalizado"
  }
}
```

### 6. Firmar Diagnóstico (`PATCH /:id/firmar`)

Exclusivo para el rol `empresa` representante (dueño de la empresa evaluada) o `admin`. Cambia el estado del diagnóstico a `'firmado'` tras registrar la firma del representante legal. El diagnóstico debe estar previamente en estado `'finalizado'`.

*   **Payload (JSON)**:
    ```json
    {
      "firma_nombre": "Carlos Gómez"
    }
    ```
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Diagnóstico firmado y aceptado exitosamente.",
      "data": {
        "id": 1,
        "estado": "firmado",
        "firma_nombre": "Carlos Gómez",
        "fecha_firma": "2026-07-23T18:44:16.000Z"
      }
    }
    ```
*   **Errores comunes**:
    *   `400 Bad Request`: Si el diagnóstico aún está en `borrador` (debe ser finalizado primero por el consultor) o si ya fue firmado previamente.
    *   `403 Forbidden`: Si el usuario representa a otra empresa distinta a la del diagnóstico.

### 7. Actualizar Seguimiento de Recomendación (`PUT /recomendaciones/:recomendacionId/seguimiento`)

Permite a la `empresa` o `admin` reportar el avance en la implementación de una recomendación de mejora.

*   **Formato**: `multipart/form-data`
*   **Campos de Texto**:
    *   `estado_seguimiento` (Requerido) - Valores válidos: `pendiente`, `en_progreso`, `implementado`.
*   **Archivos**:
    *   `evidencia` (Opcional) - Archivo de imagen o PDF que pruebe la implementación física de la recomendación.
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Seguimiento de recomendación actualizado exitosamente.",
      "data": {
        "id": 3,
        "diagnostico_id": 1,
        "tipo_sugerencia": "equipo",
        "descripcion": "Instalar lavamanos de pedal en la entrada",
        "estado_seguimiento": "implementado",
        "evidencia_url": "https://supabase.co/storage/v1/object/public/comprobantes/evidencia-3.jpg",
        "fecha_implementacion": "2026-07-23T18:44:16.000Z"
      }
    }
    ```

---


## 🚚 Módulo de Proveedores Verificados (Ecosistema Global)

Este catálogo global permite a las MiPymes y a los Consultores buscar y recomendar proveedores oficiales de insumos, servicios y equipos del sector alimentario.

### 1. Listar Proveedores (`GET /api/proveedores`)
*   **Permisos**: Cualquier usuario autenticado.
*   **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Lista de proveedores verificados obtenida.",
  "data": [
    {
      "id": 1,
      "nombre": "Inox Equipos Industriales",
      "rnc": "101-99887-1",
      "telefono": "+505 8888-8888",
      "email": "ventas@inoxequipos.com",
      "direccion": "Managua",
      "estado": "activo"
    }
  ]
}
```

### 2. Detalle de Proveedor (`GET /api/proveedores/:id`)
*   **Permisos**: Cualquier usuario autenticado.

### 3. Crear Proveedor (`POST /api/admin/proveedores`)
*   **Permisos**: Solo Administradores (`admin`).
*   **Payload (JSON)**:
```json
{
  "nombre": "Proveedor Inox",
  "rnc": "101-99887-1",
  "telefono": "+505 8888-8888",
  "email": "contacto@prov.com",
  "direccion": "Zona Industrial"
}
```

### 4. Actualizar Proveedor (`PUT /api/admin/proveedores/:id`)
*   **Permisos**: Solo Administradores (`admin`).

### 5. Desactivar Proveedor (`DELETE /api/admin/proveedores/:id`)
*   **Permisos**: Solo Administradores (`admin`).
*   **Funcionamiento**: Realiza una desactivación lógica (`estado: 'inactivo'`) retirando al proveedor de la lista global pública.

---

## 👤 Módulo de Gestión de Perfiles Propios (Privado)

Base URL: `/api/perfil`

> **Nota de Cabecera**: Requiere la cabecera `Authorization: Bearer <JWT_TOKEN>` de un usuario con sesión activa.

### 1. Consultar Perfil Propio (`GET /me`)

Retorna la información del usuario autenticado y su perfil expandido en base al rol de su cuenta.

- **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Información del perfil obtenida.",
  "data": {
    "usuario": {
      "id": 2,
      "nombre": "Dra. Sofía Martínez",
      "username": "sofia.martinez",
      "email": "sofia.martinez@email.com",
      "rol": "consultor",
      "estado": "activo"
    },
    "perfil": {
      "id": 1,
      "usuario_id": 2,
      "cedula": "121-120280-0001A",
      "correo": "sofia.martinez@email.com",
      "telefono": "+505 7777-6666",
      "cv_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/123-cv.pdf",
      "titulo_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/123-titulo.pdf",
      "estado_perfil": "aprobado"
    }
  }
}
```

### 2. Actualizar Perfil Propio (`PUT /me`)

Permite actualizar los datos del perfil y subir nuevos documentos o imágenes a Supabase Storage.
*   **Formato**: `multipart/form-data`.
*   **Regla de Negocio Crítica**: Si un Consultor o Auditor edita su `cedula`, o sube un nuevo archivo en `curriculum` o `titulo`, su estado volverá automáticamente a `'pendiente'` requiriendo aprobación administrativa de nuevo. Las ediciones no críticas (como el `telefono` o el `correo`) mantienen el estado de aprobación anterior.

- **Campos Aceptados**:
  *   **Empresa**: Razón social, RUP, descripción, representante (nombre, teléfono, correo) y archivo `logo`.
  *   **Consultor/Auditor**: Cédula, correo, teléfono y archivos correspondientes (`curriculum`, `titulo`, `foto`, etc.).

- **Respuesta (200)**:
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente. Nota: Debido a cambios en campos críticos o documentos, tu perfil ha vuelto al estado pendiente de validación por administración.",
  "data": {
    "id": 1,
    "cedula": "CED-NUEVA-1234",
    "estado_perfil": "pendiente"
  }
}
```

---

## 📇 Módulo de Directorio Compartido (Ecosistema)

Base URL: `/api/directorio`

Este catálogo compartido permite buscar e interconectar a los tres roles del sistema (Empresas, Consultores y Auditores) que hayan sido previamente validados y aprobados por la administración (`estado_perfil: 'aprobado'`).

### 1. Directorio de Consultores (`GET /consultores`)

*   **Permisos**: Cualquier usuario autenticado (Empresas, Consultores, Auditores, Administradores).
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Directorio de consultores obtenido exitosamente.",
      "data": [
        {
          "id": 1,
          "usuario_id": 2,
          "empresa_id": 1,
          "correo": "sofia.martinez@email.com",
          "telefono": "+505 7777-6666",
          "cv_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/cv.pdf",
          "titulo_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/titulo.pdf",
          "maestria_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/maestria.pdf",
          "foto_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/foto.png",
          "estado_perfil": "aprobado",
          "Usuario": {
            "id": 2,
            "nombre": "Dra. Sofía Martínez",
            "username": "sofia.martinez",
            "email": "sofia.martinez@email.com"
          }
        }
      ]
    }
    ```

### 2. Directorio de Empresas (`GET /empresas`)

*   **Permisos**: Consultores, Auditores y Administradores (`consultor`, `auditor`, `admin`).
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Directorio de empresas obtenido exitosamente.",
      "data": [
        {
          "id": 1,
          "empresa_id": 5,
          "usuario_id": 10,
          "razon_social": "Alimentos de la Abuela S.A.",
          "rup": "RUP-998877",
          "descripcion": "Fábrica procesadora de lácteos y embutidos",
          "representante_nombre": "Carlos Gómez",
          "representante_telefono": "+505 8888-8888",
          "representante_correo": "carlos.gomez@email.com",
          "tipo_servicio": "Consultoría Sanitaria",
          "logo_url": "https://supabase.co/storage/v1/object/public/logos/1.png",
          "estado_perfil": "aprobado",
          "Usuario": {
            "id": 10,
            "nombre": "Carlos Gómez",
            "username": "carlos.gomez",
            "email": "carlos.gomez@email.com"
          },
          "Empresa": {
            "id": 5,
            "nombre": "Alimentos de la Abuela S.A.",
            "estado": "activo"
          }
        }
      ]
    }
    ```

### 3. Directorio de Auditores en Formación (`GET /auditores`)

*   **Permisos**: Consultores y Administradores (`consultor`, `admin`).
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Directorio de auditores en formación obtenido exitosamente.",
      "data": [
        {
          "id": 1,
          "usuario_id": 3,
          "empresa_id": 1,
          "correo": "pedro.auditor@email.com",
          "telefono": "+505 5555-4444",
          "cv_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/cv.pdf",
          "titulo_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/titulo.pdf",
          "capacitacion_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/cap.pdf",
          "foto_url": "https://supabase.co/storage/v1/object/public/comprobantes/1/foto.png",
          "estado_perfil": "aprobado",
          "Usuario": {
            "id": 3,
            "nombre": "Pedro Auditor",
            "username": "pedro.auditor",
            "email": "pedro.auditor@email.com"
          }
        }
      ]
    }
    ```

---

## 💬 Módulo de Mensajería Interna (Privado)

Base URL: `/api/mensajeria`

Este módulo permite establecer canales de comunicación y chats privados entre las distintas cuentas de usuarios de la plataforma (Empresas, Consultores, Auditores y Administradores).

### 1. Obtener Lista de Conversaciones (`GET /conversaciones`)

Retorna la lista de chats activos del usuario autenticado actual, incluyendo una previsualización del último mensaje y la información formateada del otro participante en el chat (`otro_usuario`).

*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Conversaciones obtenidas exitosamente.",
      "data": [
        {
          "id": 1,
          "usuario1_id": 3,
          "usuario2_id": 5,
          "ultimo_mensaje": "Hola, ¿cómo va el diagnóstico?",
          "fecha_ultimo_mensaje": "2026-07-27T04:46:00.000Z",
          "created_at": "2026-07-27T04:45:00.000Z",
          "updated_at": "2026-07-27T04:46:00.000Z",
          "otro_usuario": {
            "id": 5,
            "nombre": "Juan Consultor",
            "username": "juan.consultor",
            "rol": "consultor",
            "email": "juan@email.com"
          }
        }
      ]
    }
    ```

### 2. Iniciar o Recuperar Conversación (`POST /conversaciones`)

Crea un canal de chat único entre el usuario autenticado y un receptor específico. Si el chat ya existe, lo recupera directamente de la base de datos sin duplicar registros.

*   **Payload (JSON)**:
    ```json
    {
      "receptor_id": 5
    }
    ```
*   **Respuesta (200/201)**:
    ```json
    {
      "success": true,
      "message": "Conversación obtenida o creada exitosamente.",
      "data": {
        "id": 1,
        "usuario1_id": 3,
        "usuario2_id": 5,
        "ultimo_mensaje": null,
        "fecha_ultimo_mensaje": null,
        "created_at": "2026-07-27T04:45:00.000Z",
        "updated_at": "2026-07-27T04:45:00.000Z"
      }
    }
    ```

### 3. Consultar Mensajes de un Chat (`GET /conversaciones/:id/mensajes`)

Obtiene el historial de mensajes de la conversación específica de manera cronológica (antiguos a nuevos).
> **Nota de Control de Lectura:** Al llamar a este endpoint, todos los mensajes no leídos enviados por la otra persona dentro de esta conversación se marcan automáticamente como leídos (`leido: true`, `fecha_lectura: Date`).

*   **Query Params (Opcionales)**: `?limit=50&offset=0`
*   **Respuesta (200)**:
    ```json
    {
      "success": true,
      "message": "Mensajes de la conversación obtenidos exitosamente.",
      "data": [
        {
          "id": 12,
          "conversacion_id": 1,
          "emisor_id": 5,
          "contenido": "Hola, ¿cómo va el diagnóstico?",
          "leido": true,
          "fecha_lectura": "2026-07-27T04:50:00.000Z",
          "created_at": "2026-07-27T04:46:00.000Z",
          "updated_at": "2026-07-27T04:50:00.000Z",
          "emisor": {
            "id": 5,
            "nombre": "Juan Consultor",
            "rol": "consultor"
          }
        }
      ]
    }
    ```

### 4. Enviar Mensaje (`POST /conversaciones/:id/mensajes`)

Envía un mensaje de texto dentro del chat especificado y actualiza automáticamente los campos de visualización de la conversación (`ultimo_mensaje` y `fecha_ultimo_mensaje`).

*   **Payload (JSON)**:
    ```json
    {
      "contenido": "Hola. Ya casi terminamos la evaluación, te aviso pronto."
    }
    ```
*   **Respuesta (201)**:
    ```json
    {
      "success": true,
      "message": "Mensaje enviado exitosamente.",
      "data": {
        "id": 13,
        "conversacion_id": 1,
        "emisor_id": 3,
        "contenido": "Hola. Ya casi terminamos la evaluación, te aviso pronto.",
        "leido": false,
        "fecha_lectura": null,
        "created_at": "2026-07-27T04:52:00.000Z",
        "updated_at": "2026-07-27T04:52:00.000Z",
        "emisor": {
          "id": 3,
          "nombre": "Empresa Alimentos",
          "rol": "empresa"
        }
      }
    }
    ```

---

## ⚙️ Guía de Puesta en Marcha (Setup)

1. **Configurar el Entorno (`.env`)**:
   Asegurar que los datos de host, usuario y nombre de la base de datos coincidan en tu `.env`.

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=app_ofertas_saas
   ```

2. **Crear y Sembrar Base de Datos**:
   Ejecuta el comando para forzar la creación de la base de datos limpia y la siembra inicial de los planes de la plataforma:

   ```bash
   npm run db:force
   ```

3. **Iniciar el Servidor**:
   Arranca el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
