# Proyecto Kümespacio Portal

Este proyecto es un portal de gestión de pacientes y agendas para el centro Kümespacio. Permite la administración de profesionales, servicios, turnos y pacientes de manera centralizada.

## Ambiente de Desarrollo

Para ejecutar este proyecto en tu entorno local, necesitas iniciar tanto el frontend como el backend.

### Backend

El backend está construido con Node.js, Express y Sequelize como ORM. La base de datos puede ser SQLite (para desarrollo local) o PostgreSQL.

Para iniciar el servidor de desarrollo del backend:

```bash
cd backend
npm run dev # O npm start
```

### Frontend

El frontend está desarrollado con React, Vite y Tailwind CSS (o Vanilla CSS). Utiliza Vite para una construcción y carga rápida.

Para iniciar el servidor de desarrollo del frontend:

```bash
cd frontend
npm run dev
```

## Producción

La aplicación está desplegada en la nube utilizando los siguientes servicios:
- **Plataforma:** Railway / Render (según configuración de la base de datos PostgreSQL y backend).
- **URL:** [https://kumespacio-portal.up.railway.app](https://kumespacio-portal.up.railway.app) (o la URL correspondiente de tu despliegue de producción).
