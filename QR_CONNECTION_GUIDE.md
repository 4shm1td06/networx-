# QR-Based Connection System Documentation

## Overview

The QR-based connection system allows users to connect on Networx by scanning a QR code. Non-registered users are automatically registered when they scan a connection QR code, enabling a frictionless onboarding experience.

## Architecture

### Components

#### 1. **QRConnectionFlow** (`src/components/QRConnectionFlow.tsx`)
Main component that handles the entire QR-based connection flow:
- QR scanning for unregistered users
- Auto-registration with email/name/password
- Connection establishment
- State management for different steps

**Steps:**
- `qr-scan`: Initial QR scanning phase
- `register`: Registration form for new users
- `connecting`: Establishing connection (loading state)
- `success`: Connection successful
- `error`: Error handling and retry

#### 2. **QRScanner** (`src/components/QRScanner.jsx`)
Enhanced QR scanning component with:
- HTML5 QRcode integration
- Torch (flashlight) control
- Sound feedback on successful scan
- Touch-friendly UI with proper styling
- Cancel button with easy navigation

#### 3. **CodeCard** (`src/components/home/sidebar/CodeCard.tsx`)
Updated to generate shareable QR codes:
- Generates connection codes
- Creates QR codes with format: `code:ABCDEF|inviter:userid`
- Share button for easy distribution
- Copy code functionality

### QR Code Format

QR codes contain encoded data in the following format:
```
code:ABCDEF|inviter:userid
```

**Fields:**
- `code`: 6-character connection code (e.g., "ABC123")
- `inviter`: User ID of the person sharing the code
- Format allows easy parsing and connection establishment

### Flow Diagrams

#### For Unregistered Users
```
User scans QR → QRConnectionFlow starts
↓
Show Registration Form
↓
User enters email, name, password
↓
Auto-register user
↓
Auto-login with provided credentials
↓
Verify connection code
↓
Create DM thread
↓
Redirect to /home
```

#### For Registered Users
```
User scans QR → QRConnectionFlow detects auth
↓
Skip registration
↓
Verify connection code
↓
Create DM thread
↓
Redirect to /home
```

## Usage

### For Users Connecting via QR

1. **Unregistered User:**
   - Click "Connect via QR Code" on login page
   - Scan a Networx connection QR code
   - Fill in registration form (email, name, password)
   - Account created and connected automatically

2. **Registered User:**
   - Click "Connect via QR Code" on login page
   - Scan a Networx connection QR code
   - Automatically verified and connected

### For Users Sharing Connection Codes

1. Go to Home page
2. Find Connection Code Card in sidebar
3. Click "Show QR" to display your QR code
4. Share QR code with others
5. Others can scan to connect instantly

## API Integration

### Endpoints Used

1. **POST /api/check-email**
   - Check if email already registered
   - Input: `{ email }`
   - Output: `{ exists: boolean }`

2. **POST /api/register**
   - Register new user
   - Input: `{ email, password, name }`
   - Output: `{ success, user }`

3. **POST /api/login**
   - Auto-login after registration
   - Input: `{ email, password }`
   - Output: `{ success, user }`

4. **GET /api/me**
   - Fetch current user data
   - Output: `{ user }`

5. **POST /api/verify-connection-code**
   - Verify and establish connection
   - Input: `{ code, requestingUserId }`
   - Output: `{ connectedUserId }`

## Routes

### New Route
- **`/qr-connect`** - QR connection flow page
  - Public route (no authentication required)
  - Handles both registration and connection

### Updated Routes
- **`/login`** - Added "Connect via QR Code" button

## Features

### Security
- ✅ Password validation (minimum 8 characters)
- ✅ Email uniqueness checking
- ✅ Credentials stored securely with cookies
- ✅ Auto-login only after successful registration
- ✅ Code verification before connection

### User Experience
- ✅ Single-step registration from QR code
- ✅ Torch/flashlight support
- ✅ Sound feedback on successful scan
- ✅ Loading states and animations
- ✅ Clear error messages
- ✅ Retry mechanisms
- ✅ Auto-redirect after successful connection

### Accessibility
- ✅ Proper button labels and titles
- ✅ Keyboard navigation support
- ✅ Semantic HTML structure
- ✅ Clear visual feedback
- ✅ Error messages in proper colors

## Environment Setup

### Required Dependencies
```json
{
  "html5-qrcode": "^2.x",
  "qrcode.react": "^1.0.0",
  "lucide-react": "^latest",
  "sonner": "^latest"
}
```

### Configuration
- API URL: `https://networx-smtp.vercel.app/api`
- Fallback dev URL: `http://localhost:4012/api`

## Error Handling

### Validation
- Email format validation
- Password length check (minimum 8 characters)
- QR code format validation
- Code expiration check

### Error Messages
- Invalid QR code format
- Email already registered
- Registration failed
- Login failed
- Connection verification failed
- Network errors

### Retry Mechanisms
- Users can retry scanning
- Users can go back to login
- Failed registrations don't block future attempts

## Testing Scenarios

### Scenario 1: New User QR Connection
1. Generate QR code on registered user's device
2. Open another device/browser (not logged in)
3. Navigate to `/qr-connect`
4. Scan QR code
5. Fill registration form
6. Auto-registered and connected
7. Redirect to home

### Scenario 2: Existing User QR Connection
1. Generate QR code on registered user's device
2. Open another device/browser with existing account
3. Navigate to `/qr-connect`
4. Scan QR code
5. Automatically verified and connected
6. Redirect to home

### Scenario 3: Invalid QR Code
1. Scan invalid QR code
2. System shows error message
3. User can retry or go back to login

### Scenario 4: Expired Code
1. Scan expired QR code
2. System shows error (code expired)
3. User must retry with fresh code

## Performance Considerations

- ✅ QR scanner initializes only when needed
- ✅ Camera cleanup on component unmount
- ✅ Lazy loading of components
- ✅ Minimal re-renders with proper state management
- ✅ API calls optimized with credentials

## Future Enhancements

1. **QR Code Customization**
   - Custom colors/branding
   - Logo in center of QR
   - Different formats/resolutions

2. **Analytics**
   - Track QR connections
   - Measure adoption rates
   - User flow analytics

3. **Advanced Features**
   - Invite codes (non-QR)
   - Batch QR generation
   - Connection history
   - QR code expiration settings

4. **Mobile Optimization**
   - Native camera integration
   - One-tap sharing
   - Deep linking support

## Support

For issues or questions about the QR connection system:
1. Check error messages for specific issues
2. Verify API endpoints are accessible
3. Ensure QR code format is correct
4. Check user registration requirements

---

**Last Updated:** January 17, 2026
**Version:** 1.0
