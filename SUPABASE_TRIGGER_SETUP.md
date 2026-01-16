# Supabase Push Notifications Integration

## Setup Steps

### 1. Create the Edge Function

Copy the content from `supabase-push-function.ts` and create a new Edge Function in Supabase:

```bash
supabase functions new send-push-notification
```

Then paste the function code into `supabase/functions/send-push-notification/index.ts`.

### 2. Set Environment Variables

In Supabase dashboard → Functions → Environment Variables, add:

```
BACKEND_URL=https://your-backend-url.com  (or http://localhost:4012 for dev)
VAPID_PUBLIC_KEY=your_public_key
```

### 3. Create a Database Trigger

In Supabase SQL Editor, run this query to trigger the function on new messages:

```sql
-- Create trigger function that calls Edge Function
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Supabase Edge Function
  SELECT
    net.http_post(
      url:='https://your-project-id.functions.supabase.co/send-push-notification',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
      body:=jsonb_build_object(
        'record', row_to_json(NEW)
      ),
      timeout_milliseconds:=5000
    ) INTO NEW;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS push_notification_trigger ON dms ON DELETE;

CREATE TRIGGER push_notification_trigger
AFTER INSERT ON dms
FOR EACH ROW
EXECUTE FUNCTION trigger_push_notification();
```

**Replace these:**
- `your-project-id` with your actual Supabase project ID (from URL: `https://your-project-id.supabase.co`)
- `dms` with your actual messages table name

### 4. Deploy Function

```bash
supabase functions deploy send-push-notification
```

### 5. Test Locally

```bash
supabase functions serve
```

Then insert a test message:

```bash
curl -X POST http://localhost:54321/functions/v1/send-push-notification \
  -H "Content-Type: application/json" \
  -d '{
    "record": {
      "sender_id": "uuid-of-sender",
      "receiver_id": "uuid-of-receiver",
      "content": "Hello!",
      "thread_id": "uuid-of-thread"
    }
  }'
```

## How It Works

```
Message Inserted in dms table
         ↓
Supabase Trigger fires
         ↓
Calls send-push-notification Edge Function
         ↓
Edge Function fetches sender info & receiver subscriptions
         ↓
Calls backend /api/push/send endpoint
         ↓
Backend sends via Web Push API
         ↓
Service Worker receives push
         ↓
Shows notification to user
```

## Troubleshooting

**Function not executing?**
- Check Supabase Function logs: Functions → Logs
- Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgrelname = 'dms';`
- Check Edge Function environment variables are set

**Notifications not sending?**
- Verify `BACKEND_URL` is correct and accessible
- Check backend logs for `/api/push/send` calls
- Ensure user has active push subscriptions

**Getting "service_role_key" error?**
- Replace with actual service role key in trigger OR
- Use a simpler trigger without authorization header (if function is public)

## Alternative: Simple PostgreSQL Trigger (Simpler Setup)

If you want to avoid Edge Functions, use this simpler trigger:

```sql
-- For PostgreSQL with http extension
CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  backend_url TEXT := 'http://localhost:4012';
BEGIN
  -- Send HTTP request to backend
  PERFORM http_post(
    backend_url || '/api/push/send',
    jsonb_build_object(
      'userId', NEW.receiver_id,
      'title', 'New message',
      'body', NEW.content,
      'threadId', NEW.thread_id
    )::text,
    'application/json'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_notification_trigger
AFTER INSERT ON dms
FOR EACH ROW
EXECUTE FUNCTION trigger_push_notification();
```

## Production Deployment Checklist

- [ ] Function deployed to production
- [ ] Environment variables set in Supabase
- [ ] Trigger created on messages table
- [ ] BACKEND_URL points to production URL
- [ ] Test with real message
- [ ] Monitor function logs for errors
- [ ] Set up Sentry/error tracking for failed notifications
