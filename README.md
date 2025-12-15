# Gestor de Citas Profesionales

Gestor de Citas Profesionales es tu asistente digital para organizar y gestionar citas de manera sencilla y eficiente. Desde la programación de citas hasta notificaciones automáticas y gestión de usuarios, esta aplicación cubre cada detalle para que los profesionales solo se preocupen de atender a sus clientes.

## Descripción general

El **Gestor de Citas Profesionales** es una aplicación web desarrollada con el framework **Django** cuyo objetivo es facilitar la gestión de citas entre profesionales y clientes de forma sencilla, organizada y accesible desde cualquier dispositivo con conexión a Internet.

La aplicación permite a los usuarios registrarse, iniciar sesión y gestionar citas de manera centralizada, ofreciendo una interfaz web clara e intuitiva. El sistema está pensado para entornos profesionales como consultas, despachos, servicios técnicos o cualquier actividad que requiera la organización de citas o reservas.

El proyecto ha sido diseñado siguiendo una **arquitectura cliente-servidor** y ha sido desplegado en la nube mediante **Docker** y **AWS EC2**, lo que permite su acceso desde el exterior a través de una dirección IP pública.

## Objetivo de la aplicación

El objetivo principal de esta aplicación es **automatizar y simplificar la gestión de citas**, evitando procesos manuales como agendas en papel o herramientas poco especializadas.

Los objetivos específicos del proyecto son:

- Permitir la gestión de usuarios con registro e inicio de sesión seguro.
- Facilitar la creación, visualización y administración de citas desde una interfaz web.
- Garantizar la persistencia de los datos mediante una base de datos relacional (**PostgreSQL**).
- Aplicar buenas prácticas de desarrollo web tanto en backend como en frontend.
- Implementar un despliegue profesional utilizando contenedores **Docker** y servicios en la nube.
- Servir como proyecto integrador de varias asignaturas del ciclo, poniendo en práctica conocimientos de desarrollo, diseño y despliegue de aplicaciones web.

## Funcionalidades principales

### Gestión de usuarios
- Registro de nuevos usuarios con validación de datos.
- Inicio y cierre de sesión seguro.
- Gestión de perfiles de usuario, incluyendo información de contacto.
- Roles diferenciados (profesional / cliente / administrador) con acceso y permisos específicos.

### Gestión de citas
- Creación de citas por parte del profesional y reservas por parte del cliente.
- Visualización de citas en un calendario o lista organizada.
- Edición y cancelación de citas(profesional).
- Notificaciones por correo electrónico para confirmar o recordar citas.

### Panel profesional / cliente / administrador
- Panel de control intuitivo para profesionales: ver citas, crearlas, editarlas, gestionar calendario.
- Panel de cliente: consultar citas reservadas, historial y próximos eventos.
- Panel administrador: gestionar solicitudes de clientes para convertirse en profesionales, validar roles y supervisar actividad de la plataforma.

### Notificaciones
- Sistema de alertas por correo electrónico al crear, modificar o cancelar citas.
- Posibilidad de marcar notificaciones como leídas o eliminar alertas antiguas.

### Seguridad y privacidad
- Autenticación y autorización segura mediante Django y JWT.
- Control de acceso según rol.
- Protección de datos sensibles y cumplimiento de buenas prácticas de seguridad web.

### Otros
- API REST para integración con otros sistemas o aplicaciones.
- Soporte para despliegue en la nube usando Docker y AWS EC2.
- Interfaz web responsiva accesible desde dispositivos móviles y de escritorio.
