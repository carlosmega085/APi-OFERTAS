# Manual Técnico y Arquitectura de la API (v1.0)

Este documento detalla la arquitectura de software, el diseño de la base de datos, los flujos de seguridad y los patrones de diseño aplicados en la **API REST del Ecosistema SaaS de Certificaciones y Cumplimiento Normativo**. 

Este manual ha sido diseñado para ser presentado en eventos de evaluación técnica, auditorías de código y demostraciones de arquitectura de software.

---

## 1. Patrón Arquitectónico y Diseño de Software

La aplicación sigue una **arquitectura desacoplada en capas** con separación estricta de responsabilidades. Esto garantiza la mantenibilidad, escalabilidad e independencia del motor de persistencia y la lógica del servidor de Express.

```text
               ┌────────────────────────┐
               │    Petición Cliente    │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │    Capa de Enrutado    │ (routes/)
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │  Capa de Middlewares   │ (middlewares/ : Auth, Validaciones Joi)
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │  Capa de Controladores │ (controllers/ : Manejo HTTP)
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │    Capa de Servicios   │ (services/ : Lógica de Negocio y Transacciones)
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │    Capa de Modelos     │ (models/ : ORM Sequelize y MySQL)
               └────────────────────────┘
```

### Descripción de las Capas

*   **Rutas (`routes/`)**: Define la exposición de los endpoints HTTP. Mapea los URIs y delega la ejecución de las peticiones a la capa de controladores previo paso por los middlewares requeridos.
*   **Middlewares (`middlewares/`)**: Filtros y preprocesadores de peticiones. Aquí se gestionan:
    *   La autenticación y decodificación de tokens JWT.
    *   La validación de esquemas de datos entrantes mediante **Joi** para evitar cargas maliciosas o incompletas.
    *   La interceptación y almacenamiento temporal de archivos multimedia (Multer).
*   **Controladores (`controllers/`)**: Actúan como directores de orquesta. Extraen los datos de la petición HTTP (`req.body`, `req.params`, `req.query`), invocan a los servicios pertinentes para procesar la lógica de negocio y devuelven respuestas estandarizadas usando helpers HTTP.
*   **Servicios (`services/`)**: Contienen el corazón y la lógica del negocio. Es en esta capa donde se manejan cálculos, consumo de APIs externas (como el cliente de Supabase), lógica de condicionales de negocio y la gestión de **Transacciones SQL** de Sequelize para garantizar la consistencia y atomicidad de la base de datos.
*   **Modelos / Capa de Persistencia (`models/`)**: Mapeo relacional de objetos (ORM) mediante Sequelize. Define el esquema de la base de datos MySQL, los tipos de datos de los campos y las asociaciones complejas (1:N, 1:1, N:M).

---

## 2. Aislamiento Multi-Tenant (SaaS)

El sistema opera bajo una arquitectura de software multi-tenant (multi-inquilino) compartiendo la misma base de datos lógica pero manteniendo un estricto **aislamiento de datos a nivel de registro**.

```text
   ┌───────────────────────────────────────────────┐
   │             Base de Datos MySQL               │
   │                                               │
   │  ┌──────────────────┐   ┌──────────────────┐  │
   │  │   Empresa A      │   │   Empresa B      │  │
   │  │   (empresa_id: 2)│   │   (empresa_id: 3)│  │
   │  │                  │   │                  │  │
   │  │  - Usuarios      │   │  - Usuarios      │  │
   │  │  - Diagnósticos  │   │  - Diagnósticos  │  │
   │  └──────────────────┘   └──────────────────┘  │
   │                                               │
   └───────────────────────────────────────────────┘
```

### Mecanismo de Aislamiento
1.  **Entidad Inquilino (`Empresa`)**: Cada empresa cliente que se registra en la plataforma recibe un identificador único global (`empresa_id`).
2.  **Relación Foránea**: Todos los recursos privados generados en la plataforma operativa (como `Usuario`, `Diagnostico` y `Tienda`) contienen la columna `empresa_id` como clave foránea.
3.  **Filtrado por Middleware**: Cuando el usuario inicia sesión y se autentica mediante su JWT, el middleware extrae el `empresa_id` inyectado en el payload del token y lo asigna al objeto `req.user`. Posteriormente, todas las consultas a la base de datos en la capa de servicios filtran explícitamente los registros usando:
    ```javascript
    where: { empresa_id: req.user.empresa_id }
    ```
4.  **Recursos Globales**: Los catálogos públicos como `Planes` y `Proveedores Verificados` no poseen `empresa_id` y son legibles de manera global por cualquier tenant.

---

## 3. Modelo de Base de Datos y Relaciones

El esquema relacional mapeado con Sequelize se compone de las siguientes entidades principales y sus relaciones asociadas en `models/index.js`:

```mermaid
erDiagram
    Usuario ||--|| EmpresaPerfil : "representa"
    Empresa ||--oN Usuario : "tiene"
    Empresa ||--oN EmpresaPerfil : "pertenece"
    Usuario ||--o| Consultor : "tiene"
    Usuario ||--o| Auditor : "tiene"
    
    Empresa ||--oN Diagnostico : "evaluada"
    Consultor ||--oN Diagnostico : "crea"
    Auditor ||--oN Diagnostico : "asiste"
    
    Diagnostico ||--oN Recomendacion : "origina"
    Proveedor ||--oN Recomendacion : "sugiere"
```

