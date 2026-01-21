# Branch Attendance App

A Vue 3 application for branch management with authentication and attendance tracking.

## Features

- 🔐 Authentication system with JWT tokens
- 🏢 Branch-specific dashboard
- 📊 Attendance statistics
- 🎨 Modern UI with Tailwind CSS
- 🔄 Automatic token refresh handling
- 🛡️ Route protection and guards

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Language**: TypeScript

## Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure API Base URL**:
   Update the `baseURL` in `src/utils/axios.ts` to point to your API server.

3. **Start development server**:

   ```bash
   pnpm dev
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

## Project Structure

```
src/
├── assets/          # Static assets and CSS
├── components/      # Reusable Vue components
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── utils/           # Utility functions (axios config)
├── views/           # Page components
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Authentication Flow

1. **Login**: Users authenticate with username/password
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Auto Headers**: Axios interceptor automatically adds Authorization headers
4. **Route Protection**: Guards prevent unauthorized access
5. **Logout**: Clears tokens and redirects to login

## API Endpoints

- `POST /api/v1/auth/branch/login` - Branch login endpoint
- Payload: `{ username, password }`
- Response: `{ user, profile, accessToken, refreshToken }`

## Environment Variables

### Development

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production with Docker

The application supports dynamic environment variables at runtime. You can set environment variables in your `docker-compose.yml`:

```yaml
services:
  attendance-app:
    environment:
      - VITE_API_BASE_URL=http://your-api-server.com
```

Or use a `.env` file with docker-compose:

```bash
# Create .env file
echo "VITE_API_BASE_URL=http://your-api-server.com" > .env

# Run with docker-compose
docker-compose up
```

The application will automatically use the runtime environment variables, making it easy to deploy to different environments without rebuilding the Docker image.

## Development

- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm type-check`
- **Formatting**: `pnpm format`

## License

MIT
