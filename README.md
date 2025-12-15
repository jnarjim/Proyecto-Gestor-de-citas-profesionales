# Schedly

**Schedly** es tu gestor de citas profesional completo. Desde la programación de citas hasta notificaciones automáticas y gestión de usuarios, esta aplicación cubre cada detalle para que los profesionales solo se preocupen de atender a sus clientes.

---

## Características destacadas

### Gestión de usuarios
- **Registro y autenticación seguros** con JWT
- **Perfil personalizable** con información de contacto y biografía
- **Roles diferenciados**: Cliente, Profesional y Administrador
- **Sistema de solicitudes** para convertirse en profesional

### Gestión de citas
- **Creación de citas disponibles** por parte de profesionales
- **Reserva de citas** por parte de clientes
- **Estados de cita**: Pendiente, Confirmada, Cancelada, Completada
- **Edición y cancelación flexible**
- **Historial completo** de citas pasadas
- **Política de reapertura**: Los profesionales pueden permitir que citas canceladas vuelvan a estar disponibles

### Panel profesional / cliente / administrador
- **Panel profesional**: Crear, editar y gestionar agenda de citas
- **Panel cliente**: Reservar, consultar y cancelar citas
- **Panel administrador**: Gestionar solicitudes de profesionales y supervisar el sistema
- **Estadísticas en tiempo real**: Citas del día, pendientes y completadas

### Sistema de notificaciones
- **Alertas en tiempo real** sobre reservas, cancelaciones y eventos
- **Marcar como leídas** o eliminar notificaciones
- **Notificaciones por evento**: Reserva, cancelación, completado

### Seguridad y privacidad
- **Autenticación JWT** (JSON Web Tokens)
- **Control de acceso** según rol de usuario
- **Validaciones de negocio** para prevenir conflictos de horarios
- **Protección de datos sensibles**

---

## Tecnologías utilizadas

### Frontend
- **Django Templates**: Generación dinámica de HTML
- **TailwindCSS**: Framework CSS moderno y responsivo
- **Alpine.js**: Interactividad ligera en el cliente
- **JavaScript**: Consumo de API REST

### Backend
- **Django 5.2**: Framework web principal
- **Django REST Framework**: API RESTful
- **Django REST Framework Simple JWT**: Autenticación con tokens
- **Middleware personalizado**: Control de roles y redirecciones

### Base de datos
- **PostgreSQL**: Sistema de base de datos relacional
- **10 índices optimizados** para consultas frecuentes

### Despliegue
- **Docker & Docker Compose**: Contenedorización de servicios
- **AWS EC2**: Servidor en la nube
- **Nginx**: Proxy inverso y servidor de archivos estáticos
- **Gunicorn**: Servidor WSGI de producción
- **WhiteNoise**: Gestión de archivos estáticos

---

## Estructura del proyecto

```
Schedly/                                    # Raíz del repositorio
├── gestor_citas/                          # Configuración global de Django
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── usuarios/                              # App de usuarios
│   ├── models.py                          # CustomUser, SolicitudProfesional
│   ├── views.py                           # Registro, login, perfil, solicitudes
│   ├── serializers.py
│   ├── middleware.py                      # Redirección según rol
│   ├── admin.py
│   └── migrations/
│
├── citas/                                 # App principal de citas
│   ├── models.py                          # Modelo Cita
│   ├── views.py                           # CRUD citas, reservas, cancelaciones
│   ├── serializers.py
│   ├── admin.py
│   └── migrations/
│
├── notificaciones/                        # App de notificaciones
│   ├── models.py                          # Modelo Notificacion
│   ├── views.py                           # Listar, marcar leídas, eliminar
│   ├── serializers.py
│   └── migrations/
│
├── templates/                             # Plantillas HTML
│   ├── base.html                          # Plantilla base con nav dinámico
│   ├── index.html
│   ├── citas/
│   ├── notificaciones/
│   └── usuarios/
│
├── static/                                # Archivos estáticos (CSS, JS)
├── staticfiles/                           # Archivos recopilados (producción)
│
├── Dockerfile                             # Imagen Docker
├── docker-compose.yml                     # Orquestación de servicios
├── .dockerignore
├── .env                                   # Variables de entorno
├── requirements.txt                       # Dependencias Python
├── manage.py
└── README.md
```

