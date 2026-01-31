# EcomGiga Operations Platform

Unified operations platform for managing Etsy and eBay stores.

## Features

- **Dual Portal System**: Separate Etsy and eBay portals with platform-specific features
- **Role-Based Access**: Employees only see their assigned platform
- **Order Management**: Create, track, and fulfill orders
- **Daily Screenshots**: Track eBay store performance with daily screenshots
- **Costs Tracker**: Track company-wide and per-store costs
- **Employee Management**: Manage team members and permissions

## Tech Stack

- Next.js 14
- Supabase (Auth + Database)
- Tailwind CSS
- TypeScript

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run these files in order:
   - `ecomgiga-schema-v4.sql` (creates tables)
   - `ecomgiga-seed-v4.sql` (adds employees, stores, initial data)

### 2. Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

### 3. Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## User Roles

| Role | Platform | Access |
|------|----------|--------|
| admin | both | Full access to everything |
| manager | etsy/ebay | Full access to their platform |
| finance | both | Finance/PNL sections only |
| listing | etsy/ebay | Order fulfillment, listings |
| graphic | etsy | Graphics queue, product creation |
| hunter | ebay | Product hunting |
| csr | ebay | Customer service |
| hr | ebay | HR functions |
| supplier | - | View only |

## Importing Employees

The seed file includes all 24 active employees from your spreadsheet with correct roles:

**eBay Team (16)**:
- Listing Specialists
- CSR
- Product Hunter
- HR

**Etsy Team (8)**:
- Graphic Designers
- Listing Specialists
- Manager

## Stores

**36 Etsy Stores** - UK, Italy, USA, Australia
**42 eBay Stores** - UK, USA, Australia

## Security

- Row Level Security (RLS) enabled on all tables
- Users only see data for their assigned platform
- Secure authentication via Supabase
- Environment variables for sensitive data
