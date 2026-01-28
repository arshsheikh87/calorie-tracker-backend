# Error Troubleshooting Guide
## Common Errors and Solutions for Calorie Tracker API

This guide helps you identify and resolve common errors when testing the meal analysis APIs.

---

## 🔍 Common Error Scenarios

### 1. **400 Bad Request - Field Name Error**

**Error Message:**
```json
{
  "success": false,
  "error": "Invalid request: meal_text (or meal-text) is required and must be a non-empty string"
}
```

**Causes:**
- Missing `meal_text` or `meal-text` field in request body
- Empty string value
- Wrong field name (e.g., `foodText`, `mealText`)

**Solution:**
✅ Use the correct field name in your JSON body:
```json
{
  "meal_text": "2 rotis, dal, curd"
}
```
OR
```json
{
  "meal-text": "2 rotis, dal, curd"
}
```

**Postman Fix:**
1. Go to **Body** tab
2. Select **raw** and **JSON**
3. Ensure the field name is exactly `meal_text` or `meal-text`
4. Ensure the value is a non-empty string

---

### 2. **500 Internal Server Error - API Key Not Found**

**Error Message:**
```json
{
  "success": false,
  "error": "Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server."
}
```

**Causes:**
- `.env` file doesn't exist
- `GEMINI_API_KEY` is missing in `.env`
- `.env` file is not in the project root
- Server wasn't restarted after adding API key

**Solution:**
✅ Check your `.env` file in the project root:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Steps to Fix:**
1. Open `.env` file in project root
2. Ensure `GEMINI_API_KEY` is set (no quotes, no spaces)
3. Restart your server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

### 3. **500 Internal Server Error - Invalid API Key**

**Error Message:**
```json
{
  "success": false,
  "error": "Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server."
}
```

**Causes:**
- API key is incorrect or expired
- API key has extra spaces or quotes
- API key is incomplete

**Solution:**
✅ Verify your API key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Generate a new Gemini API key
3. Ensure no extra spaces in `.env`:
   ```env
   # ❌ WRONG
   GEMINI_API_KEY="AIzaSy..."
   GEMINI_API_KEY= AIzaSy...
   
   # ✅ CORRECT
   GEMINI_API_KEY=AIzaSy...
   ```
4. Restart server after fixing

---

### 4. **429 Too Many Requests - Rate Limit**

**Error Message:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

**Causes:**
- Too many API requests in a short time
- Exceeded Gemini/Google AI API rate limits
- Quota exhausted

**Solution:**
✅ Wait a few minutes before retrying
✅ Check your Google AI usage/billing/quota in Google AI Studio / Google Cloud console

---

### 5. **400 Bad Request - Image Upload Errors**

**Error Messages:**
```json
{
  "success": false,
  "error": "Invalid request: meal_image file is required"
}
```

OR

```json
{
  "success": false,
  "error": "Invalid file type. Only image files are allowed."
}
```

OR

```json
{
  "success": false,
  "error": "File too large. Maximum size is 10MB."
}
```

**Causes:**
- No file selected in Postman
- Wrong field name (should be `meal_image`)
- Non-image file uploaded (e.g., PDF, TXT)
- Image file exceeds 10MB limit

**Solution:**
✅ In Postman:
1. Go to **Body** tab
2. Select **form-data** (not raw)
3. Set key as `meal_image`
4. Change type from "Text" to **"File"** (dropdown)
5. Select a valid image file (JPG, PNG, GIF, WEBP)
6. Ensure file size < 10MB

**Correct Postman Setup:**
```
Key: meal_image
Type: File (not Text!)
Value: [Select File button]
```

---

### 6. **Connection Refused / Cannot Connect**

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Causes:**
- Server is not running
- Wrong port number in URL
- Firewall blocking connection

**Solution:**
✅ Start your server:
```bash
npm run dev
```

✅ Verify server is running:
- Check terminal for: `🚀 Server is running on port 5000`
- Test health check: `http://localhost:5000/` in browser

✅ Check URL in Postman matches server port:
- If server runs on port 5000: `http://localhost:5000/api/analyze-meal-text`
- If different port, update URL accordingly

---

### 7. **500 Internal Server Error - Generic**

