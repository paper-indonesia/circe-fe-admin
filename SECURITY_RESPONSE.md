# Security Response - GitGuardian Alert

## Alert Details
- **Date**: November 10, 2025
- **Issue**: SMTP credentials exposed in GitHub repository
- **Repository**: paper-indonesia/circe-fe-admin
- **File**: `.env` file with Gmail App Password

## Actions Taken

### 1. Repository Security ✅
- [x] Enhanced `.gitignore` with comprehensive patterns
- [x] Created `.env.example` template (safe to commit)
- [x] Verified no other sensitive files are tracked
- [x] Committed and pushed security improvements

### 2. Code Improvements ✅
- [x] Updated nodemailer configuration to use SMTP SSL (port 465)
- [x] Fixed email API endpoint in `app/api/support-ticket/route.ts`
- [x] Verified credentials are loaded from environment variables only

## Required Manual Actions

### CRITICAL: Rotate Compromised Credentials

#### 1. Revoke Exposed Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Delete the exposed app password: `isjg spvm ufok eaf`
3. Generate a new 16-character app password

#### 2. Update .env File Locally
Update your local `.env` file with the new app password:
```env
GMAIL_APP_PASSWORD="your-new-16-char-password"
```

#### 3. Update Production Environment Variables
If deployed, update environment variables in:
- Cloud Run / App Engine
- Vercel / Netlify
- Any other deployment platform

### Optional: Clean Git History
The exposed credentials may still exist in Git history. To completely remove them:

```bash
# Using git filter-branch (advanced)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: coordinate with team)
git push origin --force --all
git push origin --force --tags
```

**Note**: Force pushing rewrites history and may cause issues for other developers.

## Prevention Measures

### For Developers
1. Never commit `.env` files
2. Always use `.env.example` for documentation
3. Use environment variables for all secrets
4. Review changes before committing

### Tools to Install
- **git-secrets**: Prevents committing secrets
  ```bash
  git secrets --install
  git secrets --register-aws
  ```

- **pre-commit hooks**: Scan for secrets before commit
  ```bash
  pip install pre-commit
  pre-commit install
  ```

## Security Checklist
- [x] `.gitignore` updated
- [x] `.env.example` created
- [x] Security improvements committed
- [ ] **Gmail App Password revoked and regenerated** (MANUAL)
- [ ] **Local `.env` updated with new password** (MANUAL)
- [ ] **Production env vars updated** (MANUAL)
- [ ] Git history cleaned (Optional)

## Contact
For questions about this security response, contact: aril.permana@paper.id
