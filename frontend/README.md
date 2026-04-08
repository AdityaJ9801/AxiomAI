# AXIOM AI Frontend

A modern Next.js 16 frontend for the AXIOM AI data analysis platform with autonomous AI agents.

## 🚀 Quick Start

### Development
```bash
npm install --legacy-peer-deps
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t axiom-frontend .
docker run -p 3000:3000 axiom-frontend
```

## 🎯 Demo Mode

The application includes a built-in demo mode for easy testing:

- **Quick Demo Login**: Click the "🎯 Quick Demo Login" button on the login page
- **Manual Demo**: Use credentials `demo@axiom.ai` / `demo123`
- **Any Credentials**: Any email/password combination will work in demo mode

## 📱 Features

### Landing Page
- Interactive particle animation background
- Typing effect for dynamic text
- Feature showcase with hover effects
- Responsive design for all devices

### Authentication
- Sign in / Sign up forms
- Demo mode with pre-filled credentials
- Automatic user session management
- Secure local storage handling

### Dashboard
- Real-time backend status monitoring
- Quick action cards for common tasks
- Pipeline progress tracking
- Activity feed with live updates

### Data Analysis
- Upload CSV, Excel, and JSON files
- Descriptive statistics with correlation matrices
- Regression analysis with R² scoring
- Time series forecasting
- Interactive visualizations

### AI Agent Pipeline
- Autonomous data cleaning
- Automated exploratory data analysis
- AI-powered insights generation
- Professional report creation

## 🛠 Technical Stack

- **Framework**: Next.js 16.2.2 with Turbopack
- **Language**: TypeScript 5
- **Styling**: Custom CSS with CSS-in-JS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State**: Zustand for global state
- **Build**: Turbopack for fast development

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   ├── login/            # Authentication
│   └── app/              # Main application
│       ├── layout.tsx    # App layout with sidebar
│       ├── page.tsx      # Dashboard
│       ├── upload/       # File upload
│       ├── analysis/     # Data analysis
│       ├── quality/      # Data quality
│       ├── agent/        # AI agent
│       ├── reports/      # Report generation
│       └── dashboard/    # Power BI integration
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies
└── Dockerfile           # Container configuration
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#3b82f6 → #2563eb)
- **Secondary**: Purple gradient (#8b5cf6 → #6d28d9)
- **Background**: Dark navy (#050810)
- **Surface**: Translucent dark (#0d1526)
- **Text**: Light (#f0f6ff) / Muted (#8898aa)

### Components
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Navigation**: Fixed sidebar with active states
- **Forms**: Clean inputs with focus states
- **Tables**: Responsive with hover effects

### Typography
- **Headings**: Space Grotesk (800 weight)
- **Body**: Inter (400-600 weight)
- **Code**: JetBrains Mono (monospace)

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Next.js Config
- Turbopack enabled for fast builds
- Standalone output for Docker
- API rewrites for backend proxy
- Security headers configured
- Image optimization enabled

### TypeScript
- Strict mode enabled
- Path aliases configured (@/*)
- Next.js plugin integrated
- ESLint integration

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Overlay sidebar with hamburger menu
- **Grid**: Responsive grid layouts (4→2→1 columns)

## 🚀 Performance

- **Build Time**: ~2-3 seconds with Turbopack
- **Bundle Size**: Optimized with tree shaking
- **Images**: Next.js Image optimization
- **Fonts**: Google Fonts with preconnect
- **CSS**: Minimal custom CSS with efficient selectors

## 🔒 Security

- **Headers**: Security headers configured
- **CORS**: Proper CORS handling
- **XSS**: Content Security Policy
- **Auth**: Client-side session management
- **Validation**: Input validation and sanitization

## 🐳 Docker

Multi-stage build for production:
1. **Dependencies**: Install with legacy peer deps
2. **Build**: Next.js production build
3. **Runtime**: Minimal Alpine image with health checks

## 📊 Monitoring

- Backend API health checks
- Real-time connection status
- Error boundary for crash recovery
- Development logging

## 🎯 Demo Features

- Pre-filled demo credentials
- Sample datasets available
- Mock API responses
- Guided onboarding flow

## 🔄 Development Workflow

1. **Start**: `npm run dev`
2. **Lint**: `npm run lint`
3. **Build**: `npm run build`
4. **Test**: Manual testing with demo mode
5. **Deploy**: Docker build and run

## 📝 Notes

- Uses legacy peer deps for Chart.js compatibility
- Turbopack replaces Webpack for faster builds
- Suspense boundaries for useSearchParams
- Glass morphism design throughout
- Fully responsive and accessible