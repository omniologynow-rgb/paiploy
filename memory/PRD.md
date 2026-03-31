# Paiploy - Product Requirements Document

## Overview
**Product**: Paiploy - B2B SaaS platform for automated failed payment recovery (dunning management)
**Owner**: Matthew Ball / Organized Energy LLC
**Copyright**: 2026 Paiploy - Proprietary software, no copying permitted
**Stack**: Vite + React + TypeScript frontend, Python/FastAPI backend

## Architecture
- **Frontend**: `/app/frontend/` - Vite + React 18 + TypeScript + TailwindCSS + Lucide React + Recharts
- **Backend**: `/app/backend/` - FastAPI + SQLAlchemy + PostgreSQL + Stripe + Redis + Celery
- **Font**: Onest (Google Fonts)
- **Color Theme**: Emerald green (#10b981) + Charcoal (#0a0f1a) dark theme

## Core Requirements
1. Full rebrand from RecoverPay to Paiploy
2. Emerald green + charcoal dark theme (differentiator from blue-themed competitors)
3. Sidebar navigation for dashboard pages
4. High-converting landing page with comparison table
5. 3-step onboarding wizard post-registration
6. Payment detail page with recovery timeline
7. Toast notifications, error boundaries, empty states
8. Editable email templates with preview
9. Visual retry timeline in settings

## What's Been Implemented (Jan 2026)
- [x] Complete rebrand: RecoverPay → Paiploy everywhere
- [x] Emerald green + charcoal color scheme with custom CSS variables
- [x] Collapsible sidebar navigation with mobile drawer
- [x] Landing page: Hero with dashboard mockup, social proof bar, problem/solution, 6-feature grid, competitor comparison table, pricing cards ($0/$39/$99), final CTA, footer
- [x] Login & Register pages with Paiploy branding
- [x] 3-step onboarding wizard (Connect Stripe, Configure Recovery, Confirmation)
- [x] Dashboard with stat cards, charts (Recharts), quick stats bar, recent activity feed, empty state
- [x] Failed Payments page with search, filters, pagination, retry/cancel/view actions
- [x] Payment Detail page (/payments/:id) with customer info, payment details, recovery timeline stepper, action buttons
- [x] Dunning Emails page with stats, history/templates tabs, edit template modal (textarea + preview)
- [x] Analytics page with timeline chart, breakdown chart, failure stats table, time range selector
- [x] Settings page with Stripe connection hero card, visual retry timeline, email toggles, danger zone
- [x] Global toast notification system (bottom-right, emerald/red/amber/blue variants)
- [x] Error boundary with friendly fallback UI
- [x] Empty states with icons and CTAs on all pages
- [x] Smooth page transitions (animate-fadeIn)
- [x] Hover animations on cards and buttons
- [x] Paiploy-branded loading states
- [x] Custom scrollbar styling
- [x] Favicon (P in emerald on dark background)
- [x] package.json name updated to "paiploy-frontend"
- [x] Removed @supabase/supabase-js dependency

## Testing Status
- Frontend: 100% pass rate (iteration 1)
- All 17 test cases passed including branding, color scheme, navigation, responsiveness

## Prioritized Backlog
### P0 (Critical)
- Backend env vars configuration for full API functionality

### P1 (High)
- Stripe OAuth flow end-to-end integration
- Real-time data in activity feed (currently mock data)
- Email template WYSIWYG editor upgrade

### P2 (Medium)
- Dark/light theme toggle
- Multi-language support
- API access for Business tier
- In-app payment wall feature

## User Personas
1. **SaaS Founder** - Wants simple setup, clear ROI metrics
2. **Finance/Revenue Ops** - Needs detailed analytics, export capabilities
3. **Developer** - API access, webhook configuration

## Next Tasks
- Configure backend env vars for full API support
- Test full auth flow (register → onboarding → dashboard)
- Add real data integration for activity feed
- Implement Stripe OAuth callback handling
