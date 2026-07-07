# 📋 Requerimientos del Sistema
##  1.1 Requerimientos Funcionales (RF)

### Módulo de Autenticación y Seguridad (Auth)
RF-01: El sistema debe permitir el inicio de sesión a tres tipos de roles: Administrador, Conductor y Acudiente.
RF-02: El sistema debe validar las credenciales mediante tokens seguros (JWT).
RF-03: El sistema debe restringir el acceso a los módulos web o móviles según el rol del usuario logueado.
### Módulo de Administración y Configuración (Admin)

RF-04: El Administrador debe poder realizar el CRUD (Crear, Leer, Actualizar, Eliminar) de Usuarios (Conductores y Acudientes).

RF-05: El Administrador debe poder realizar el CRUD de Estudiantes y asociarlos a uno o más Acudientes.

RF-06: El Administrador debe poder crear Vehículos y Rutas Escolares.

RF-07: El Administrador debe poder asignar un Conductor, un Vehículo y una lista ordenada de Estudiantes a una Ruta específica.

RF-08: El Administrador debe visualizar un Dashboard con un mapa global que muestre todas las rutas activas en tiempo real.

### Módulo del Conductor (Ruta en Vivo)
RF-09: El Conductor debe poder ver la lista secuencial de estudiantes asignados a su ruta diaria.

RF-10: El Conductor debe poder "Iniciar Ruta", lo que activará la transmisión de sus coordenadas GPS.

RF-11: El Conductor debe poder registrar la asistencia de cada estudiante con tres estados en tiempo real: "Abordado" (recogido en casa), "Entregado" (en el colegio/casa) o "Ausente".

RF-12: El Conductor debe poder "Finalizar Ruta", deteniendo la transmisión GPS.

### Módulo del Acudiente (Seguimiento)
RF-13: El Acudiente debe poder ver los datos del conductor y del vehículo asignado a su hijo.

RF-14: El Acudiente debe poder visualizar en un mapa interactivo la ubicación en tiempo real del autobús solo cuando la ruta esté activa.

RF-15: El sistema debe calcular y mostrar al Acudiente el Tiempo Estimado de Llegada (ETA) a su casa o al colegio.

### Módulo de Notificaciones y Alertas
RF-16: El sistema debe enviar una notificación push inmediata al Acudiente cuando el conductor marque al estudiante como "Abordado" en su casa.

RF-17: El sistema debe enviar una notificación push inmediata al Acudiente cuando el autobús llegue al colegio y el estudiante sea marcado como "Entregado".

RF-18: El sistema debe registrar un historial con fecha, hora exacta y coordenadas de cada evento de recogida y entrega.

## 1.2 Requerimientos No Funcionales (RNF)
RNF-01 (Rendimiento): La latencia en la actualización del GPS en el mapa del acudiente no debe ser mayor a 5 segundos.

RNF-02 (Disponibilidad): El servicio de geolocalización debe garantizar una disponibilidad del 99.9% durante las horas de operación escolar (05:00 a 19:00).

RNF-03 (Seguridad/Privacidad): Los datos de ubicación de los menores deben estar encriptados en tránsito (HTTPS/WSS) y solo accesibles por los acudientes vinculados y el administrador.

RNF-04 (Escalabilidad): El backend debe ser capaz de procesar solicitudes simultáneas de geolocalización de múltiples rutas concurrentes usando arquitectura reactiva o hilos optimizado
