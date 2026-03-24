# Garment Order Management System

A full-stack web application for managing garment production orders, customers, products, and analytics.

## Tech Stack

- **Backend**: Django + Django REST Framework + MySQL
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **i18n**: next-intl (Vietnamese + English)
- **Auth**: JWT (djangorestframework-simplejwt)

## Project Structure

```
.
├── backend/          # Django REST API
│   ├── accounts/     # User authentication & management
│   ├── customers/    # Customer CRUD
│   ├── products/     # Product CRUD
│   ├── orders/       # Order management
│   ├── analytics/    # Statistics & reports
│   └── config/       # Django project settings
└── frontend/         # Next.js web application
    ├── app/          # App Router pages
    ├── components/   # Reusable UI components
    ├── messages/     # i18n translations (vi, en)
    └── i18n/         # next-intl configuration
```

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (see .env.example)
cp .env.example .env  # then edit with your DB credentials

# Create MySQL database
mysql -u root -e "CREATE DATABASE garment_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

## Frontend Setup

```bash
cd frontend
npm install
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
# Start dev server
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| SECRET_KEY | Django secret key | dev key |
| DEBUG | Debug mode | True |
| DB_NAME | MySQL database name | garment_orders |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | (empty) |
| DB_HOST | MySQL host | 127.0.0.1 |
| DB_PORT | MySQL port | 3306 |
| ALLOWED_HOSTS | Comma-separated allowed hosts | localhost,127.0.0.1 |
| CORS_ALLOWED_ORIGINS | Comma-separated CORS origins | http://localhost:3000 |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:8000/api |

## Development

- Backend runs on: http://localhost:8000
- Frontend runs on: http://localhost:3000
- API docs: http://localhost:8000/api/
