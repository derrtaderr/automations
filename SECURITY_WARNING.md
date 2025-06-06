# 🚨 SECURITY WARNING - CRITICAL API KEY MANAGEMENT

## ⚠️ IMPORTANT: API Key Security Notice

This repository was audited and **ALL API keys have been removed** before publishing. However, if you are setting up this project, please follow these critical security guidelines:

### 🔒 NEVER Commit API Keys

**BEFORE YOU COMMIT ANYTHING:**

1. **Check for exposed credentials:**
   ```bash
   # Search for potential API keys in your files
   grep -r "sk-" . --exclude-dir=node_modules
   grep -r "API_KEY" . --exclude-dir=node_modules
   grep -r "api.*key" . --exclude-dir=node_modules --ignore-case
   ```

2. **Use environment variables only:**
   ```bash
   # ✅ CORRECT: Use .env.local (never committed)
   CLAUDE_API_KEY=your_actual_key_here
   
   # ❌ WRONG: Never hardcode in source files
   const apiKey = "sk-ant-api03-..."; 
   ```

3. **Verify .gitignore is working:**
   ```bash
   # Check what will be committed
   git status
   git diff --cached
   
   # Ensure .env files are ignored
   git check-ignore .env.local
   ```

### 🛡️ Security Checklist

Before pushing to GitHub:

- [ ] All API keys are in `.env.local` (not committed)
- [ ] `.gitignore` includes all environment files
- [ ] No `sk-` or similar patterns in source code
- [ ] `mcp.json` only contains placeholder values
- [ ] All sensitive tokens are environment variables

### 🚨 If You Accidentally Commit API Keys

1. **Immediately rotate the keys** in the respective service dashboards
2. **Remove from git history:**
   ```bash
   # Remove file from history
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch path/to/file' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: Destructive)
   git push origin --force --all
   ```
3. **Update environment variables** with new keys

### 📋 Services That Need API Keys

This project integrates with:

- **Anthropic Claude**: `CLAUDE_API_KEY` (Required)
- **OpenAI**: `OPENAI_API_KEY` (Optional)
- **Perplexity**: `PERPLEXITY_API_KEY` (Optional)
- **n8n Instance**: Your instance URL and API key (User-provided)

### 🔍 Regular Security Audits

Run these commands periodically:

```bash
# Check for accidentally committed secrets
git log -p | grep -i "api.*key\|secret\|token\|password"

# Scan current files
find . -name "*.ts" -o -name "*.js" -o -name "*.json" | xargs grep -l "sk-\|api.*key" 2>/dev/null

# Verify environment setup
env | grep -i key
```

### 📞 Report Security Issues

If you find exposed credentials or security issues:

1. **DO NOT** create public GitHub issues
2. Contact the repository owner directly
3. Include details about the vulnerability
4. We'll respond within 24 hours

---

**Remember: One leaked API key can compromise entire systems. Always err on the side of caution! 🔐** 