---

## Modelo de datos

### Principales modelos

| Modelo | Relaciones principales | Campos clave |
|--------|------------------------|--------------|
| **CustomUser** | Citas (como profesional y cliente), Notificaciones | email, is_professional, is_staff, permite_reabrir_citas |
| **Cita** | Profesional (FK), Cliente (FK opcional), Notificaciones | fecha, hora, duracion, estado |
| **Notificacion** | Receptor (FK), Emisor (FK), Cita (FK opcional) | tipo, mensaje, leido |
| **SolicitudProfesional** | Usuario (FK) | estado, acepta_reapertura_citas |

### Diagrama de relaciones

```
CustomUser (1) ──────< (N) Cita (profesional)
CustomUser (1) ──────< (N) Cita (cliente)
CustomUser (1) ──────< (N) Notificacion (receptor)
Cita (1) ──────< (N) Notificacion
CustomUser (1) ──────< (N) SolicitudProfesional
```

### Estados de cita
1. **Pendiente** - Cita creada sin cliente asignado
2. **Confirmada** - Cliente ha reservado la cita
3. **Cancelada** - Cancelada por profesional o cliente
4. **Completada** - Finalizada y marcada por el profesional

---

## API REST

El sistema cuenta con **27 endpoints** organizados en 3 módulos:

### Usuarios (8 endpoints)
- `POST /api/usuarios/register/` - Registro de usuarios
- `POST /api/usuarios/login/` - Login con JWT
- `GET /api/usuarios/me/` - Ver perfil
- `PATCH /api/usuarios/me/` - Actualizar perfil
- `POST /api/usuarios/solicitud-profesional/crear/` - Solicitar ser profesional
- `GET /api/usuarios/solicitud-profesional/mia/` - Ver estado de solicitud
- `GET /api/usuarios/solicitud-profesional/pendientes/` - Listar solicitudes (Admin)
- `PATCH /api/usuarios/solicitud-profesional/gestionar/<id>/` - Aprobar/rechazar (Admin)

### Citas (13 endpoints)
- `GET /api/citas/disponibles/` - Listar citas disponibles
- `POST /api/citas/crear/` - Crear cita (Profesional)
- `POST /api/citas/<id>/reservar/` - Reservar cita (Cliente)
- `POST /api/citas/<id>/cancelar/` - Cancelar cita
- `POST /api/citas/<id>/completar/` - Completar cita (Profesional)
- `POST /api/citas/<id>/eliminar/` - Eliminar cita
- `PUT /api/citas/<id>/editar/` - Editar cita (Profesional)
- `GET /api/citas/mis-citas/` - Mis citas activas
- `GET /api/citas/historial/` - Historial de citas
- `GET /api/citas/panel-profesional/` - Estadísticas (Profesional)
- `GET /api/citas/<id>/` - Detalles de cita

### Notificaciones (4 endpoints)
- `GET /api/notificaciones/` - Listar notificaciones
- `GET /api/notificaciones/<id>/` - Detalle de notificación
- `POST /api/notificaciones/<id>/marcar-leida/` - Marcar como leída
- `DELETE /api/notificaciones/<id>/` - Eliminar notificación

### Autenticación
- **Tipo**: JWT (JSON Web Tokens)
- **Access Token**: Válido 5 minutos
- **Refresh Token**: Válido 1 día
- **Header**: `Authorization: Bearer <token>`

---

## Instalación y despliegue

### Requisitos previos
- Docker & Docker Compose
- Git
- Cuenta AWS (para despliegue en producción)
- Clave SSH (para acceso a EC2)

---

### Desarrollo local

1. **Clonar el repositorio:**

```bash
git clone https://github.com/jnarjim/Proyecto-Gestor-de-citas-profesionales.git
cd Proyecto-Gestor-de-citas-profesionales
```

2. **Crear archivo `.env`:**

