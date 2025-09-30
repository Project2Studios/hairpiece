# Security Notice

## API Key Exposure Incident

**Date**: 2025-09-30

### What Happened
A Google Gemini API key was accidentally committed to the public repository in earlier commits.

### What We Did
1. Moved API key to `.env` file (not tracked by git)
2. Added `.env` to `.gitignore` to prevent future exposure
3. Created this security notice

### What You Need To Do

**IMPORTANT**: The exposed API key `AIzaSyA6s4-XThNIFGe2A2JhadrhZDddRKkN80Q` should be revoked immediately.

#### Steps to Secure Your Account:

1. **Revoke the old API key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Find the exposed key
   - Click "Delete" or "Revoke"

2. **Create a new API key**:
   - In Google AI Studio, click "Create API Key"
   - Copy the new key

3. **Update your local environment**:
   - Edit `.env` file in the project root
   - Replace the old key with your new key:
     ```
     VITE_GEMINI_API_KEY=your_new_api_key_here
     ```

4. **Update production environment**:
   - If deployed (Vercel, Netlify, etc.), add the new key as an environment variable
   - Do NOT commit the new key to git

### Prevention
- All sensitive credentials are now stored in `.env` files
- `.env` files are excluded from version control via `.gitignore`
- `.env.example` shows required variables without exposing secrets

### Questions?
If you notice any suspicious API usage, check your Google Cloud Console for unusual activity.
