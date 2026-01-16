# QR Connection Quick Start Guide

## For End Users

### Share Your Connection Code (Existing Users)

1. **Go to Home** page
2. Find **Connection Code Card** in the left sidebar
3. Click **"Show QR"** button
4. A QR code appears with your connection info
5. **Share it** with friends via:
   - Screenshot
   - "Share QR Code" button
   - Any messaging app

### Connect via QR Code (New Users)

1. Open Networkx login page
2. Click **"Connect via QR Code"** button
3. **Grant camera permission** when prompted
4. **Scan** the QR code shared by your friend
5. **Register** by filling in:
   - Email address
   - Your full name
   - Password (8+ characters)
6. **Done!** Your account is created and you're connected

### Connect via QR Code (Existing Users)

1. Open Networkx login page
2. Click **"Connect via QR Code"** button
3. **Grant camera permission**
4. **Scan** the QR code
5. **Automatic connection!** You're redirected to chat

## Features

### QR Scanner Features
- **📷 Camera**: Standard QR scanning
- **🔦 Torch**: Turn on flashlight for low light
- **🔊 Sound**: Audio feedback when scanned (toggle off if needed)
- **❌ Cancel**: Close scanner and go back

### Connection Card Features
- **📝 View Code**: See your 6-character connection code
- **📋 Copy**: Copy code to clipboard
- **📱 Show QR**: Display scannable QR code
- **🔄 Refresh**: Generate new code
- **📤 Share**: Share QR code directly

## Troubleshooting

### "Camera Permission Denied"
- **Solution**: Grant camera access in browser settings
- Go to Browser Settings → Privacy → Camera
- Allow camera for Networx app

### "Invalid QR Code Format"
- **Solution**: Make sure you're scanning a Networx QR code
- Codes contain connection information
- Try refreshing the code if expired

### "Email Already Registered"
- **Solution**: Use different email or login with existing account
- Can't create multiple accounts with same email

### "Code Expired"
- **Solution**: Generate a new connection code
- Codes expire after 10 minutes for security
- Share fresh code with friend

### "Connection Failed"
- **Solution**: 
  - Check internet connection
  - Verify code hasn't expired
  - Try scanning again
  - Restart app if needed

## Tips & Tricks

💡 **Best Practices**
- Generate new code for each new connection
- Codes are one-time use only
- Share via secure channels
- Let code expire if not used within 10 minutes

💡 **Mobile Tips**
- Ensure good lighting for scanning
- Use flashlight if in dim lighting
- Hold phone steady while scanning
- Allow camera permissions

💡 **Desktop Tips**
- Use mobile device to scan
- Or use webcam if available
- Share code via QR image
- Works on any browser

## Privacy & Security

🔒 **What's Shared**
- Only your User ID (not personal data)
- Connection code (one-time use)
- No passwords shared
- No sensitive information in QR

🔒 **Code Security**
- Expires after 10 minutes
- One-time use only
- Only works in Networx
- Server-side validation

🔒 **Data Protection**
- Passwords encrypted
- Secure HTTPS connection
- Session cookies only
- No data tracking in QR codes

## Technical Details

### QR Code Content
QR codes contain:
```
code:ABCDEF|inviter:userid
```
- `code`: 6-character connection code
- `inviter`: ID of person sharing (for UI purposes)

### Registration Process
1. **Email Check**: Verify email not in use
2. **Password Validation**: Min 8 characters
3. **Account Creation**: User account created
4. **Auto Login**: You're automatically logged in
5. **Connection Verify**: Code verified
6. **Chat Ready**: DM thread created

## Supported Devices

✅ **Fully Supported**
- iPhones (iOS 13+)
- Android phones
- iPads
- Laptops with cameras
- Desktop computers with webcams

✅ **Partially Supported**
- Older browsers (with limitations)
- Limited camera support

## FAQ

**Q: Can I reuse connection codes?**
A: No, codes are one-time use for security.

**Q: What if I lose the QR code?**
A: Generate a new one anytime in the Connection Code Card.

**Q: How long do codes last?**
A: 10 minutes from generation for security.

**Q: Can I see who used my code?**
A: Not currently, but it's in future roadmap.

**Q: What happens if scan fails?**
A: Just retry scanning the code again.

**Q: Do I need to remember the code?**
A: No, QR makes it easy - just scan!

**Q: Is my data safe?**
A: Yes! Codes don't contain personal data.

**Q: Can others misuse my QR?**
A: Unlikely - codes expire in 10 minutes.

## Getting Help

If you experience issues:
1. **Check troubleshooting** section above
2. **Verify camera permissions** are granted
3. **Ensure good internet** connection
4. **Try refreshing** the page
5. **Contact support** if problem persists

---

**Last Updated:** January 17, 2026  
**Version:** 1.0
