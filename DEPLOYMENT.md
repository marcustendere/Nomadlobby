# Nomad Terminal - Deployment Guide 🚀

## Production Build Information

**Build Status:** ✅ Complete
**Total Size:** 428KB (highly optimized!)
**Build Output:** `/dist` folder

### Build Contents:
```
dist/
├── index.html (640 bytes)
└── assets/
    ├── index-DPEaHmmX.css (17.31 KB, 3.99 KB gzipped)
    └── index-Cz4fpcj-.js (410.01 KB, 132.23 KB gzipped)
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free & Fast)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Follow prompts:**
   - Link to your Vercel account
   - Set up project
   - Get instant live URL

**Benefits:**
- Free tier available
- Global CDN
- Automatic HTTPS
- ~30 second deployment
- Perfect for React apps

---

### Option 2: Netlify (Easy Drag & Drop)

**Method A: Drag & Drop**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder
3. Get instant live URL

**Method B: CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Benefits:**
- Super simple
- Free tier
- Global CDN
- Automatic HTTPS

---

### Option 3: GitHub Pages

1. **Create `.github/workflows/deploy.yml`:**
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Enable GitHub Pages** in repository settings
3. **Push to main branch**

**Benefits:**
- Free hosting
- Integrated with GitHub
- Automatic deployments

---

### Option 4: AWS S3 + CloudFront

1. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://nomad-terminal
   aws s3 sync dist/ s3://nomad-terminal --acl public-read
   ```

2. **Configure static website hosting**

3. **Optional: Set up CloudFront CDN**

**Benefits:**
- Enterprise-grade
- Highly scalable
- Very fast globally

---

### Option 5: Docker Container

**Create `Dockerfile`:**
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t nomad-terminal .
docker run -p 8080:80 nomad-terminal
```

**Benefits:**
- Consistent environments
- Easy to deploy anywhere
- Works with Kubernetes

---

### Option 6: Traditional Web Server

**Copy dist folder to your web server:**

**Apache:**
```bash
scp -r dist/* user@server:/var/www/html/
```

**Nginx:**
```bash
scp -r dist/* user@server:/usr/share/nginx/html/
```

**Benefits:**
- Full control
- No third-party dependencies
- Can use existing infrastructure

---

## 🔧 Quick Preview

The production build is currently running at:

**Local Preview:**
```
http://localhost:4173/
```

**Network Preview:**
```
http://21.0.0.20:4173/
```

You can test the production version right now using the network URL!

---

## 📊 Performance Metrics

- **Initial Load:** ~132 KB (gzipped JavaScript)
- **CSS Bundle:** ~4 KB (gzipped)
- **Total Transfer:** ~137 KB
- **Time to Interactive:** < 1 second on fast connection
- **Lighthouse Score:** Expected 95+ (Performance)

---

## 🎯 Post-Deployment Checklist

After deploying, verify:
- ✅ Application loads without errors
- ✅ Real-time data updates every 1.3s
- ✅ Charts render correctly
- ✅ Mobile responsive design works
- ✅ All 8 assets display (HYPE, BTC, ETH, CC, SOL, XRP, ZEC, BCH)
- ✅ Trading signals appear
- ✅ View modes switch (Overview/Detailed)
- ✅ Tabs work (All/Majors/Alts)

---

## 🔒 Security Recommendations

1. **Enable HTTPS** (automatic on Vercel/Netlify)
2. **Set CSP headers** for additional security
3. **Enable rate limiting** on CoinGecko API calls
4. **Consider API key** for production use

---

## 📈 Monitoring (Optional)

Add analytics to track usage:

**Google Analytics:**
```typescript
// Add to src/main.tsx
import ReactGA from 'react-ga4';
ReactGA.initialize('YOUR-GA-ID');
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

---

## 🆘 Troubleshooting

**Issue: Blank page**
- Check browser console for errors
- Verify all assets loaded (Network tab)
- Check CoinGecko API is accessible

**Issue: Charts not showing**
- Verify lightweight-charts library loaded
- Check browser console for errors

**Issue: No data updates**
- Check CoinGecko API rate limits
- Verify network connectivity
- Check browser console for API errors

---

## 🎉 Recommended: Deploy to Vercel Now!

**Fastest deployment (30 seconds):**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follows prompts)
vercel --prod

# Get instant live URL like:
# https://nomad-terminal-xyz.vercel.app
```

The production build is ready in the `dist/` folder. Choose your deployment method above and go live! 🚀

---

**Need help?** Check the main README.md for more information.