```env
# Django
DEBUG=True
DJANGO_SECRET_KEY="your-secret-key-here"
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://postgres:postgres123@db:5432/gestor_citas_db
DB_NAME=gestor_citas_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
DB_PORT=5432

# Email (Opcional)
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-password
```

3. **Levantar servicios con Docker:**

```bash
docker compose up -d
```

4. **Aplicar migraciones:**

```bash
docker compose exec web python manage.py migrate
```

5. **Crear superusuario:**

```bash
docker compose exec web python manage.py createsuperuser
```

6. **Recopilar archivos estáticos:**

```bash
docker compose exec web python manage.py collectstatic --noinput
```

7. **Acceder a la aplicación:**

```
http://localhost:8000
```

---

### Despliegue en producción (AWS EC2)

#### 1. Crear instancia EC2
- **AMI**: Ubuntu Server 22.04 LTS
- **Tipo**: t3.small (recomendado) o t2.micro (free tier)
- **Security Group**: Permitir puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)

#### 2. Conectar a la instancia

```bash
ssh -i tu-clave.pem ubuntu@<IP-ELASTICA>
```

#### 3. Clonar repositorio y configurar

```bash
git clone https://github.com/jnarjim/Proyecto-Gestor-de-citas-profesionales.git
cd Proyecto-Gestor-de-citas-profesionales
```

#### 4. Configurar `.env` para producción

```env
DEBUG=False
DJANGO_SECRET_KEY="production-secret-key"
ALLOWED_HOSTS=<IP-ELASTICA>,tudominio.com

DATABASE_URL=postgresql://postgres:password_seguro@db:5432/gestor_citas_db
DB_PASSWORD=password_seguro
```

#### 5. Levantar servicios

```bash
docker compose up -d
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py collectstatic --noinput
```

#### 6. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/schedly
```

```nginx
server {
    listen 80;
    server_name <IP-ELASTICA>;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /home/ubuntu/Proyecto-Gestor-de-citas-profesionales/staticfiles/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/schedly /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Acceder a la aplicación

```
http://<IP-ELASTICA>
```

---

## Ejemplo de uso (Paso a paso)

### 1. Registro
Usuario se registra con email, nombre y contraseña.

### 2. Solicitar ser profesional (Opcional)
- Usuario solicita convertirse en profesional
- Admin revisa y aprueba la solicitud
- Usuario obtiene acceso al panel profesional

### 3. Profesional crea citas
```
Cita: "Consulta"
Fecha: 2025-12-20
Hora: 10:00
Duración: 60 minutos
Estado: Pendiente (disponible)
```

### 4. Cliente reserva cita
- Explora citas disponibles
- Reserva la cita deseada
- Estado cambia a "Confirmada"
- Profesional recibe notificación

### 5. Gestión de citas
- **Cliente** puede cancelar su cita
- **Profesional** puede editar, cancelar o completar citas
- Sistema de reapertura: Las citas canceladas pueden volver a estar disponibles

### 6. Notificaciones
- Alertas automáticas en tiempo real
- Panel de notificaciones con contador
- Marcar como leídas o eliminar

## Características técnicas destacadas

### Optimizaciones
- **10 índices de base de datos** para queries frecuentes
- **Select_related y prefetch_related** en consultas ORM
- **WhiteNoise** para servir archivos estáticos eficientemente

### Seguridad
- **Autenticación JWT** con tokens de corta duración
- **Validación de negocio** en cada operación
- **Control de acceso basado en roles**
- **Protección CSRF** en formularios

### Arquitectura
- **API RESTful** completamente funcional
- **Separación de responsabilidades** (3 apps Django)
- **Middleware personalizado** para redirecciones según rol
- **Docker Compose** para orquestación de servicios

## Próximas mejoras

- [ ] **WebSockets** para notificaciones en tiempo real
- [ ] **Calendario visual** con drag & drop para gestión de citas
- [ ] **Recordatorios automáticos** por email 24h antes de la cita
- [ ] **Sistema de valoraciones** para profesionales
- [ ] **Dashboard con gráficos** de estadísticas avanzadas
- [ ] **Exportación de agenda** a PDF o iCal
- [ ] **Integración con Google Calendar**
- [ ] **App móvil** con React Native
