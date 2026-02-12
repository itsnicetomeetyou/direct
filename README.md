# Smart Document Appointment System

Full-stack document appointment system with Next.js dashboard, React Native mobile app, and Electron kiosk—built with NestJS backend and MySQL.

![Kiosk Dashboard](./DiReCT/Screenshot%202025-12-07%20143525.png)

## Project Structure

```
├── client/               # Next.js dashboard web application
├── server/               # NestJS backend API (port 3001)
├── mobile-client/        # Expo React Native mobile application
├── kiosk/                # Electron-based kiosk application (DiReCT)
├── DiReCT/               # System Documentation
└── README.md
```

---

## Solution Architecture

![Arc](./DiReCT/direct-solution-archi.excalidraw.png)

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Docker** (optional): For containerized database setup
- **MySQL** (optional): If not using containerized setup

### Optional Tools

- **Bun**: Alternative package manager (used in client project)
- **Expo CLI**: For mobile client development (`npm install -g expo-cli`)
- **Electron Forge**: For kiosk development (`npm install -g @electron-forge/cli`)

---

## Environment Configuration

Each codebase requires environment variables configured through `.env.local` or `.env` files. Copy the `.env.example` files to create your configuration.

### Global Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd smart-document-appointment-system
   ```

2. **Install dependencies for all projects**:

   ```bash
   # Root level (if needed)
   npm install

   # Client
   cd client && npm install && cd ..

   # Server
   cd server && npm install && cd ..

   # Mobile Client
   cd mobile-client && npm install && cd ..

   # Kiosk
   cd kiosk && npm install && cd ..
   ```

---

## Configuration by Project

### 🌐 Client (Next.js Dashboard)

**Location**: `./client/`

**Description**: Admin dashboard and web interface for the appointment system.

#### Setup Steps

1. **Navigate to client directory**:

   ```bash
   cd client
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables** (`.env.local`):

   ```dotenv
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>

   # Gmail Configuration (for notifications)
   APP_GMAIL_EMAIL=your-email@gmail.com
   APP_GMAIL_PASS=your-app-password
   APP_GMAIL_NAME=Your Display Name

   # GitHub OAuth (Optional)
   GITHUB_ID=your-github-oauth-id
   GITHUB_SECRET=your-github-oauth-secret

   # Google Maps API Key
   NEXT_PUBLIC_GOOGLEMAPAPIKEY=your-google-maps-api-key

   # Database Connection (MySQL)
   DATABASE_URL=mysql://user:password@localhost:3306/smart_doc_db

   # LaLaMOVE API (for delivery logistics)
   LALAMOVE_API_KEY=your-lalamove-api-key
   LALAMOVE_API_SECRET=your-lalamove-api-secret
   LALAMOVE_ENV=sandbox  # or "production"
   ```

4. **Generate NextAuth secret**:

   ```bash
   openssl rand -base64 32
   ```

5. **Install dependencies**:

   ```bash
   npm install
   # or use bun
   bun install
   ```

6. **Generate Prisma Client**:

   ```bash
   npm run prisma:generate
   # or
   bunx prisma generate
   ```

7. **Run database migrations**:

   ```bash
   npm run migrate:mysql
   # or
   bunx prisma migrate dev --name initial
   ```

8. **Start development server**:
   ```bash
   npm run dev
   ```
   - Access at: `http://localhost:3000`

#### Available Scripts

- `npm run dev` - Start development server (Next.js dev server on port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server (requires npm run build first)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run migrate:mysql` - Run Prisma migrations (uses bunx and dotenv)
- `npm run prisma:generate` - Generate Prisma Client (uses bunx)

#### Dependencies

- **Next.js**: React framework
- **NextAuth.js**: Authentication
- **Prisma**: Database ORM
- **Tailwind CSS**: Styling
- **React Hook Form**: Form handling
- **Shadcn/ui**: UI components

---

### 🚀 Server (NestJS API)

**Location**: `./server/`

**Description**: Backend API built with NestJS, handling business logic and database operations.

#### Setup Steps

1. **Navigate to server directory**:

   ```bash
   cd server
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (`.env`):

   ```dotenv
   # Database Configuration (MySQL)
   DATABASE_URL=mysql://user:password@localhost:3306/smart_doc_db

   # Email Service (Gmail SMTP)
   APP_GMAIL_EMAIL=your-email@gmail.com
   APP_GMAIL_PASS=your-app-password
   APP_GMAIL_NAME=Your Display Name

   # Cloudinary Configuration (for image storage)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # LaLaMOVE API (for delivery logistics)
   LALAMOVE_API_KEY=your-lalamove-api-key
   LALAMOVE_API_SECRET=your-lalamove-api-secret
   LALAMOVE_ENV=sandbox  # or "production"
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Generate Prisma Client** (automatic via postinstall):

   ```bash
   npm install
   # or manual
   npx prisma generate
   ```

6. **Run database migrations**:

   ```bash
   npx prisma migrate dev --name initial
   ```

7. **Start development server**:
   ```bash
   npm run start:dev
   ```
   - API runs at: `http://localhost:3001`

#### Available Scripts

- `npm run start` - Start production server (requires npm run build first)
- `npm run start:dev` - Start development server with watch mode (NestJS hot reload)
- `npm run start:debug` - Start with debugging enabled
- `npm run start:prod` - Run compiled production build
- `npm run build` - Build application for production
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Debug tests with Node inspector

#### Dependencies

- **NestJS**: Framework
- **Prisma**: Database ORM
- **TypeORM**: Additional ORM support
- **Jest**: Testing framework
- **Nodemailer**: Email sending
- **Cloudinary**: Image storage

---

### 📱 Mobile Client (Expo React Native)

**Location**: `./mobile-client/`

**Description**: Cross-platform mobile application for iOS, Android, and web.

#### Setup Steps

1. **Navigate to mobile-client directory**:

   ```bash
   cd mobile-client
   ```

2. **Create environment file**:

   ```bash
   cp .env.example .env.local
   # or
   cp .env.example .env
   ```

3. **Configure environment variables** (`.env` or `.env.local`):

   ```dotenv
   # API Configuration (required - points to the NestJS server)
   EXPO_PUBLIC_API_URL=http://localhost:3001

   # Google Maps API Key (required)
   EXPO_PUBLIC_GOOGLE_MAP_API_KEY=your-google-maps-api-key
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Install Expo CLI** (if not already installed):

   ```bash
   npm install -g expo-cli
   ```

6. **Start the development server**:
   ```bash
   npm start
   ```
   - Scan QR code with Expo Go app on your phone

#### Platform-Specific Development

**For Web**:

```bash
npm run web
```

Access at: `http://localhost:19006`

**For iOS** (macOS only):

```bash
npm run ios
```

**For Android**:

```bash
npm run android
```

Requires Android SDK and emulator/device connected.

#### Available Scripts

- `npm start` - Start Expo development server (shows QR code for scanning with Expo Go app)
- `npm run web` - Start web version (browser at `http://localhost:19006`)
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run android` - Run on Android emulator/device
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run reset-project` - Reset project configuration and cache

#### Dependencies

- **Expo**: Framework for React Native
- **React Navigation**: Navigation library
- **Redux Toolkit**: State management
- **Axios**: HTTP client
- **React Native**: Mobile framework
- **Expo Router**: Routing solution

#### EAS (Expo Application Services)

For building and releasing:

```bash
eas build --platform ios
eas build --platform android
```

---

### 🖥️ Kiosk (Electron Application)

**Location**: `./kiosk/`

**Description**: Electron-based kiosk application (DiReCT - Digital Record and Credential Transaction) for in-store document transactions.

#### Setup Steps

1. **Navigate to kiosk directory**:

   ```bash
   cd kiosk
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development**:
   ```bash
   npm start
   ```
   Launches the Electron app in development mode.

#### Build & Package

**Development**:

```bash
npm start
```

**Package Application**:

```bash
npm run package
```

**Create Installers** (Make):

```bash
npm run make
```

Generates platform-specific installers (Windows .exe, macOS .dmg, Linux .deb/.rpm)

**Publish Release**:

```bash
npm run publish
```

#### Available Scripts

- `npm start` - Start development environment (Electron app opens)
- `npm run package` - Package application (creates app bundle)
- `npm run make` - Create platform-specific installers (Windows .exe, macOS .dmg, Linux .deb/.rpm)
- `npm run publish` - Publish to distribution platforms
- `npm run lint` - Run linter (echo command - no actual linting configured)

#### Dependencies

- **Electron**: Desktop application framework
- **Electron Forge**: Build and packaging tool
- **Electron Fuses**: Security plugin

#### Configuration Files

- `forge.config.js` - Electron Forge configuration
- `package.json` - Project metadata and scripts

---

## Database Setup

### MySQL Connection

All projects use MySQL. Set up with one of these methods:

#### Option 1: Local MySQL Installation

```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# Windows (Download installer)
# https://dev.mysql.com/downloads/installer/

# Linux (Ubuntu/Debian)
sudo apt-get install mysql-server
sudo service mysql start
```

#### Option 2: Docker Container

```bash
docker run --name smart-doc-db \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=smart_doc_db \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=yourpassword \
  -p 3306:3306 \
  -d mysql:8.0
```

#### Option 3: Managed Database Service

- **PlanetScale**: https://planetscale.com (MySQL as a service)
- **Hostinger MySQL**: Available with shared/business hosting plans
- **Railway**: https://railway.app (MySQL hosting)

### Database Connection String Format

```
mysql://user:password@host:port/database_name
```

### Prisma Migrations

**Run migrations** (in server directory):

```bash
npx prisma migrate dev --name migration_name
```

**For client project** (uses bunx):

```bash
bunx dotenv -e .env.local -- prisma migrate dev --name migration_name
# or
npm run migrate:mysql -- migration_name
```

**Check migration status**:

```bash
npx prisma migrate status
```

**View database with Prisma Studio**:

```bash
npx prisma studio
```

---

## External Services Configuration

### 1. NextAuth.js & GitHub OAuth

**Steps**:

1. Go to: https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local` in client

### 2. Google Maps API

**Steps**:

1. Go to: https://console.cloud.google.com
2. Create a new project
3. Enable Maps JavaScript API
4. Create an API key (restriction recommended)
5. Add to `.env.local` and `.env` files

### 3. Gmail Configuration

**For development** (using Gmail):

1. Enable 2-Step Verification on your Google account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `APP_GMAIL_PASS`

### 4. Cloudinary (Image Storage)

**Steps**:

1. Sign up at: https://cloudinary.com
2. Find credentials in Dashboard
3. Add to server `.env` file

### 5. LaLaMOVE API (Delivery Service)

**Steps**:

1. Register at: https://developers.lalamove.com
2. Get API credentials
3. Add to `.env` files for both client and server
4. Use `sandbox` environment for testing

---

## Running the Full Stack

### Development Mode (All Services)

**Terminal 1 - Start Database** (if using Docker):

```bash
docker run --name smart-doc-db \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=smart_doc_db \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=yourpassword \
  -p 3306:3306 \
  -d mysql:8.0
```

**Terminal 2 - Start Server** (listens on port 3001):

```bash
cd server
npm run start:dev
# API will be available at http://localhost:3001
# Global API prefix: http://localhost:3001/api/v1
```

**Terminal 3 - Start Client** (listens on port 3000):

```bash
cd client
npm run dev
# Dashboard will be available at http://localhost:3000
```

**Terminal 4 - Start Mobile Client** (optional):

```bash
cd mobile-client
npm start
```

**Terminal 5 - Start Kiosk** (optional):

```bash
cd kiosk
npm start
```

---

## Production Deployment

### Client (Next.js) - Vercel/Self-Hosted

```bash
cd client
npm run build
npm start
```

### Server (NestJS) - AWS/Heroku/Self-Hosted

```bash
cd server
npm run build
npm run start:prod
```

### Mobile App - App Store/Google Play

```bash
cd mobile-client
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

### Kiosk - Distributed Executable

```bash
cd kiosk
npm run make
# Distribute installers to kiosk machines
```

---

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check connection string in `.env` files
- Ensure database exists: `CREATE DATABASE smart_doc_db;`
- Run migrations: `npx prisma migrate dev`

### Port Already in Use

```bash
# Find process on port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Module Not Found Errors

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate  # for client
npx prisma generate  # for server
```

### Prisma Generate Errors

```bash
# Reset Prisma cache
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

### Mobile App Errors

```bash
# Reset Expo cache
npm run reset-project
npm install
npm start
```

---

## Project Architecture

### Technology Stack

| Layer               | Technology                              |
| ------------------- | --------------------------------------- |
| **Web Frontend**    | Next.js, React, Tailwind CSS, Shadcn/ui |
| **Mobile**          | Expo, React Native, Redux               |
| **Desktop (Kiosk)** | Electron, Electron Forge                |
| **Backend**         | NestJS, Express                         |
| **Database**        | MySQL, Prisma ORM                       |
| **Authentication**  | NextAuth.js, JWT                        |
| **File Storage**    | Cloudinary                              |
| **Email**           | Gmail SMTP                              |
| **Logistics**       | LaLaMOVE API                            |
| **Maps**            | Google Maps API                         |

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Commit changes: `git commit -m "feat: description"`
6. Push branch: `git push origin feature/your-feature`
7. Create Pull Request

---

## License

This project is licensed under the MIT License - see individual package files for details.

---

## Support

For issues and questions:

- Create an Issue on GitHub
- Check existing documentation
- Review `.env.example` files for configuration options

---

## Quick Reference

### Common Commands

```bash
# Setup all projects
for dir in client server mobile-client kiosk; do
  (cd "$dir" && npm install)
done

# Generate Prisma for all projects
cd client && npm run prisma:generate
cd ../server && npx prisma generate

# Format all code
for dir in client server mobile-client kiosk; do
  (cd "$dir" && npm run format)
done

# Lint all projects
for dir in client server mobile-client kiosk; do
  (cd "$dir" && npm run lint)
done
```

### Environment Variables Checklist

- [ ] `NEXTAUTH_SECRET` generated
- [ ] `DATABASE_URL` configured
- [ ] `APP_GMAIL_*` credentials set
- [ ] `NEXT_PUBLIC_GOOGLEMAPAPIKEY` added
- [ ] `LALAMOVE_*` credentials configured
- [ ] `EXPO_PUBLIC_API_URL` set for mobile
- [ ] `CLOUDINARY_*` credentials for server

---

Developed and Created by: [Kurt Russelle Marmol](https://github.com/jkrmarmol)

**Last Updated**: December 2025
