# Virtual Outfit Try-On Application

## Overview

This is a full-stack AI-powered virtual outfit try-on application that allows users to upload full-body images and visualize themselves wearing different clothing items. The application uses HuggingFace's IDM-VTON model to generate realistic outfit previews without requiring user authentication.

**Core Purpose**: Enable users to experiment with different clothing combinations (shirts, pants, shoes, coats, watches) and colors through AI-generated try-on images.

**Technology Stack**:
- Frontend: React with TypeScript, Vite build system
- UI Framework: shadcn/ui components with Radix UI primitives
- Styling: Tailwind CSS with custom design tokens
- Backend: Node.js with Express
- Image Processing: HuggingFace Inference API (IDM-VTON model)
- File Handling: Multer for multipart form data
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure**: The application follows a three-panel layout design inspired by modern AI tools (Midjourney, RunwayML):
- Left panel: Image upload and user controls
- Center panel: Primary preview area for generated images
- Right panel: Clothing selection interface

**Responsive Design Strategy**: Uses Tailwind's breakpoint system with a mobile-first approach:
- Desktop (≥1280px): Full three-panel layout
- Tablet (768px-1279px): Right panel stacks below center
- Mobile (<768px): Full vertical stack

**State Management Pattern**: TanStack Query handles all server state, with local state managed through React hooks. No global state management library is used due to the application's stateless nature.

**Component Library**: Built on shadcn/ui, which provides unstyled, accessible components built on Radix UI primitives. This choice enables consistent design while maintaining full customization control.

**Design System**: 
- Typography: Inter (primary), Space Grotesk (headings)
- Spacing: Tailwind units (2, 4, 6, 8, 12, 16) for rhythm
- Color system: HSL-based with CSS variables for theme flexibility
- Border radius: Custom values (9px, 6px, 3px)

### Backend Architecture

**Server Framework**: Express.js with TypeScript in ESM module format

**File Upload Strategy**: Multer configured for in-memory storage with validation:
- Maximum file size: 8MB
- Allowed types: Image files only (image/*)
- Storage: Memory buffer (temporary, no persistence)

**Stateless Design**: No database or persistent storage. All image processing is temporary and ephemeral. The `storage.ts` file exists as a placeholder but contains no actual storage logic.

**API Structure**:
- Single endpoint: `POST /api/tryon`
- Accepts multipart/form-data with image file and JSON clothing data
- Returns base64-encoded generated image or error response

**Error Handling**: Centralized validation for file uploads and clothing data with descriptive error messages returned to client.

**Development Tools**:
- Vite middleware mode for HMR in development
- Custom logging middleware for API request tracking
- Runtime error overlay plugin for better DX

### AI Integration Architecture

**HuggingFace Integration Strategy**: 
- Model: IDM-VTON (Virtual Try-On)
- Authentication: Bearer token via environment variable
- Input: Binary image buffer sent directly
- Prompt Generation: Clothing selections converted to text prompt
- Retry Logic: Implemented to handle model loading delays
- Timeout: 60-second limit for API responses

**Image Processing Flow**:
1. Client uploads image + clothing selections
2. Backend validates file and data
3. Image buffer sent to HuggingFace API with generated prompt
4. Response converted to base64 data URL
5. Client displays original and generated images side-by-side

**Rationale for Design Choices**:
- In-memory processing avoids database complexity for temporary operations
- Base64 encoding eliminates need for file storage and serving infrastructure
- Retry mechanism handles HuggingFace model cold starts
- Direct binary upload to API maintains image quality

### Build and Deployment Architecture

**Build Process**:
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles server code to `dist/index.js`
- Configuration: TypeScript with strict mode, ESM modules

**Development vs Production**:
- Development: Vite dev server with HMR, Replit-specific plugins
- Production: Compiled static assets served by Express

**Path Resolution**: Custom aliases configured across Vite, TypeScript:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## External Dependencies

### Third-Party Services

**HuggingFace Inference API**:
- Purpose: AI-powered virtual try-on image generation
- Model: yisol/IDM-VTON
- Authentication: API key via environment variable `HUGGINGFACE_API_KEY`
- Rate limiting: Subject to HuggingFace's free tier limits
- Endpoint: `https://api-inference.huggingface.co/models/yisol/IDM-VTON`

### Database

**Current State**: No database configured or required. The application is fully stateless.

**Note**: While Drizzle ORM and PostgreSQL packages are present in dependencies (Neon serverless driver, connect-pg-simple), they are not actively used. The `drizzle.config.ts` and `shared/schema.ts` suggest potential future implementation but no database operations currently exist.

### Key NPM Packages

**UI Components**:
- `@radix-ui/*`: Unstyled accessible component primitives
- `react-color`: Color picker component
- `react-dropzone`: Drag-and-drop file upload
- `lucide-react`: Icon library
- `react-spinners`: Loading animations

**Form Handling**:
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolver
- `zod`: Schema validation

**Routing & Data**:
- `wouter`: Lightweight routing (≈1.5KB)
- `@tanstack/react-query`: Server state management

**Backend**:
- `multer`: Multipart form data handling
- `express`: Web framework

**Build Tools**:
- `vite`: Frontend build tool and dev server
- `esbuild`: Backend bundler
- `typescript`: Type checking
- `tailwindcss`: Utility-first CSS framework

### Environment Variables

Required:
- `HUGGINGFACE_API_KEY`: Authentication for HuggingFace API
- `DATABASE_URL`: (Present in config but not used)

Optional:
- `NODE_ENV`: Environment mode (development/production)
- `REPL_ID`: Replit-specific identifier for dev tooling