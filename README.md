# 🎯 Predict Core 

A mobile-first prediction marketplace built on Core blockchain with a clean, professional design. Users can swipe through prediction markets, place bets, and compete with the community.

![Predict Core](https://img.shields.io/badge/Version-1.0.0-brightgreen) ![Core Blockchain](https://img.shields.io/badge/Blockchain-Core-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🃏 Tinder-Style Swipe Interface** - Engaging mobile-first experience for browsing predictions
- **🔗 Core Blockchain Integration** - Deployed on Core network for fast, low-cost transactions  
- **💰 Real-Time Betting** - Place bets with live odds calculation and instant feedback
- **📊 Portfolio Tracking** - Comprehensive position tracking and performance analytics
- **🏆 Leaderboards** - Compete with other predictors and track rankings
- **🎨 Professional Design** - Clean white + green theme optimized for mobile and desktop
- **🔐 Wallet Integration** - Seamless wallet connection via Privy
- **🤖 AI Powered** - AI-driven market recommendations and analysis

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Professional component library
- **Framer Motion** - Smooth animations

### Backend  
- **Next.js API Routes** - Serverless backend
- **Prisma ORM** - Database management
- **PostgreSQL** - Production database
- **Redis** - Caching and sessions

### Blockchain
- **Core Blockchain** - Layer 1 blockchain
- **Solidity** - Smart contract language
- **viem** - TypeScript Web3 library
- **Hardhat** - Smart contract development

### Infrastructure
- **Privy** - Wallet authentication
- **Vercel** - Frontend hosting
- **Railway/Supabase** - Database hosting
- **OpenAI** - AI features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Core blockchain wallet with testnet funds

### 1. Clone and Install
```bash
git clone <repository>
cd predict-core-app
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Update .env with your configuration
```

### 3. One-Command Setup
```bash
npm run setup
```

This will:
- Set up the database with migrations and seed data
- Deploy smart contracts to Core testnet
- Create sample prediction markets
- Run tests to verify everything works
- Build the application

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:3000` to see your prediction marketplace!

## 📁 Project Structure

```
predict-core-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── predictions/       # Swipe interface page
│   ├── markets/           # Market browsing page
│   └── portfolio/         # User portfolio page
├── components/            # React components
│   ├── prediction/        # Prediction-specific components
│   └── ui/               # Reusable UI components
├── contracts/            # Smart contracts
├── lib/                  # Utilities and services
│   ├── web3/            # Blockchain integration
│   └── types/           # TypeScript types
├── prisma/              # Database schema and migrations
├── scripts/             # Deployment and setup scripts
└── test/               # Smart contract tests
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:setup` - Set up database with migrations and seed
- `npm run db:reset` - Reset database (destructive!)
- `npm run prisma:studio` - Open database GUI

### Blockchain
- `npm run deploy:testnet` - Deploy contracts to Core testnet
- `npm run deploy:mainnet` - Deploy contracts to Core mainnet
- `npm run test:blockchain` - Test blockchain integration
- `npm run create:markets` - Create sample markets

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:api` - Test API routes only
- `npm run test:components` - Test components only

### Production
- `npm run setup:prod` - Full production setup
- `npm run verify:production` - Verify production deployment

## 🔑 Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/predict_core_db"

# Blockchain
PRIVATE_KEY="your-wallet-private-key"
CORE_SCAN_API_KEY="your-corescan-api-key"

# Authentication  
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-secret"

# AI Features
OPENAI_API_KEY="your-openai-key"

# Coinbase AgentKit
CDP_API_KEY_ID="your-cdp-key-id"
CDP_API_KEY_SECRET="your-cdp-secret"
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - User accounts and wallet addresses
- **Market** - Prediction markets with questions and metadata
- **Bet** - User bets on markets with amounts and positions
- **UserSwipe** - Swipe interactions for the Tinder-style interface
- **UserPreferences** - User settings and category preferences

## 🔗 Smart Contracts

### PredictionMarket.sol
Main contract handling:
- Market creation and management
- Bet placement and tracking  
- Market resolution and payouts
- Fee collection and management

**Key Functions:**
- `createMarket()` - Create new prediction market
- `placeBet()` - Place bet on market outcome
- `resolveMarket()` - Resolve market with final outcome
- `claimWinnings()` - Claim winnings from resolved markets

## 🎨 Design System

The application uses a professional white + green theme:

- **Primary Green**: `#A4FF31` - CTAs and success states
- **Background**: Pure white for clean, professional look
- **Typography**: Inter font for excellent readability
- **Components**: shadcn/ui for consistent, accessible components
- **Mobile-First**: Optimized for mobile with desktop enhancements

## 🧪 Testing

Comprehensive test suite covering:

### Smart Contract Tests
- Market creation and validation
- Betting functionality and edge cases
- Market resolution and payouts
- Access controls and security

### Frontend Tests  
- Component rendering and interactions
- API route functionality
- User flow testing
- Mobile responsiveness

### Integration Tests
- Blockchain interaction
- Database operations
- End-to-end user journeys

## 🚀 Deployment

### Development Deployment
```bash
npm run setup
npm run dev
```

### Production Deployment
```bash
npm run setup:prod
npm run verify:production
```

Deploy frontend to Vercel:
```bash
vercel --prod
```

## 📈 Monitoring & Analytics

The application includes:
- Error tracking with Sentry
- Performance monitoring  
- User analytics
- Smart contract event monitoring
- Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Community**: Join our Discord for discussions
- **Email**: contact@predictcore.com

## 🎯 Roadmap

- [ ] NFT rewards for top predictors
- [ ] Advanced market analytics  
- [ ] Social features and communities
- [ ] Mobile app (React Native)
- [ ] Additional blockchain support
- [ ] Governance token and DAO

---

**Built with ❤️ for the Core blockchain community**

*Ready to predict the future? Let's go! 🚀*
