# RecoverPay - Failed Payment Recovery SaaS Platform

RecoverPay is a comprehensive B2B SaaS platform that helps subscription businesses and SaaS companies automatically recover failed payments, reduce involuntary churn, and recover lost revenue.

## Features

- **Automated Payment Retries**: Smart retry logic with exponential backoff and jitter
- **Intelligent Dunning Campaigns**: Professional email templates to engage customers
- **Real-time Analytics**: Track recovery rates, revenue saved, and payment failure trends
- **Stripe Integration**: Connect via Stripe OAuth for seamless payment processing
- **Configurable Retry Schedules**: Customize retry intervals and email notifications
- **Comprehensive Dashboard**: Monitor failed payments, active retries, and recovery performance

## Architecture

### Tech Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Alembic (Database migrations)
- Celery (Task queue for retry jobs)
- Redis (Celery broker)
- JWT Authentication

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS (Styling)
- React Router (Navigation)
- Recharts (Data visualization)
- Lucide React (Icons)

**Infrastructure:**
- Docker & Docker Compose
- Containerized services (postgres, redis, backend, celery-worker, celery-beat, frontend)

### Database Models

1. **User** - SaaS business owners using RecoverPay
2. **ConnectedAccount** - Stripe accounts linked via OAuth
3. **FailedPayment** - Each failed payment detected from Stripe webhooks
4. **RetryAttempt** - Individual retry actions with scheduling
5. **DunningEmail** - Email communications sent to customers
6. **RecoveryStats** - Aggregated analytics per user
7. **UserSettings** - Configurable retry and notification preferences

### API Routes

- `/api/auth` - Authentication (register, login, logout, me)
- `/api/connect` - Stripe OAuth connection management
- `/api/webhooks` - Stripe webhook handlers
- `/api/payments` - Failed payment management
- `/api/recovery` - Dashboard statistics and analytics
- `/api/dunning` - Email templates and history
- `/api/settings` - User configuration

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. Clone the repository and navigate to the project directory

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration (especially Stripe keys)

4. Start all services:
   ```bash
   docker-compose up --build
   ```

5. Run database migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development Setup

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Start Celery worker:
   ```bash
   celery -A app.celery_app worker --loglevel=info
   ```

7. Start Celery beat (scheduler):
   ```bash
   celery -A app.celery_app beat --loglevel=info
   ```

#### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Retry Engine Logic

### Default Retry Schedule

The platform uses an intelligent retry schedule with exponential backoff:

- **Attempt 1**: 4 hours after failure (soft retry)
- **Attempt 2**: 24 hours (+ friendly reminder email)
- **Attempt 3**: 72 hours (+ urgent notice email)
- **Attempt 4**: 7 days (+ card update request email)
- **Attempt 5**: 14 days (+ final warning email)

After 5 failed attempts, the payment is marked as "exhausted".

### Smart Retry Rules

- Uses exponential backoff with random jitter
- Skips retry for `stolen_card` or `fraudulent` failure codes
- For `expired_card` or `authentication_required`, sends card update email immediately
- Automatically retries when customer updates payment method
- Respects Stripe rate limits

### Configurable Settings

All retry intervals and email notifications can be configured per user in the Settings page.

## Email Templates

RecoverPay includes 4 professionally designed HTML email templates:

1. **Friendly Reminder**: Gentle notification after first retry
2. **Urgent Notice**: Action-required message after multiple failures
3. **Card Update Request**: Direct link to update payment method
4. **Final Warning**: Last chance notification before subscription cancellation

All templates support variable substitution for personalization.

## Stripe Integration

### Setup

1. Create a Stripe Connect application in your Stripe Dashboard
2. Configure OAuth settings with your callback URL
3. Add your Stripe secret key and webhook secret to `.env`
4. Configure webhook endpoints in Stripe Dashboard to point to `/api/webhooks/stripe`

### Webhook Events

RecoverPay handles these Stripe webhook events:

- `invoice.payment_failed` - Creates FailedPayment record and triggers retry sequence
- `invoice.payment_succeeded` - Marks payment as recovered
- `charge.failed` - Logs failure details
- `customer.subscription.deleted` - Marks payment as canceled
- `payment_method.updated` - Triggers immediate retry

## Important Notes

### Mock Implementations

The current version includes placeholder implementations for:

- **Stripe API calls**: Marked with `# TODO: WIRE UP REAL STRIPE API` comments
- **Email sending**: Marked with `# TODO: INTEGRATE EMAIL PROVIDER` comments

Before deploying to production, you must:
1. Integrate real Stripe API calls using the `stripe` Python library
2. Configure an email service provider (SendGrid, Mailgun, AWS SES, etc.)
3. Update webhook signature verification

### Security Considerations

- Never commit `.env` file or expose API keys
- Use environment variables for all sensitive configuration
- Enable Stripe webhook signature verification in production
- Use HTTPS for all production endpoints
- Implement rate limiting on authentication endpoints
- Regularly rotate JWT secret keys

## Deployment

### Environment Variables

Required environment variables (see `.env.example` for full list):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_CONNECT_CLIENT_ID` - Stripe Connect OAuth client ID
- `FRONTEND_URL` - Frontend application URL
- `BACKEND_URL` - Backend API URL

### Production Checklist

- [ ] Configure production database (managed PostgreSQL)
- [ ] Set up Redis instance (managed Redis or ElastiCache)
- [ ] Configure email service provider
- [ ] Integrate real Stripe API calls
- [ ] Enable Stripe webhook signature verification
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging (Sentry, CloudWatch, etc.)
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Implement rate limiting
- [ ] Configure firewall rules

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

Proprietary - All rights reserved

## Support

For support or questions, contact the development team.
