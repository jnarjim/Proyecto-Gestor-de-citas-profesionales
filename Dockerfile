# Usa una imagen base de Python
FROM python:3.11-slim

# Establece variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo
WORKDIR /app

# Instala dependencias del sistema necesarias para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia el archivo de requirements
COPY requirements.txt /app/

# Instala las dependencias de Python
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copia el proyecto
COPY . /app/

# Crea el directorio para archivos estáticos
RUN mkdir -p /app/staticfiles

# Expone el puerto 8000
EXPOSE 8000

# Comando por defecto (se puede sobreescribir en docker-compose)
CMD ["gunicorn", "gestor_citas.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]