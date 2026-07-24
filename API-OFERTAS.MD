Hemos completado la implementación de los tres nuevos perfiles en la plataforma digital: Empresas (Categoría A y B), Consultores, y Auditores en formación, junto con la subida de múltiples documentos a Supabase Storage y endpoints de administración para su validación.

🛠️ Cambios Realizados
Ampliación de Roles:
Se extendió el enum rol en el modelo
Usuario.js
para incluir 'empresa', 'consultor', y 'auditor'.
Nuevos Modelos de Base de Datos:
EmpresaPerfil.js
: Perfil de empresa categoría A y B.
Consultor.js
: Perfil de profesional consultor.
Auditor.js
: Perfil de auditor en formación.
Relaciones entre Entidades:
En
models/index.js
se asoció cada uno de los perfiles con su respectivo Usuario y Empresa (aislamiento multi-tenant).
Middlewares y Validaciones:
uploadDocs.middleware.js
: Configura Multer para aceptar imágenes y PDFs de hasta 10MB por archivo, listando los campos esperados para cada tipo de registro.
register.validation.js
: Esquemas Joi rigurosos para validar los payloads de registro.
Endpoints de Registro (Rutas Públicas):
En
routes/auth.routes.js
, delegados a
controllers/auth.controller.js
y procesados por transacciones de base de datos en
services/auth.service.js
.
Endpoints de Administración (Rutas Privadas):
routes/admin.routes.js
(enlazado en
routes/index.js
), delegando a
controllers/admin.controller.js
y
services/admin.service.js
.
🚀 Especificación de Endpoints

1. Registros Públicos (POST /api/auth/...)
   A. Registro de Empresa Cliente (POST /api/auth/register-cliente-empresa)
   Multipart/form-data

Campos del Formulario:
nombre_empresa (R)
username (R)
password (R)
razon_social (R)
rup (R)
descripcion (O)
representante_nombre (R)
representante_telefono (R)
representante_correo (R)
programa_requisitos (O)
tipo_servicio (O)
Archivos:
logo (O) - Imagen del logotipo.
B. Registro de Consultor (POST /api/auth/register-consultor)
Multipart/form-data

Campos del Formulario:
nombre (R)
username (R)
password (R)
cedula (R)
correo (R)
telefono (R)
Archivos:
curriculum (R) - PDF o Imagen.
titulo (R) - PDF o Imagen.
maestria (O) - PDF o Imagen.
carta1, carta2, carta3 (O) - Cartas de recomendación.
proforma (O) - PDF o Imagen.
foto (O) - Foto carnet del consultor.
C. Registro de Auditor en Formación (POST /api/auth/register-auditor)
Multipart/form-data

Campos del Formulario:
nombre (R)
username (R)
password (R)
cedula (R)
correo (R)
telefono (R)
Archivos:
curriculum (R) - PDF o Imagen.
titulo (R) - PDF o Imagen.
capacitacion (O) - PDF o Imagen.
carta1, carta2, carta3 (O) - Cartas de recomendación.
foto (O) - Foto carnet. 2. Administración y Validación de Perfiles (PATCH/GET /api/admin/perfiles/...)
Requiere cabecera: Authorization: Bearer <JWT_TOKEN_ADMIN>

A. Listar Perfiles
GET /api/admin/perfiles/empresas?estado_perfil=pendiente
GET /api/admin/perfiles/consultores?estado_perfil=pendiente
GET /api/admin/perfiles/auditores?estado_perfil=pendiente
B. Validar/Aprobar Perfiles
PATCH /api/admin/perfiles/empresas/:id/validar
PATCH /api/admin/perfiles/consultores/:id/validar
PATCH /api/admin/perfiles/auditores/:id/validar
Payload JSON:

json

{
"estado_perfil": "aprobado" // O "rechazado"
}
