# EnnLabel

**HIPAA-compliant health data annotation platform for clinical AI development.**

EnnLabel enables healthcare organizations to securely ingest clinical data, assign annotation tasks to trained annotators, support clinical review workflows, and export structured labeled datasets for LLM training and behavioral health AI.

## Tech Stack

### Backend
- **Laravel 11** (PHP 8.3+)
- **PostgreSQL 16** with UUID primary keys
- **Laravel Sanctum** (token authentication + MFA/TOTP)
- **Redis** (queue worker, caching, sessions)

### Frontend
- **Next.js 14** (React 18)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Zustand** (state management)

### Infrastructure
- **Docker Compose** (multi-container)
- **Nginx** reverse proxy
- **AWS S3** (dataset storage)

## Core Features

- **Secure Authentication** - Sanctum tokens, TOTP-based MFA, role-based middleware
- **Dataset Management** - Upload CSV/JSON, versioning, record parsing
- **Task System** - Auto-generate tasks from datasets, assign to annotators, full status workflow
- **Text Annotation** - Highlight-and-tag interface, multi-label support, DSM-5/ICD-10 taxonomies
- **Clinical Review** - Approve/reject annotations, leave comments, full version history
- **QA System** - Inter-annotator agreement scoring, conflict flagging
- **Export** - JSON and CSV export of labeled datasets with metadata
- **Audit Logging** - Every action logged immutably (HIPAA compliance)

## User Roles (RBAC)

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access - manage datasets, tasks, users, export |
| **Annotator** | Annotate assigned tasks |
| **Clinician Reviewer** | Review and approve/reject annotations |
| **QA Reviewer** | Quality assurance reviews, conflict resolution |

## Quick Start

```bash
# Clone
git clone https://github.com/michelevens/EnnLabel.git
cd EnnLabel

# Copy environment
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Run migrations and seed
docker exec ennlabel-app php artisan migrate --seed

# Frontend dependencies
cd frontend && npm install && npm run dev
```

Access:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Default login**: admin@ennlabel.com / password

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Current user profile |
| POST | `/api/totp/setup` | Setup MFA |
| POST | `/api/totp/verify` | Verify TOTP code |
| GET/POST | `/api/datasets` | List/create datasets |
| GET | `/api/datasets/{id}` | Dataset details |
| POST | `/api/datasets/{id}/versions` | Upload new version |
| GET | `/api/tasks` | List tasks (filtered by role) |
| GET | `/api/tasks/{id}` | Task with annotations |
| POST | `/api/tasks/generate` | Generate tasks from dataset |
| POST | `/api/tasks/assign` | Assign task to annotator |
| PATCH | `/api/tasks/{id}` | Update task status |
| GET/POST | `/api/annotations/{taskId}` | Get/create annotations |
| PUT/DELETE | `/api/annotations/{id}` | Update/delete annotation |
| GET/POST | `/api/reviews/{taskId}` | Get/create reviews |
| POST | `/api/qa/calculate` | Calculate inter-annotator agreement |
| POST | `/api/qa/calculate-dataset` | Batch QA for dataset |
| GET | `/api/qa/flagged` | Get flagged conflicts |
| PATCH | `/api/qa/{id}/resolve` | Resolve QA conflict |
| GET | `/api/qa/stats/{datasetId}` | QA stats for dataset |
| GET | `/api/export/{datasetId}` | Export labeled data |
| GET/POST | `/api/taxonomies` | List/create label taxonomies |
| GET/POST | `/api/users` | List/create users |
| GET/PUT/DELETE | `/api/users/{id}` | Get/update/deactivate user |
| GET | `/api/users/annotators` | List available annotators |
| GET | `/api/users/roles` | List roles |
| GET | `/api/audit-logs` | Query audit log (HIPAA) |

## Database Schema

14 tables with UUID primary keys, foreign key constraints, and performance indexes:
`users`, `roles`, `permissions`, `role_permission`, `datasets`, `dataset_versions`, `data_records`, `taxonomies`, `labels`, `tasks`, `annotations`, `annotation_versions`, `reviews`, `qa_scores`, `audit_logs`

## Project Structure

```
EnnLabel/
├── backend/                  # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # 10 REST controllers
│   │   ├── Http/Middleware/         # RBAC + audit middleware
│   │   ├── Http/Requests/          # Form request validation
│   │   ├── Models/                  # 14 Eloquent models (UUID)
│   │   ├── Providers/              # Service providers
│   │   └── Services/               # 7 service classes
│   ├── bootstrap/                  # App bootstrap
│   ├── config/                     # 11 config files
│   ├── database/migrations/        # 8 migration files
│   ├── database/seeders/           # RBAC + admin seeder
│   ├── public/                     # HTTP entry point
│   ├── routes/api.php              # 30+ API routes
│   └── storage/                    # Logs, cache, sessions
├── frontend/                 # Next.js 14 app
│   └── src/
│       ├── app/                    # 9 pages (login, dashboard, tasks, datasets, users, qa, audit, taxonomies)
│       ├── components/             # Annotation UI, shared components
│       ├── hooks/                  # Custom React hooks (auth, keyboard shortcuts)
│       ├── lib/                    # API client, utilities
│       ├── store/                  # Zustand state
│       └── types/                  # TypeScript interfaces
├── docker/                   # Nginx + PHP-FPM configs
└── docker-compose.yml
```

## License

Proprietary - All rights reserved.
