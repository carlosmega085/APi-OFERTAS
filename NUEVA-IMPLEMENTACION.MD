Contexto del proyecto

Se desarrollará una API REST para una plataforma móvil especializada en certificaciones, cumplimiento normativo y conexión entre profesionales, proveedores y empresas.

La plataforma tendrá un modelo de negocio SaaS (Software as a Service), por lo que desde el inicio la arquitectura debe considerar reutilización de componentes, escalabilidad y multiempresa (tenant), aunque algunas funcionalidades no se utilicen en esta primera versión.

La API será desarrollada sobre un proyecto legacy, por lo tanto NO se debe modificar la arquitectura existente, ni cambiar patrones de desarrollo ya implementados.

El objetivo es integrar nuevas funcionalidades respetando completamente el estilo del proyecto.

Stack tecnológico

Backend:

Node.js
Express
Sequelize
MySQL
Restricciones importantes

Antes de realizar cualquier cambio debes analizar cómo está construido el proyecto.

Debes respetar completamente:

estructura de carpetas
convenciones
nomenclatura
patrón utilizado para Controllers
Services
Models
Routes
Middlewares
Validaciones
Helpers
Manejo de errores
Respuestas HTTP
Transacciones
Sequelize
Sistema de autenticación existente
Convenciones de nombres

No debes introducir nuevos patrones arquitectónicos.

No debes cambiar código existente solamente porque exista una mejor práctica.

Debes reutilizar todo lo reutilizable.

Proyecto Legacy

Este proyecto ya contiene funcionalidades que actualmente no serán utilizadas.

No deben eliminarse.

No deben modificarse.

No deben simplificarse.

Muchas de ellas forman parte del modelo SaaS y serán reutilizadas posteriormente.

Si existe una funcionalidad que aparentemente no tiene uso actualmente, entonces si puedes valorar eliminarla
Objetivo de esta primera etapa

Construir la base funcional para conectar tres tipos de usuarios.

1. Empresas

Empresas categoría A y B.

Información inicial:

Razón social
Número RUP
Descripción
Representante legal
Datos del representante
Tipo de servicio solicitado
Descripción de la necesidad
Logo

Posteriormente podrán solicitar certificaciones, diagnósticos y servicios.

2. Consultores

Profesionales certificados.

Información:

Nombre
Cédula
Correo
Teléfono
Currículum
Título universitario
Maestría en sistemas de gestión
Tres cartas de recomendación
Fotografía

Los consultores serán validados antes de quedar disponibles dentro de la plataforma.

3. Auditores en formación

Información:

Nombre
Cédula
Correo
Teléfono
Currículum
Título universitario
Capacitación en sistemas de gestión
Tres cartas de recomendación
Fotografía

También deberán pasar un proceso de revisión.

Objetivo del negocio

La plataforma busca conectar:

Empresas

↓

Profesionales

↓

Proveedores

Todo dentro de un mismo ecosistema.

El profesional realiza un diagnóstico de la empresa.

Según dicho diagnóstico recomendará:

servicios
equipos
proveedores
capacitaciones
certificaciones

Todo bajo las normas correspondientes.

La plataforma no solamente conecta personas, sino que administra el flujo completo del proceso.

Primera versión

Esta primera versión NO desarrollará todo el modelo de negocio.

Solamente se construirá la base necesaria para:

registro de usuarios
autenticación
carga de documentos
validación de perfiles
administración de empresas
administración de consultores
administración de auditores
relaciones entre entidades
almacenamiento de archivos

Todo lo demás quedará preparado para futuras iteraciones.

Criterios técnicos

Toda nueva funcionalidad debe:

seguir exactamente el patrón existente
reutilizar funciones existentes
evitar duplicación
mantener separación de responsabilidades
utilizar Sequelize como el resto del proyecto
respetar la estructura del proyecto legacy
ser fácilmente escalable
permitir futuras ampliaciones sin romper compatibilidad
Qué NO hacer

No cambiar arquitectura.

No cambiar estructura.

No renombrar carpetas.

No crear nuevos patrones.

No modificar código legacy que funciona.

No eliminar funcionalidades SaaS existentes.

No asumir comportamientos sin revisar el código.

Si una decisión depende del proyecto existente, primero analizar cómo está implementado y continuar siguiendo exactamente ese patrón.

Forma de trabajo

Antes de escribir código:

Analizar la estructura del proyecto.
Identificar el patrón utilizado.
Explicar cómo se integrará la nueva funcionalidad.
Esperar confirmación cuando exista una decisión de diseño.
Implementar únicamente lo solicitado.

Toda implementación debe ser incremental y compatible con futuras funcionalidades del modelo SaaS.
