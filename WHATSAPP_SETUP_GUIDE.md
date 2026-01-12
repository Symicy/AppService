# WhatsApp Business Cloud API Integration Guide

## Overview
This guide explains how to complete the WhatsApp Business API integration for sending order completion notifications to clients.

## What's Been Implemented

### 1. Backend Configuration
- ✅ Added WhatsApp API properties in `application.properties`
- ✅ Created `WhatsAppNotificationService` to handle message sending
- ✅ Added `RestTemplate` bean for HTTP requests
- ✅ Integrated notification trigger in `OrderService.updateOrderStatus()`

### 2. Notification Flow
When an order status is changed to "FINALIZAT" (completed):
1. `OrderService` detects the status change
2. Calls `WhatsAppNotificationService.sendOrderCompletionNotification()`
3. Service formats the client's phone number to E.164 format (+40...)
4. Builds device names from order (e.g., "Samsung Galaxy S21, iPhone 13")
5. Sends template message via WhatsApp Cloud API
6. Logs success/failure (doesn't block order update on failure)

## What You Need to Complete

### Step 1: Create WhatsApp Message Template in Meta Business Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Navigate to **WhatsApp Manager** → **Message Templates**
3. Click **Create Template**
4. Configure your template:

**Template Name:** `order_completion_notification`

**Category:** Utility (for order/service updates)

**Language:** Romanian (ro)

**Header:** None (optional)

**Body Text Example:**
```
Bună ziua {{client_name}},

Vă informăm că comanda #{{order_id}} pentru dispozitivul/dispozitivele {{device_details}} a fost finalizată și este gata de ridicare.

Vă așteptăm la sediul nostru pentru ridicare.

Mulțumim,
Echipa KIVA NET Service
```

**Parameters (must use lowercase, underscores, numbers only):**
- `{{client_name}}` = Client name (e.g., "Ion Popescu")
- `{{order_id}}` = Order ID (e.g., "123")
- `{{device_details}}` = Device details - Brand + Model (e.g., "Samsung Galaxy S21" or "Samsung Galaxy S21, Apple iPhone 13")

**Footer:** (Optional) "Service KIVA - Reparații profesionale"

**Buttons:** None (optional - you could add "Call Us" button)

5. Click **Submit** and wait for Meta to approve (typically 24-48 hours)

### Step 2: Get Your WhatsApp API Credentials

#### A. Get Phone Number ID

1. In **WhatsApp Manager**, click on your phone number "Kiva - We do IT +40 753 414 889"
2. Click on the **"Configurații API"** or **"API Setup"** tab at the top
3. Scroll down to find **"ID-ul numărului de telefon"** (Phone Number ID)
4. Copy this long number (e.g., `123456789012345`)

**Alternative method:**
1. Go to **Instrumente pentru cont** → **Numere de telefon** in the left sidebar
2. Click **"Call settings"** tab on your phone number
3. OR look in the URL when viewing phone number details - it may contain the ID
4. OR scroll to the bottom of any phone number page to see technical details

**If you still can't find it:**
1. Go to **Soluții pentru parteneri** (Partner Solutions) in the left menu
2. Click **"API Setup"** or **"Configurare API"**
3. The Phone Number ID will be shown there

#### B. Get Access Token

**Option 1: Temporary Token (24 hours - for testing only)**
1. Go to **Instrumente pentru cont** → **Configurațiile pentru plăți** 
2. In the **Prezentare generală** (Overview) section
3. Look for **Token de acces temporar** (Temporary Access Token)
4. Click **Generate Token** or **Generează token**
5. Copy the token (starts with `EAA...`)

**Option 2: Permanent Token (recommended for production)**
1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Click **Utilizatori** → **Utilizatori de sistem** (System Users)
3. Click **Adaugă** (Add) to create a new system user
4. Give it a name like "WhatsApp API Service"
5. Click on the created system user
6. Click **Generează un token de acces nou** (Generate New Access Token)
7. Select your WhatsApp App
8. Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
9. Click **Generează token** (Generate Token)
10. **IMPORTANT:** Copy and save this token immediately - you won't see it again!

#### C. Get WhatsApp Business Account ID (optional)
1. In **WhatsApp Manager** → **Prezentare generală** (Overview)
2. Look at the URL: `https://business.facebook.com/wa/manage/home/?waba_id=XXXXXXXXXX`
3. The number after `waba_id=` is your WhatsApp Business Account ID

### Step 3: Update application.properties

Replace placeholders in `backend/src/main/resources/application.properties`:

```properties
# WhatsApp Business Cloud API Configuration
whatsapp.api.url=https://graph.facebook.com/v21.0
whatsapp.api.phone-number-id=YOUR_PHONE_NUMBER_ID_HERE
whatsapp.api.access-token=YOUR_PERMANENT_ACCESS_TOKEN_HERE
whatsapp.api.template-name=order_completion_notification
```

**Example:**
```properties
whatsapp.api.phone-number-id=123456789012345
whatsapp.api.access-token=EAAaBbCcDdEeFfGgHh...
whatsapp.api.template-name=order_completion_notification
```

⚠️ **Security Best Practice**: Use environment variables instead of hardcoding:
```properties
whatsapp.api.access-token=${WHATSAPP_ACCESS_TOKEN}
whatsapp.api.phone-number-id=${WHATSAPP_PHONE_NUMBER_ID}
```

Then set these in your environment or IDE run configuration.

### Step 4: Test the Integration

#### Option 1: Via Application Logs
1. Restart your Spring Boot application
2. The app will log WhatsApp configuration on startup
3. Update an order status to "FINALIZAT"
4. Check logs for:
   ```
   Sending WhatsApp notification for completed order {id}
   WhatsApp notification sent successfully for order {id} to {phone}
   ```

#### Option 2: Create Test Endpoint (Optional)
Add this to `UserResource.java` or create a new `WhatsAppTestResource.java`:

```java
@RestController
@RequestMapping("/api/test")
public class WhatsAppTestResource {
    
    @Autowired
    private WhatsAppNotificationService whatsAppService;
    
    @GetMapping("/whatsapp-config")
    public ResponseEntity<?> testWhatsAppConfig() {
        boolean isConfigured = whatsAppService.testConnection();
        return ResponseEntity.ok(Map.of(
            "configured", isConfigured,
            "message", isConfigured 
                ? "WhatsApp API is configured" 
                : "WhatsApp API is NOT configured - check application.properties"
        ));
    }
}
```

Then test: `GET http://localhost:8080/api/test/whatsapp-config`

### Step 5: Verify Client Phone Numbers

Make sure clients in your database have valid phone numbers:
- Format: Romanian mobile numbers (e.g., `0712345678` or `+40712345678`)
- The service automatically converts to E.164 format (`+40712345678`)
- Client must have opted into WhatsApp Business messages (first message must be user-initiated)

## Phone Number Format Handling

The `WhatsAppNotificationService` automatically formats phone numbers:
- `0712345678` → `+40712345678`
- `40712345678` → `+40712345678`
- `+40712345678` → `+40712345678` (no change)
- `0712 345 678` → `+40712345678` (removes spaces)

## Error Handling

The integration includes comprehensive error handling:
- If WhatsApp API fails, the order status update **still completes**
- Errors are logged but don't affect core functionality
- Check logs for detailed error messages from WhatsApp API

## Common Issues & Solutions

### Issue 1: "Template not found"
**Solution:** Make sure the template name in `application.properties` matches exactly the approved template name in Meta Business Manager.

### Issue 2: "Recipient phone number is not a WhatsApp user"
**Solution:** The client's phone number must be registered on WhatsApp and must have previously messaged your business number (opt-in requirement).

### Issue 3: "Invalid access token"
**Solution:** 
- Check that token has required permissions
- Verify token hasn't expired (use permanent token, not 24-hour)
- Regenerate token if needed

### Issue 4: "Template status is PENDING"
**Solution:** Wait for Meta to approve your template (24-48 hours). Check status in WhatsApp Manager.

### Issue 5: API returns 400/403 errors
**Solution:** 
- Verify phone number format (must be E.164: +40...)
- Check that Phone Number ID is correct
- Ensure WhatsApp Business Account is active

## Template Approval Tips

To get your template approved quickly:
1. ✅ Use professional, business-appropriate language
2. ✅ Clearly identify your business
3. ✅ Provide value to the customer (order status)
4. ✅ Avoid promotional content in utility templates
5. ✅ Keep it concise and clear
6. ❌ Don't use all caps or excessive punctuation
7. ❌ Don't include URLs in utility templates
8. ❌ Don't include promotional language

## Testing Workflow

1. **Test with your own number first:**
   - Add yourself as a test client in the database
   - Create a test order
   - Change status to FINALIZAT
   - Verify you receive the WhatsApp message

2. **Check message formatting:**
   - Verify client name appears correctly
   - Verify order ID is correct
   - Verify device names are properly listed

3. **Monitor logs:**
   - Look for successful API responses
   - Check for any error messages
   - Verify phone number formatting

## Production Checklist

Before going live:
- [ ] Template approved by Meta
- [ ] Permanent access token generated and configured
- [ ] Phone Number ID correctly set
- [ ] Tested with real phone numbers
- [ ] Error logging verified
- [ ] Client phone numbers validated in database
- [ ] Consider rate limits (80 messages/second per phone number)
- [ ] Set up monitoring for failed messages

## Rate Limits

WhatsApp Cloud API limits (as of 2024):
- **Free tier**: 1,000 conversations/month
- **Paid tier**: Unlimited conversations (pay per conversation)
- **Throughput**: 80 messages/second per phone number
- **Business-initiated conversations**: 24-hour window after user message

## Next Steps (Optional Enhancements)

1. **Add delivery status webhooks:**
   - Receive confirmation when message is delivered/read
   - Update OrderLog with delivery status

2. **Support multiple templates:**
   - Different messages for different order statuses
   - Personalized messages based on order type

3. **Enable two-way messaging:**
   - Receive replies from clients
   - Handle appointment confirmations via WhatsApp

4. **Add rich media:**
   - Send images of completed repairs
   - Include QR codes for pickup

## Support Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Quick Start](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/message-templates)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages)

## Questions or Issues?

If you encounter any issues:
1. Check application logs for detailed error messages
2. Verify all credentials in `application.properties`
3. Test template status in Meta Business Manager
4. Review WhatsApp API error codes in logs
5. Check that client phone numbers are valid and on WhatsApp

---

**Implementation Status:** ✅ Code Complete - Awaiting Configuration & Testing

**Last Updated:** November 13, 2025
