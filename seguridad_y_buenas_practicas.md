# Manual de Seguridad y Buenas Prácticas de la API

Este documento detalla la arquitectura de seguridad, las buenas prácticas y los mecanismos de protección implementados en el desarrollo de la plataforma SaaS y Cumplimiento Normativo.

---

## 1. Mecanismos de Seguridad Implementados

### Autenticación e Invalidation State (Stateless JWT)

- **Qué se implementa:** Autenticación local mediante **JSON Web Tokens (JWT)** firmados con un secreto almacenado únicamente en variables de entorno.
- **Por qué:** Permite una arquitectura descentralizada y libre de estado (stateless), ideal para aplicaciones móviles.
- **Buenas prácticas integradas:**
  - El middleware ([auth.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/auth.middleware.js)) no solo verifica la firma y expiración del token, sino que además **consulta la base de datos en cada petición** para validar que el usuario no haya sido desactivado (`user.estado === 'activo'`). Esto permite invalidar accesos de manera inmediata si un usuario es dado de baja, mitigando el problema del "token huérfano".

### Control de Acceso: RBAC y ABAC (Granularidad de Permisos)

- **Qué se implementa:** Combinación de control de acceso basado en roles (RBAC) y control de acceso basado en atributos/permisos granulares (ABAC).
- **Por qué:** Diferentes rutas requieren diferentes niveles de protección. Por ejemplo, solo los consultores pueden crear diagnósticos, pero ciertas acciones operativas de ventas requieren permisos individuales adicionales.
- **Módulos clave:**
  - [role.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/role.middleware.js): Restringe rutas a roles específicos (`admin`, `vendedor`, `empresa`, `consultor`, `auditor`).
  - [actionControl.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/actionControl.middleware.js): Valida mediante un campo de tipo `JSON` en el usuario si este tiene permisos individuales habilitados (ej: `{"anular_venta": true}`) antes de permitir la ejecución.

### Aislamiento Multi-inquilino (Multi-tenant Data Isolation)

- **Qué se implementa:** Middleware de aislamiento a nivel de controlador ([tenant.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/tenant.middleware.js)).
- **Por qué:** Evita que usuarios pertenecientes a una empresa cliente (`empresa_id = X`) puedan visualizar, crear o modificar datos de otra empresa cliente (`empresa_id = Y`).
- **Cómo funciona:** El middleware extrae de forma segura el `empresa_id` del token JWT verificado y lo inyecta en el objeto `req`. Todos los servicios de consulta a base de datos están obligados a filtrar usando `req.empresa_id`.

### Red de Seguridad e Idempotencia (Evitar Duplicados)

- **Qué se implementa:** Middleware de idempotencia por token único ([idempotencia.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/idempotencia.middleware.js)).
- **Por qué:** En entornos móviles, las fallas de red pueden provocar que el cliente reintente enviar un formulario de pago, registro o firma de diagnóstico, generando duplicados en la base de datos.
- **Cómo funciona:** Intercepta peticiones de escritura (`POST`, `PUT`, `DELETE`) que contengan la cabecera `X-Request-ID`. Si el ID ya existe en la tabla `peticiones_procesadas` para esa empresa, la API no ejecuta el código de nuevo; simplemente retorna la respuesta exitosa que ya tenía guardada en caché.

### Cifrado de Contraseñas (Hashing)

- **Qué se implementa:** Algoritmo adaptativo **Bcryptjs** con factor de sal (salt) de nivel 10.
- **Por qué:** Protege las credenciales de los usuarios contra ataques de diccionario y fuerza bruta en caso de filtraciones de la base de datos.
- **Cómo funciona:** Se implementa de forma automática en los hooks del modelo de Sequelize (`beforeCreate` y `beforeUpdate` en [Usuario.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/models/Usuario.js)), impidiendo guardar texto plano por error de programación.

### Almacenamiento en Nube y Aislamiento de Archivos

- **Qué se implementa:** Integración con **Supabase Storage** y middlewares de carga ([uploadDocs.middleware.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/middlewares/uploadDocs.middleware.js)).
- **Por qué:** Subir y ejecutar archivos en el disco local de la API es de alto riesgo (posibilidad de inyecciones de código ejecutable malicioso y consumo masivo de almacenamiento local).
- **Cómo funciona:** Los archivos se procesan en memoria mediante Multer y se suben directamente al bucket seguro de Supabase. La API solo almacena la URL de acceso público generada.

---

## 2. Mitigación de Vulnerabilidades OWASP Top 10

1.  **Inyección SQL:** Prevenida por el uso de **Sequelize ORM**. Al realizar consultas a través del ORM, todos los parámetros ingresados por el usuario se escapan y parametrizan de forma nativa.
2.  **Cabeceras Seguras (Helmet):** Se incluye el paquete `helmet` globalmente en [index.js](file:///c:/Users/Walner/PROYECTOS%20API%20%20CON%20NODE%20Y%20EXPRES/API-ofertas-SAAS-MOVIL/index.js), configurando cabeceras como:
    - `Strict-Transport-Security` (obliga a usar HTTPS).
    - `X-Content-Type-Options` (previene el sniffing de tipos MIME).
    - `X-Frame-Options` (evita ataques de Clickjacking).
3.  **Cross-Origin Resource Sharing (CORS):** Controlado globalmente para prevenir peticiones maliciosas desde páginas web de terceros no autorizadas.
4.  **Validación de Entradas (Joi):** Todo endpoint crítico pasa por una capa de validación que filtra tipos de datos, longitudes y formatos, evitando desbordamientos de buffer o comportamientos inesperados de negocio.

---

## 3. Cosas a Tener en Cuenta (Checklist para Producción)

Al desplegar este proyecto a un entorno productivo, ten en cuenta las siguientes recomendaciones de seguridad:

- [ ] **Secretos de Producción:** Modificar la variable `JWT_SECRET` en el archivo `.env` por una cadena de caracteres generada aleatoriamente de al menos 64 bits. **Nunca** utilices la clave por defecto.
- [ ] **Políticas CORS Restrictivas:** Cambiar `app.use(cors())` (que permite cualquier origen en desarrollo) por una configuración de orígenes permitidos restringida al dominio de tu panel web y tu app móvil.
- [ ] **Límites de Carga en Multer:** Controlar rigurosamente el tamaño máximo de los archivos subidos (ej. máximo 5MB para currículums y comprobantes) para evitar denegación de servicio (DoS) por llenado de memoria.
- [ ] **SSL/TLS Obligatorio:** Configurar un certificado SSL (HTTPS) en tu servidor de hosting o proxy reverso (Nginx, Cloudflare) para encriptar el canal de comunicación, evitando ataques de tipo Man-in-the-Middle (MITM) que puedan capturar los tokens JWT.
