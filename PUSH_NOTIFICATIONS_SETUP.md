# Backend Push Notifications Setup

## Installation

1. **Install required package:**
```bash
npm install web-push
```

2. **Generate VAPID Keys:**
```bash
npx web-push generate-vapid-keys
```

Save the output - you'll need it for environment variables.

## Environment Variables

Add these to your `.env` file:

```env
# Web Push VAPID Keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:support@networx.com
```

## Database Setup

Create the `push_subscriptions` table in Supabase:

```sql
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

## New API Endpoints

### 1. **Subscribe to Push**
```http
POST /api/push/subscribe
Authorization: Bearer {token} (optional)
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "base64...",
      "auth": "base64..."
    }
  }
}

Response:
{
  "success": true,
  "message": "Subscribed to push notifications"
}
```

### 2. **Send Push Notification**
```http
POST /api/push/send
Content-Type: application/json

{
  "userId": "user-uuid",
  "title": "New message from John",
  "body": "Hey, how are you?",
  "icon": "https://...",
  "badge": "https://...",
  "threadId": "thread-uuid"
}

Response:
{
  "success": true,
  "message": "Sent to 2 devices, 0 failed",
  "sent": 2,
  "failed": 0
}
```

### 3. **Unsubscribe from Push**
```http
POST /api/push/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/..."
}

Response:
{
  "success": true,
  "message": "Unsubscribed from push notifications"
}
```

## Integration with Chat

When a message is received, trigger push notifications:

```typescript
// In your message INSERT trigger or handler
app.post("/api/messages", async (req, res) => {
  const { senderId, receiverId, content, threadId } = req.body;

  // ... save message to database ...

  // Send push notification
  const receiverData = await supabaseAdmin
    .from("users")
    .select("name, profile_image")
    .eq("id", receiverId)
    .single();

  const senderData = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", senderId)
    .single();

  await fetch(`http://localhost:4012/api/push/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: receiverId,
      title: `Message from ${senderData.data?.name}`,
      body: content,
      icon: receiverData.data?.profile_image,
      threadId,
    }),
  });

  res.json({ success: true });
});
```

## Frontend VAPID Public Key

The frontend will use the public key stored in `.env.local`:

```env
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

The frontend already has:
- Service worker registration (`/public/sw.js`)
- Push subscription logic (`/src/utils/notifications.ts`)
- Message notification integration (`/src/contexts/ChatContext.tsx`)

## Testing

1. **Test subscription:**
```bash
curl -X POST http://localhost:4012/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "test-endpoint",
      "keys": {"p256dh": "test", "auth": "test"}
    }
  }'
```

2. **Test notification:**
```bash
curl -X POST http://localhost:4012/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "title": "Test",
    "body": "This is a test",
    "threadId": "thread-uuid"
  }'
```

## Flow Diagram

```
User Receives Message (Supabase)
         ↓
ChatContext INSERT Handler
         ↓
Call /api/push/send (if offline)
         ↓
Backend fetches user subscriptions
         ↓
Send via Web Push API
         ↓
Service Worker receives push
         ↓
Shows notification with click routing
         ↓
User clicks → Opens app to thread
```

## Features

✅ **Offline Notifications** - Works when app is closed  
✅ **Sender Info** - Shows name and avatar in notification  
✅ **Automatic Routing** - Clicking opens correct conversation  
✅ **Subscription Management** - Add/remove subscriptions  
✅ **Fallback Cleanup** - Removes invalid subscriptions automatically  
✅ **Anonymous Support** - Can subscribe without login  

## Production Checklist

- [ ] Generate production VAPID keys
- [ ] Add VAPID keys to production `.env`
- [ ] Create `push_subscriptions` table in production DB
- [ ] Update CORS origins if needed
- [ ] Set `VITE_VAPID_PUBLIC_KEY` in frontend env
- [ ] Test on real devices (iOS Safari, Android Chrome)
- [ ] Monitor push delivery rates
- [ ] Set up error logging for failed pushes
