# Firebase Environment Variables Setup

## Overview
The SMTP credentials have been moved from hardcoded values to Firebase environment configuration for better security.

## Setup Instructions

### 1. Set Environment Variables for Production

Run these commands in your terminal from the project root:

```bash
# Set SMTP user (email address)
firebase functions:config:set smtp.user="spiritualmagazine@iuscm.org"

# Set SMTP password (App Password)
firebase functions:config:set smtp.password="fpftbmkpbprswsjj"

# Verify the configuration
firebase functions:config:get
```

### 2. For Local Development (Emulator)

Create a `.runtimeconfig.json` file in the `functions/` folder:

```bash
cd functions
firebase functions:config:get > .runtimeconfig.json
```

This will download your production config for local testing.

**OR** manually create `functions/.runtimeconfig.json`:

```json
{
  "smtp": {
    "user": "spiritualmagazine@iuscm.org",
    "password": "fpftbmkpbprswsjj"
  }
}
```

**Important:** The `.runtimeconfig.json` file is already in `.gitignore` and will NOT be committed to Git.

### 3. Deploy Functions

After setting the environment variables, deploy your functions:

```bash
firebase deploy --only functions
```

### 4. Update Environment Variables

To update credentials in the future:

```bash
# Update password
firebase functions:config:set smtp.password="new_password_here"

# Redeploy functions
firebase deploy --only functions
```

### 5. View Current Configuration

```bash
firebase functions:config:get
```

### 6. Delete Configuration (if needed)

```bash
firebase functions:config:unset smtp
```

## Security Notes

✅ **DO NOT** commit `.runtimeconfig.json` to Git (already in `.gitignore`)
✅ **DO NOT** commit `.env` files to Git (already in `.gitignore`)
✅ Credentials are now stored securely in Firebase
✅ Different credentials can be used for different environments

## Accessing Config in Code

```javascript
// Access SMTP credentials
const smtpUser = functions.config().smtp.user;
const smtpPassword = functions.config().smtp.password;
```

## Troubleshooting

### Error: "Cannot read property 'smtp' of undefined"

This means the environment variables are not set. Run:

```bash
firebase functions:config:set smtp.user="your_email" smtp.password="your_password"
```

### Local Emulator Not Working

Make sure you have `.runtimeconfig.json` in the `functions/` folder:

```bash
cd functions
firebase functions:config:get > .runtimeconfig.json
```

## Next Steps

1. Run the setup commands above
2. Test locally with the emulator: `firebase emulators:start --only functions`
3. Deploy to production: `firebase deploy --only functions`