**Error Message:**
```json
{
  "success": false,
  "error": "Failed to analyze meal text",
  "details": "..." // Only in development mode
}
```

**Causes:**
- Gemini/Google AI API service unavailable
- Network connectivity issues
- Malformed AI response
- Server-side code error

**Solution:**
✅ Check server console logs for detailed error:
```bash
# Look for error messages in terminal where server is running
Error in /analyze-meal-text: ...
```

✅ Common fixes:
1. Check internet connection
2. Verify Gemini/Google AI service status
3. Check server logs for specific error details
4. Try again after a few seconds

---

### 8. **JSON Parse Error**

**Error Message:**
```
SyntaxError: Unexpected token in JSON
```

**Causes:**
- Invalid JSON in request body
- Missing quotes around strings
- Trailing commas
- Wrong Content-Type header

**Solution:**
✅ Ensure valid JSON format:
```json
{
  "meal_text": "2 rotis, dal, curd"
}
```

✅ Check Postman settings:
- **Body** → **raw** → **JSON** selected
- **Headers** → `Content-Type: application/json`

---

## 🔧 Step-by-Step Debugging Process

### Step 1: Verify Server is Running
```bash
# Terminal should show:
🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/
```

### Step 2: Test Health Check Endpoint
**In Postman:**
- Method: `GET`
- URL: `http://localhost:5000/`
- Expected: `200 OK` with success message

### Step 3: Verify Environment Variables
```bash
# Check .env file exists and has:
PORT=5000
GEMINI_API_KEY=AIzaSy...
```

### Step 4: Check Request Format
**For Text Analysis:**
- Method: `POST`
- URL: `http://localhost:5000/api/analyze-meal-text`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "meal_text": "test meal"
  }
  ```

**For Image Analysis:**
- Method: `POST`
- URL: `http://localhost:5000/api/analyze-meal-image`
- Body (form-data):
  - Key: `meal_image`
  - Type: `File`
  - Value: [Select image file]

### Step 5: Check Server Logs
Look at terminal output for:
- ✅ Success: No error messages
- ❌ Error: Detailed error messages with stack traces

---

## 📋 Quick Checklist

Before reporting an error, verify:

- [ ] Server is running (`npm run dev`)
- [ ] `.env` file exists in project root
- [ ] `GEMINI_API_KEY` is set in `.env`
- [ ] Server was restarted after changing `.env`
- [ ] Request URL is correct (`http://localhost:5000/api/...`)
- [ ] Request method is `POST`
- [ ] Headers are set correctly
- [ ] Request body format is correct
- [ ] Field names match exactly (`meal_text` or `meal-text`)
- [ ] Image file is valid format and < 10MB
- [ ] Internet connection is working
- [ ] Gemini API key is valid and has quota/credits

---

## 🆘 Still Having Issues?

### Check Server Console Logs
The server terminal will show detailed error information:
```
Error in /analyze-meal-text: Error: ...
Error in analyzeMealText: ...
```

### Enable Development Mode
Add to `.env`:
```env
NODE_ENV=development
```
This will show more detailed error messages in API responses.

### Test with Simple Request
Start with the simplest possible request:
```json
{
  "meal_text": "apple"
}
```

### Verify Gemini API Key
Test your API key directly:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Generate/verify API key status
3. Verify account has quota/credits

---

## 📞 Common Error Codes Summary

| Status Code | Meaning | Common Causes |
|------------|---------|---------------|
| 400 | Bad Request | Wrong field name, missing field, invalid data |
| 401 | Unauthorized | Invalid API key (if auth was added) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server/API configuration issue |
| 503 | Service Unavailable | Gemini/Google AI API down or unavailable |

---

## ✅ Success Indicators

When everything works correctly, you should see:

**Request:**
- Status: `200 OK`
- Response time: 5-20 seconds (AI processing time)

**Response:**
```json
{
  "success": true,
  "data": {
    "detected_food_items": ["..."],
    "calories": 0,
    "protein_g": 0.0,
    "carbs_g": 0.0,
    "fat_g": 0.0
  },
  "message": "Meal analyzed successfully"
}
```

**Server Console:**
- No error messages
- Clean execution

---

Happy Debugging! 🚀
