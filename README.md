# Portfolio Website with Admin Dashboard

A dynamic and fully manageable portfolio website built using HTML, CSS, and JavaScript, with a backend powered by NestJS and PostgreSQL.

The project consists of a public-facing portfolio website and a secure admin dashboard that allows the administrator to manage the entire application's content, monitor inquiries, and update website information without modifying the source code.

## Project Overview

The application is designed to provide a professional online portfolio while giving the administrator complete control over the website through a centralized dashboard.

### Main Components

1. **Public Portfolio Website**
   - Displays portfolio information and professional profile.
   - Showcases projects and work experience.
   - Displays skills, services, and achievements.
   - Provides contact information and social media links.
   - Allows visitors to submit inquiries through a contact form.
   - Dynamically displays content managed from the admin dashboard.

2. **Admin Dashboard**
   - Secure administrator authentication.
   - Manage the entire portfolio website.
   - Edit landing page content and sections.
   - Manage personal and professional information.
   - Add, edit, and delete projects.
   - Manage skills, services, and work experience.
   - Update social media links and contact information.
   - Manage website images and other media.
   - View and manage visitor inquiries.
   - Track inquiry statuses.
   - Update website metadata and SEO information.

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- NestJS
- Node.js
- TypeScript
- REST API

### Database
- PostgreSQL
- Neon (Managed PostgreSQL Database)

### Hosting and Deployment
- GitHub Pages – Public frontend hosting.
- Render – NestJS backend hosting.
- Neon – PostgreSQL database hosting.

## System Architecture

The application follows a frontend-backend architecture.

```text
                 VISITORS
                    |
                    v
          PUBLIC PORTFOLIO WEBSITE
              (GitHub Pages)
                    |
                    | REST API
                    v
             NESTJS BACKEND
                (Render)
                    |
          ---------------------
          |                   |
          v                   v
    PostgreSQL API       ADMIN DASHBOARD
       (Neon)              (Protected)
          |                   |
          ---------------------
                    |
                    v
             CONTENT MANAGEMENT
```

The public website retrieves content from the backend API. The administrator uses the dashboard to create, update, and delete website content.

All application data is stored in the PostgreSQL database hosted on Neon.

## Project Features

### 1. Public Website

The public website provides visitors with information about the portfolio owner.

Expected sections include:

- Home / Landing Page
- About Me
- Skills and Technologies
- Services
- Projects / Portfolio
- Work Experience
- Education and Certifications
- Testimonials
- Contact Section
- Social Media Links

Website content should be dynamically retrieved from the backend API rather than hardcoded into the frontend.

### 2. Admin Dashboard

The admin dashboard provides centralized management of the entire public website.

#### Dashboard Overview
- Total inquiries.
- New inquiries.
- Read inquiries.
- Replied inquiries.
- Total projects.
- Website content overview.

#### Content Management
The administrator should be able to:

- Edit landing page headings and descriptions.
- Update profile information.
- Manage about section content.
- Add, update, and delete skills.
- Manage services.
- Manage projects and project descriptions.
- Upload and update project images.
- Manage work experience.
- Manage education and certifications.
- Manage testimonials.
- Update contact details.
- Manage social media links.
- Update website SEO metadata.
- Control the visibility and ordering of website sections.

#### Inquiry Management

The administrator should be able to:

- View all submitted inquiries.
- View individual inquiry details.
- See the sender's name, email, subject, and message.
- Mark inquiries as read or unread.
- Change inquiry status.
- Delete inquiries.
- Track the date an inquiry was submitted.

#### Authentication and Security

- Secure admin login.
- Password hashing.
- JWT-based authentication.
- Protected admin routes.
- Role-based access control where necessary.
- Input validation and sanitization.
- Secure API configuration.
- Environment variable management.

The admin dashboard must not be publicly accessible without authentication.

## Backend API Structure

The NestJS backend will expose RESTful endpoints for managing application data.

Suggested API modules:

| Module | Responsibility |
|---|---|
| Auth | Admin authentication and authorization |
| Users | Administrator account management |
| Settings | Global website settings |
| Hero | Landing page hero content |
| About | About section management |
| Skills | Skills management |
| Services | Services management |
| Projects | Portfolio projects management |
| Experience | Work experience management |
| Education | Education and certifications |
| Testimonials | Testimonials management |
| Contact | Contact information management |
| Inquiries | Visitor inquiry management |
| Media | Image and media management |
| SEO | Website metadata management |

### Example API Endpoints

**Authentication**
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

**Website Content**
```http
GET    /api/content
GET    /api/content/hero
PUT    /api/content/hero
GET    /api/content/about
PUT    /api/content/about
```

**Projects**
```http
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

**Inquiries**
```http
POST   /api/inquiries
GET    /api/inquiries
GET    /api/inquiries/:id
PATCH  /api/inquiries/:id
DELETE /api/inquiries/:id
```

**Skills and Services**
```http
GET    /api/skills
POST   /api/skills
PATCH  /api/skills/:id
DELETE /api/skills/:id

