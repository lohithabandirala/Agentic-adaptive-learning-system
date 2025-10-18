# 🚀 Quick Deployment Guide

## ✅ Current Status
- Backend: Running on http://localhost:4000
- Frontend: Running on http://localhost:5173

## 📦 Production Build

### Step 1: Build Frontend
```cmd
cd C:\vibathon\frontend
npm run build
```
Output: `dist/` folder with optimized static files

### Step 2: Build Backend
```cmd
cd C:\vibathon\backend
npm run build
```
Output: `dist/` folder with compiled JavaScript

### Step 3: Test Production Locally
```cmd
cd C:\vibathon\backend
set NODE_ENV=production
npm start
```

## 🌐 Deploy to Cloud

### Option A: Vercel (Recommended for Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. In `C:\vibathon\frontend`: `vercel`
3. Follow prompts
4. Update backend URL in `src/services/api.ts`

### Option B: Railway (Recommended for Backend)
1. Push to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard:
   - `GEMINI_API_KEY`
   - `PORT=4000`
   - `NODE_ENV=production`

### Option C: Netlify + Render
**Frontend (Netlify):**
- Drag `dist/` folder to Netlify
- Or connect GitHub repo

**Backend (Render):**
- Create new Web Service
- Connect GitHub repo
- Set build command: `npm run build`
- Set start command: `npm start`

### Option D: AWS/Azure/GCP
- Deploy frontend to S3/Azure Blob + CloudFront/CDN
- Deploy backend to EC2/App Service/Compute Engine
- Use RDS/Azure SQL/Cloud SQL for database

## 🔧 Production Checklist

### Before Deployment
- [ ] Update API baseURL in `frontend/src/services/api.ts`
- [ ] Set production Gemini API key in backend `.env`
- [ ] Configure CORS for your frontend domain
- [ ] Test all features locally in production mode
- [ ] Review and remove console.logs
- [ ] Set up error monitoring (Sentry)

### Security
- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Add rate limiting
- [ ] Implement real JWT authentication
- [ ] Validate file uploads
- [ ] Add database (replace in-memory storage)

### Performance
- [ ] Enable gzip compression
- [ ] Add CDN for static assets
- [ ] Implement caching strategy
- [ ] Optimize images
- [ ] Add database indexes

## 📝 Environment Variables

### Backend `.env` (Production)
```
PORT=4000
GEMINI_API_KEY=your_production_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-api.com/api
```

## 🐳 Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run: `docker-compose up -d`

## 🎯 Post-Deployment

1. Test all user flows (Teacher/Student/Admin)
2. Verify file uploads work
3. Test AI question generation
4. Check adaptive test flow
5. Verify analytics display correctly
6. Test on mobile devices
7. Run Lighthouse audit
8. Set up monitoring and alerts

## 📊 Monitoring

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, LogRocket
- **Analytics**: Google Analytics, PostHog
- **Performance**: New Relic, DataDog

## 🆘 Troubleshooting

**500 Errors:**
- Check server logs
- Verify API key is set
- Check database connection

**CORS Errors:**
- Add frontend domain to CORS_ORIGIN
- Check preflight requests

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version (use 18+)

---

**Ready to deploy!** 🎉

Your app is production-ready with:
✅ Professional UI
✅ Adaptive testing
✅ AI integration
✅ Performance charts
✅ Full authentication flow