### Detalle de Asociaciones Clave
*   **Usuario (`usuarios`)** y **EmpresaPerfil (`empresa_perfiles`)**: Relación 1:1. El usuario representante tiene una extensión de su información donde se almacena su razón social, RUP y estado de validación.
*   **Usuario (`usuarios`)** con **Consultor/Auditor**: Relaciones 1:1 condicionales basadas en el rol (`rol: 'consultor'`, `rol: 'auditor'`).
*   **Diagnostico (`diagnosticos`)**: Posee tres claves foráneas:
    *   `empresa_id` (1:N): Empresa evaluada.
    *   `consultor_id` (1:N): Consultor profesional encargado de realizar la auditoría.
    *   `auditor_id` (1:N, Nullable): Auditor asistente en proceso de formación.
*   **Recomendacion (`recomendaciones`)**: Vinculada a un diagnóstico de origen (1:N) y asociada opcionalmente a un **Proveedor (`proveedores`)** verificado (1:N) para recomendar la compra de insumos higiénicos oficiales.

---

## 4. Flujo de Autenticación y Seguridad

La API utiliza un sistema robusto de seguridad local basado en JSON Web Tokens (JWT) y asignación de permisos según el control de acceso basado en roles (RBAC).

```text
   ┌─────────┐              POST /api/auth/login             ┌─────────┐
   │ Cliente │ ────────────────────────────────────────────> │ Servidor│
   │         │ <──────────────────────────────────────────── │   API   │
   └─────────┘             Devuelve JWT firmado              └─────────┘
        │
        │
   ┌─────────┐        Petición con Header Authorization      ┌─────────┐
   │ Cliente │ ────────────────────────────────────────────> │ Middleware
   │  (JWT)  │                                               │  Auth   │
   └─────────┘                                               └────┬────┘
                                                                  │ Valida Firma y
                                                                  │ Estado del Usuario
                                                                  ▼
                                                             ┌─────────┐
                                                             │ Middleware
                                                             │  Roles  │
                                                             └────┬────┘
                                                                  │ Valida si rol
                                                                  │ es permitido
                                                                  ▼
                                                             ┌─────────┐
                                                             │ Endpoint│
                                                             │ Destino │
                                                             └─────────┘
```

### Componentes de Seguridad
1.  **Encriptación de Credenciales**: Las contraseñas de los usuarios se almacenan cifradas en la base de datos utilizando el algoritmo de hash **BcryptJS** con un factor de costo (salt rounds) de 10.
2.  **Middleware de Autenticación (`authenticate`)**:
    *   Extrae el Bearer Token del header `Authorization`.
    *   Verifica la integridad de la firma con la clave simétrica privada `JWT_SECRET`.
    *   Consulta en la base de datos si el usuario existe y mantiene el estado `activo`.
    *   Inyecta el objeto del usuario autenticado en `req.user` para los siguientes middlewares.
3.  **Middleware de Roles (`authorize(['rol1', 'rol2'])`)**:
    *   Compara el rol asignado al usuario (`req.user.rol`) contra el listado de roles permitidos del endpoint.
    *   Si el rol no coincide, retorna inmediatamente una respuesta `403 Access denied`.

---

## 5. Carga de Documentos a Supabase Storage

Para evitar sobrecargar el servidor de Express con almacenamiento físico de archivos pesados y evitar persistencias locales frágiles, el sistema delega la subida de archivos a **Supabase Storage**.

```text
  ┌─────────┐  Form-Data con archivos   ┌─────────┐  Guarda archivo   ┌────────────┐
  │ Cliente │ ────────────────────────> │   API   │ ────────────────> │  Supabase  │
  │         │                           │ Express │                   │  Storage   │
  └─────────┘                           └────┬────┘                   └─────┬──────┘
                                             │                              │
                                             │ Guarda URL Pública           │ Retorna URL
                                             ▼                              ▼
                                        ┌─────────┐ <───────────────────────┘
                                        │  MySQL  │
                                        │  (DB)   │
                                        └─────────┘
```

### Implementación del Flujo
1.  **Multer Middleware (`uploadDocs.middleware.js`)**:
    *   Intercepta peticiones de tipo `multipart/form-data`.
    *   Valida que los formatos de archivo cargados sean exclusivamente imágenes o documentos PDF.
    *   Establece un límite máximo de tamaño de **10 MB** por archivo.
    *   Guarda temporalmente los archivos cargados en el objeto de la petición (`req.files`).
2.  **Supabase Client Service (`utils/supabase.js`)**:
    *   Conecta mediante SDK oficial con el servicio de Cloud Storage usando credenciales seguras.
    *   Sube los archivos al bucket configurado (`comprobantes`) organizando los archivos dentro de carpetas dinámicas basadas en el ID del usuario (`comprobantes/{usuario_id}/{nombre_archivo}`).
    *   Retorna la **URL pública permanente** de acceso al recurso.
3.  **Persistencia del Registro**:
    *   La URL de Supabase generada se almacena en el campo correspondiente del perfil en MySQL (ej: `cv_url`, `titulo_url`, `logo_url`).

---

## 6. Integración Transaccional y Robustez de Datos

Para evitar estados inconsistentes (datos huérfanos o inserciones parciales ante fallos de hardware o red), los procesos críticos de escritura de datos están encapsulados bajo **Transacciones SQL** de Sequelize.

Por ejemplo, durante el registro de una Empresa en el panel de administración SaaS:
*   Se inicia una transacción de base de datos (`await sequelize.transaction()`).
*   Se crea la fila en la tabla `empresas`.
*   Se crea la cuenta de usuario asociada en `usuarios`.
*   Se crea el registro de la membresía en `suscripciones`.
*   Se siembra el catálogo inicial de configuración y turnos.
*   **Si todo es exitoso**: Se realiza un `commit` físico en el motor MySQL.
*   **Si ocurre un fallo en cualquier paso**: Se ejecuta automáticamente un `rollback`, devolviendo la base de datos a su estado original previo al inicio del registro.
