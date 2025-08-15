# BlueDrops VSL Project

## 🚀 Quick Start

### StackBlitz Development
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rachinha01/dtc8d)

### Local Development
```bash
npm install
npm run dev
```

## 📋 Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom hooks
├── lib/                # Libraries and utilities
├── pages/              # Page components
└── utils/              # Utility functions
```

## 🔧 Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🌐 StackBlitz Collaboration

This project is configured for seamless StackBlitz collaboration:

- **Auto-sync**: Changes sync with GitHub automatically
- **Environment**: Pre-configured with all dependencies
- **Database**: Connected to Supabase for analytics
- **Admin Dashboard**: Access via `/admin` route

### Admin Credentials
- Email: `admin@magicbluedrops.com`
- Password: `gotinhaazul`

## 📊 Features

- **VSL Analytics**: Real-time user tracking
- **Admin Dashboard**: Comprehensive analytics
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Fast loading and smooth interactions

## 🔄 Sync Instructions

When working in StackBlitz:

1. **Pull latest changes**: Click "Sync" in StackBlitz
2. **Make your changes**: Edit files normally
3. **Commit changes**: Use StackBlitz Git panel
4. **Push to GitHub**: Changes sync automatically

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Routes

- `/` - Main VSL page
- `/admin` - Admin dashboard
- `/up1bt`, `/up3bt`, `/up6bt` - Upsell pages
- `/dws1`, `/dws2`, `/dw3` - Downsell pages

## 🔐 Security

- Row Level Security (RLS) enabled on Supabase
- Admin authentication required for dashboard
- Analytics data filtered (excludes Brazilian IPs)

## 📈 Analytics Events

- `page_enter` - User enters the page
- `video_play` - VTurb video loads successfully
- `video_progress` - User reaches milestones (7:45 lead, 35:55 pitch)
- `pitch_reached` - User reaches pitch moment
- `offer_click` - User clicks purchase buttons
- `page_exit` - User leaves the page

## 🎨 Design System

- **Colors**: Blue gradient theme
- **Typography**: Inter font family
- **Components**: Glassmorphism effects
- **Animations**: Smooth transitions and micro-interactions

## 📞 Support

For technical support or questions about the project, contact the development team.

---

**Note**: This project is optimized for production use with real user analytics and payment processing.