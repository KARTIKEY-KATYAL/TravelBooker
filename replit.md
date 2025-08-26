# TravelEase - Travel Booking Application

## Overview

TravelEase is a full-stack travel booking web application that allows users to search, view, and book travel options across flights, trains, and buses. The application features user authentication through Replit Auth, a responsive React frontend built with shadcn/ui components, and a robust Express.js backend with PostgreSQL database integration using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) mode
- **Routing**: Wouter for client-side routing with authentication-based route protection
- **UI Components**: shadcn/ui component library with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API following conventional HTTP methods and status codes
- **Middleware**: Custom logging, JSON parsing, and error handling middleware
- **Session Management**: Express sessions with PostgreSQL storage for persistence

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect (OIDC) protocol
- **Strategy**: Passport.js with OpenID Connect strategy for authentication flows
- **Session Storage**: Server-side sessions stored in PostgreSQL with configurable TTL
- **Security**: HTTP-only cookies with secure flags and CSRF protection

### Database Architecture
- **Database**: PostgreSQL as the primary data store
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Schema Design**: Normalized relational schema with proper foreign key relationships

### Data Models
- **Users**: Core user profile with Replit Auth integration (id, email, firstName, lastName, profileImageUrl)
- **Travel Options**: Polymorphic travel entities supporting flights, trains, and buses with type-specific fields
- **Bookings**: User bookings linking to travel options with status tracking and pricing information
- **Sessions**: Server-side session storage for authentication state persistence

### Development and Build System
- **Build Tool**: Vite for fast development server and optimized production builds
- **Development**: Hot module replacement with automatic error overlay for improved DX
- **Production**: Compiled TypeScript backend with static asset serving
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### File Organization
- **Monorepo Structure**: Shared schema and types between client and server
- **Client**: React application in `/client` directory with component-based architecture
- **Server**: Express.js backend in `/server` directory with modular route handlers
- **Shared**: Common TypeScript types and Zod schemas in `/shared` directory

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching layer
- **wouter**: Lightweight client-side routing for React applications
- **express**: Web application framework for Node.js backend

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database schema management and migration tools

### UI and Styling
- **@radix-ui/react-***: Headless UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for building component variants
- **clsx**: Conditional class name utility

### Authentication
- **passport**: Authentication middleware for Node.js applications
- **openid-client**: OpenID Connect client implementation
- **express-session**: Session middleware for Express applications
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Form Handling and Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Resolvers for integration with validation libraries
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development Tools
- **vite**: Build tool and development server
- **@vitejs/plugin-react**: Vite plugin for React support
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay