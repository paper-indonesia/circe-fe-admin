# Circe Admin - Beauty Clinic Management System

Complete booking & appointment management platform for beauty clinics, salons, and spas.

## 🚀 Features

- **Multi-tenant Support**: Manage multiple outlets/branches
- **Appointment Management**: Book, reschedule, and cancel appointments
- **Staff Management**: Track staff schedules and availability
- **Product & Service Catalog**: Manage services and pricing
- **Customer Management**: Customer profiles and booking history
- **Reports & Analytics**: Business insights and performance metrics
- **Subscription Management**: Flexible pricing plans
- **Operational Onboarding**: Step-by-step setup wizard

## 🐳 Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/paper-indonesia/circe-fe-admin.git
   cd circe-fe-admin
   ```

2. **Create `.env` file** (optional)
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   ```
   http://localhost:3000
   ```

### Build Docker Image Manually

```bash
# Build the image
docker build -t circe-admin:latest .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api-url.com \
  circe-admin:latest
```

### Docker Commands

```bash
# View logs
docker-compose logs -f circe-admin

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Check container health
docker-compose ps
```

## 💻 Local Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local` file**
   ```bash
   NEXT_PUBLIC_API_URL=https://circe-fastapi-backend-740443181568.europe-west1.run.app
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
circe-fe-admin/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── signin/            # Authentication pages
│   ├── signup/
│   ├── dashboard/         # Main dashboard
│   ├── calendar/          # Appointment calendar
│   ├── clients/           # Customer management
│   ├── staff/             # Staff management
│   ├── products/          # Product/service catalog
│   └── settings/          # Application settings
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── modals/           # Modal dialogs
│   └── ...
├── lib/                   # Utility functions
├── middleware.ts          # Next.js middleware
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose config
└── next.config.mjs       # Next.js configuration
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://circe-fastapi-backend-740443181568.europe-west1.run.app` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide Icons

## 📄 Legal Documents

The application includes comprehensive Terms & Conditions and Privacy Policy:
- **Terms of Service**: 20 sections covering all legal aspects
- **Privacy Policy**: Complete data protection and privacy guidelines
- Compliant with UU PDP (Indonesian Data Protection Law)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software owned by Paper Indonesia.

## 📧 Contact

For questions or support:
- Email: reservaofficialig@gmail.com
- Organization: [Paper Indonesia](https://github.com/paper-indonesia)

---

**Built with ❤️ by Paper Indonesia**
