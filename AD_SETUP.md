# Video Ad Monetization Setup Guide

This guide explains how to configure video ads for production use with the Hairpiece app.

## Overview

The app uses **Google Ad Placement API** to display video ads during the AI image generation loading period. This provides a non-intrusive monetization strategy that doesn't disrupt the core user experience.

## Features

✅ **Interstitial video ads** during loading states
✅ **Automatic frequency capping** (1 ad per hour per user)
✅ **Graceful fallback** if ads fail to load
✅ **Test mode** for development

## Setup for Production

### Step 1: Create a Google AdSense Account

1. Visit [Google AdSense](https://www.google.com/adsense/)
2. Sign up or log in with your Google account
3. Complete the account setup and verification process
4. Wait for account approval (usually takes 1-3 days)

### Step 2: Get Your Ad Client ID

1. Log into your AdSense account
2. Navigate to **Ads** → **Overview**
3. Find your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Copy this ID for the next step

### Step 3: Update the App Configuration

Edit `index.html` and replace the placeholder with your real Ad Client ID:

```html
<!-- BEFORE (Development/Test Mode) -->
<script async
  data-adbreak-test="on"
  data-ad-client="ca-pub-0000000000000000"
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  crossorigin="anonymous">
</script>

<!-- AFTER (Production Mode) -->
<script async
  data-ad-client="ca-pub-YOUR-ACTUAL-ID-HERE"
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  crossorigin="anonymous">
</script>
```

**Important Changes for Production:**
- Remove `data-adbreak-test="on"` attribute
- Replace `ca-pub-0000000000000000` with your actual Publisher ID

### Step 4: Create ads.txt File

Create a file named `ads.txt` in your `public` folder with the following content:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your Publisher ID (without the `ca-` prefix).

### Step 5: Deploy and Verify

1. Deploy your application to production
2. Wait 24-48 hours for Google to crawl your site
3. Check AdSense dashboard to verify ad impressions are being recorded

## How It Works

### User Flow

1. User uploads photo and enters hairstyle description
2. User clicks "Generate Hairstyle"
3. **Video ad plays** (15-30 seconds) during loading
4. AI processes the image while ad is playing
5. Generated result is displayed after ad completes

### Technical Flow

```typescript
// src/services/adService.ts handles:
1. Ad initialization and configuration
2. Frequency capping (1 ad/hour)
3. Error handling and fallbacks
4. Ad lifecycle events

// src/components/AdModal.tsx provides:
1. Visual overlay for ad display
2. Loading indicators
3. User-friendly messaging

// src/App.tsx coordinates:
1. Triggering ads at the right time
2. Coordinating with AI generation
3. State management
```

## Testing

### Test Mode (Current Setup)

With `data-adbreak-test="on"` enabled, you'll see:
- Test ads (not real advertisers)
- Faster ad delivery for testing
- Console logs for debugging

### Testing Checklist

- [ ] Ad modal appears when generating hairstyle
- [ ] Ad plays for 15-30 seconds
- [ ] Ad can be skipped after 5-10 seconds (Google's standard)
- [ ] AI generation completes after ad
- [ ] Second generation within 1 hour skips ad (frequency capping)
- [ ] Graceful fallback if ads fail to load

## Revenue Optimization

### Best Practices

1. **Don't overload users**: Stick to 1 ad per hour maximum
2. **Monitor metrics**: Check AdSense for:
   - Click-through rates (CTR)
   - Cost per mille (CPM)
   - Ad fill rates
3. **A/B testing**: Experiment with ad timing and placement
4. **User feedback**: Listen to user complaints about ad frequency

### Expected Revenue

According to industry data (2025):
- **CPM**: $2-10 per 1000 impressions (varies by geography)
- **CTR**: Video ads typically get 18x higher CTR than banner ads
- **Fill rate**: 80-95% with Google AdSense

**Example calculation:**
- 1,000 users/day
- 1 ad per user = 1,000 impressions/day
- $5 CPM average = $5/day = $150/month

## Troubleshooting

### Ads Not Showing

1. **Check console for errors**: Open browser dev tools
2. **Verify Publisher ID**: Ensure it's correct in `index.html`
3. **Check AdSense status**: Account must be approved
4. **Wait for propagation**: Can take 24-48 hours after setup
5. **Test mode**: Ensure `data-adbreak-test="on"` is present for testing

### Low Fill Rates

- Check geographic targeting in AdSense settings
- Verify site category is set correctly
- Ensure ads.txt file is accessible at `yourdomain.com/ads.txt`

### Revenue Lower Than Expected

- Monitor ad placement effectiveness
- Check for bot traffic (doesn't count)
- Verify geography (US/UK/CA typically higher CPM)
- Review content policy compliance

## Advanced Features (Optional)

### Rewarded Video Ads

Currently implemented but not enabled. To activate:

```typescript
// In App.tsx, add a button:
const handleWatchForFaster = async () => {
  const rewarded = await adService.showRewardedAd({
    onReward: () => {
      // Give user benefit (faster processing, HD result, etc.)
    }
  });
};
```

### Analytics Integration

Track ad performance with Google Analytics:

```typescript
// In adService.ts, add to callbacks:
onComplete: () => {
  gtag('event', 'ad_completed', {
    ad_type: 'interstitial',
    placement: 'loading_screen'
  });
}
```

## Support

For issues with:
- **Ad implementation**: Check this documentation
- **AdSense account**: [Google AdSense Help](https://support.google.com/adsense/)
- **Technical issues**: Check browser console for errors

## Legal Considerations

⚠️ **Important**: Before deploying ads, ensure:
1. Privacy policy includes Google AdSense disclosure
2. Cookie consent (if required in your jurisdiction)
3. Compliance with local advertising laws
4. Age-appropriate content for all audiences

---

**Last Updated**: 2025-09-30
**Google Ad Placement API Version**: Latest (2025)