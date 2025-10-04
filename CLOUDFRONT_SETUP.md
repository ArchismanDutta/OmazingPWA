# CloudFront Setup Guide

To fix image/video loading issues and improve performance, you need to set up CloudFront distribution for your S3 bucket.

## 1. CloudFront Distribution Setup

### Step 1: Create CloudFront Distribution
1. Go to AWS CloudFront Console
2. Create a new distribution
3. Configure the following:

**Origin Settings:**
- Origin Domain: `omaazing-media-dev.s3.ap-south-1.amazonaws.com`
- Origin Path: Leave empty
- Origin ID: `S3-omaazing-media-dev`
- Origin Access: Public

**Default Cache Behavior:**
- Viewer Protocol Policy: `Redirect HTTP to HTTPS`
- Allowed HTTP Methods: `GET, HEAD, OPTIONS`
- Cache Policy: `Managed-CachingOptimized`
- Origin Request Policy: `Managed-CORS-S3Origin`

**Distribution Settings:**
- Price Class: `Use Only US, Canada and Europe` (or as needed)
- Alternate Domain Names (CNAMEs): Your custom domain if you have one
- SSL Certificate: Default CloudFront Certificate

### Step 2: Update Environment Variables

After creating the distribution, add the CloudFront domain to your environment files:

**In server/.env:**
```bash
# CloudFront Configuration
CLOUDFRONT_DOMAIN_DEV=d1234567890.cloudfront.net  # Replace with your actual CloudFront domain
CLOUDFRONT_DOMAIN_PROD=d0987654321.cloudfront.net  # For production
```

**In client/.env:**
```bash
# CloudFront URL for client-side access (optional)
VITE_CLOUDFRONT_DOMAIN=https://d1234567890.cloudfront.net
```

## 2. S3 Bucket CORS Configuration

Ensure your S3 bucket has proper CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD",
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-meta-custom-header"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## 3. Testing the Setup

1. Restart your server after updating environment variables
2. Upload a new image/video through the admin panel
3. Check browser network tab to see if files are served from CloudFront
4. URLs should now be: `https://d1234567890.cloudfront.net/videos/filename.mp4`

## 4. Troubleshooting

### Videos not playing:
- Check browser console for CORS errors
- Verify S3 bucket CORS configuration
- Ensure CloudFront distribution is deployed (can take 15-20 minutes)

### Images not loading:
- Check if CloudFront domain is correctly set in environment variables
- Verify S3 bucket policy allows public read access for media files
- Clear CloudFront cache if needed

### Performance Issues:
- CloudFront provides global CDN caching
- First load might be slow, subsequent loads should be fast
- Consider setting up custom cache behaviors for different file types

## 5. Security Notes

- For premium content, implement signed URLs
- Consider restricting S3 bucket access to CloudFront only (Origin Access Identity)
- Set appropriate cache headers for different content types

## 6. Current Fallback Behavior

If CloudFront is not configured, the system will:
1. Fall back to direct S3 URLs
2. Log a warning in the console
3. Still work but with potentially slower performance and possible CORS issues

## Files Modified

The following files have been updated to support CloudFront:
- `server/config/aws.js` - CloudFront URL generation
- `server/services/uploadService.js` - Content URL handling
- `server/controllers/contentController.js` - URL generation for API responses
- `client/src/utils/mediaUrl.js` - Client-side URL processing
- `client/src/components/course/LessonPlayer.jsx` - Media URL handling