GET    /api/services
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id
```

All administrative endpoints must require appropriate authentication and authorization.

## Database Design

The application will use PostgreSQL hosted on Neon.

Suggested database tables:

| Table | Description |
|---|---|
| admins | Administrator accounts |
| site_settings | Global website configuration |
| hero_sections | Landing page hero content |
| about_sections | About section information |
| skills | Skills and technologies |
| services | Services offered |
| projects | Portfolio projects |
| experiences | Professional experience |
| education | Education and certifications |
| testimonials | Client testimonials |
| contact_info | Contact information |
| social_links | Social media accounts |
| inquiries | Visitor messages |
| media | Uploaded media references |
| seo_settings | Website SEO configuration |

The database should use appropriate relationships, constraints, timestamps, and indexes.

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the backend project directory.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=your_neon_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

FRONTEND_URL=https://yourusername.github.io/your-repository

```

Never commit `.env` files or expose database credentials and JWT secrets in the frontend.

Configure production environment variables directly in Render.

## Deployment Architecture

### 1. Frontend – GitHub Pages

The static portfolio frontend will be hosted using GitHub Pages.

Deployment steps:

1. Push the frontend code to GitHub.
2. Open the repository settings.
3. Navigate to Pages.
4. Select the deployment branch or configure GitHub Actions.
5. Deploy the frontend.

The frontend will communicate with the backend hosted on Render through its public API URL.

### 2. Backend – Render

The NestJS application will be deployed on Render.

Deployment steps:

1. Push the backend code to GitHub.
2. Create a new Web Service on Render.
3. Connect the GitHub repository.
4. Configure the build command.

```bash
npm install
npm run build
```

5. Configure the start command.

```bash
npm run start:prod
```

6. Add the required environment variables.
7. Configure CORS to allow requests from the GitHub Pages domain.
8. Deploy the backend.

Example backend URL:

```text
https://your-backend.onrender.com
```

### 3. Database – Neon

Neon will host the PostgreSQL database.

Deployment steps:

1. Create a Neon account.
2. Create a PostgreSQL project.
3. Create or select a database.
4. Copy the database connection string.
5. Add the connection string to Render as `DATABASE_URL`.
6. Configure database migrations.
7. Verify the backend can connect to the database.

Database credentials must remain on the backend and must never be exposed to the frontend.

## Development Setup

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- PostgreSQL knowledge
- GitHub account
- Neon account
- Render account

### Clone the Repository

```bash
git clone https://github.com/yourusername/your-repository.git

cd your-repository
```

### Frontend Setup

Open the frontend project and run it using a local development server.

For example, using VS Code Live Server.

### Backend Setup

Create or navigate to the backend directory:

```bash
mkdir backend
cd backend
```

Create a NestJS application:

```bash
npm install -g @nestjs/cli
nest new backend
```

Install the required packages:

```bash
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/typeorm typeorm pg
npm install class-validator class-transformer
npm install bcrypt
```

Start the development server:

```bash
npm run start:dev
```

The backend will be available locally at:

```text
http://localhost:3000
```

## Suggested Project Structure

```text
portfolio-website/
│
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   └── admin/
│       ├── index.html
│       ├── dashboard.html
│       ├── assets/
│       │   ├── css/
│       │   └── js/
│       └── pages/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── admins/
│   │   ├── settings/
│   │   ├── content/
│   │   ├── projects/
│   │   ├── skills/
│   │   ├── services/
│   │   ├── experience/
│   │   ├── education/
│   │   ├── testimonials/
│   │   ├── inquiries/
│   │   ├── media/
│   │   ├── seo/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Important Implementation Considerations

- The admin dashboard should be independently accessible from the public portfolio.
- Every editable section of the public website should be manageable through the admin dashboard.
- Changes made by the administrator should be reflected on the public website through API requests.
- The administrator should not need to modify HTML, CSS, or JavaScript files to update website content.
- Only authenticated administrators should be able to modify website content.
- Public API endpoints should expose only the information required by the portfolio.
- Inquiry submissions should be validated and stored securely.
- Image uploads should use external or persistent object storage rather than relying on Render's temporary local filesystem.
- Database schema changes should be handled using migrations.
- The application should use proper error handling, validation, and logging.

## Future Improvements

- Multiple administrator accounts.
- Email notifications for new inquiries.
- Rich text editing for website content.
- Image and file management.
- Website analytics.
- Inquiry export to CSV.
- Content publishing and draft management.
- Website section visibility controls.
- Audit logs for administrative actions.

## Project Goal

The ultimate goal is to transform the existing static portfolio website into a fully dynamic and manageable application.

The administrator should have complete control over the public-facing website through a secure dashboard, including the ability to edit content, manage projects, update personal information, configure website sections, and monitor visitor inquiries.

The public website remains hosted on GitHub Pages, the NestJS API runs on Render, and PostgreSQL data is managed through Neon.

---

**Hosting Architecture:** GitHub Pages + Render + Neon PostgreSQL

**Frontend:** HTML, CSS, JavaScript

**Backend:** NestJS, Node.js, TypeScript

**Database:** PostgreSQL
