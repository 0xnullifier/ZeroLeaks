# ZeroLeaks Server

A minimal Express TypeScript server for the ZeroLeaks platform.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Run in production mode
pnpm start
```

## API Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
```
