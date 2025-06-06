# Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Claude API key

### 2. Deploy Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial n8n workflow generator"
   git branch -M main
   git remote add origin https://github.com/yourusername/n8n-workflow-generator.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### 3. Custom Domain (Optional)
- In Vercel dashboard → Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

## Alternative Deployments

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Netlify
1. Connect GitHub repository  
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### Self-Hosted
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Required for all deployments:
```env
CLAUDE_API_KEY=your_claude_api_key_here
```

Optional (for future features):
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
N8N_CLOUD_CLIENT_ID=your_n8n_oauth_client_id
N8N_CLOUD_CLIENT_SECRET=your_n8n_oauth_client_secret
```

## Performance Optimization

### Vercel Configuration
The included `vercel.json` optimizes:
- API route timeout (30s for Claude API)
- Environment variable management
- Build optimization

### Monitoring
- Enable Vercel Analytics
- Monitor API usage in Claude dashboard
- Set up error tracking (Sentry recommended)

## Security Checklist

- ✅ API keys stored as environment variables
- ✅ No sensitive data in client-side code
- ✅ CORS properly configured
- ✅ Input validation with Zod
- ✅ Error handling without exposing internals

## Troubleshooting

### Build Errors
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint
```

### API Issues
- Verify Claude API key is valid
- Check API rate limits
- Monitor Vercel function logs

### Performance Issues
- Enable Vercel Analytics
- Monitor Claude API response times
- Consider caching for repeated requests

## Scaling Considerations

### Current Limits
- Vercel: 100GB bandwidth/month (free)
- Claude API: Rate limits apply
- No database required (stateless)

### Future Scaling
- Add Redis for caching
- Implement user authentication
- Add workflow storage
- Consider Claude API alternatives

---

**Ready to deploy?** Follow the Vercel steps above for the fastest deployment! 