# Instagram Assistant Proxy API

A production-ready Node.js proxy to let **ChatGPT Actions** schedule & publish Instagram content via **Instagram Graph API**, and fetch insights.

## 0) Requirements
- Node.js 18+
- Redis (for scheduling) — e.g., local Redis or Upstash/Redis Cloud
- A **Meta Developer App** with products: *Instagram Graph API* + *Facebook Login*
- An Instagram **Professional** account linked to a Facebook Page
- A **Long-Lived Access Token** with permissions (see below)

## 1) Setup
```bash
git clone <this-zip-or-repo>
cd instagram-assistant-proxy
cp .env.example .env
# edit .env: X_API_KEY, IG_ACCESS_TOKEN, DEFAULT_IG_USER_ID, REDIS_URL
npm install
npm run dev
```

## 2) Environment
- `X_API_KEY`: shared secret for ChatGPT Action (header name: X-API-Key)
- `IG_ACCESS_TOKEN`: long-lived token (60 days) — refresh before expiry
- `DEFAULT_IG_USER_ID`: your IG business/creator account ID
- `GRAPH_API_VERSION`: default `v23.0`
- `REDIS_URL`: e.g., `redis://localhost:6379` or Upstash URL

## 3) Endpoints (for Actions)
- `GET /health`
- `POST /instagram/publish` — body:
```json
{
  "ig_user_id": "1789...",
  "media_type": "REEL",
  "video_url": "https://cdn.example.com/reel.mp4",
  "cover_image_url": "https://cdn.example.com/cover.jpg",
  "caption": "Caption here #hashtag",
  "publish_at": "2025-10-01T14:30:00Z",
  "disable_comments": false
}
```
- `GET /instagram/insights/account?ig_user_id=...&metrics=impressions,reach&period=days_28`
- `GET /instagram/insights/media?media_id=...&metrics=impressions,reach,likes,comments,saves`
- `GET /instagram/best-time?ig_user_id=...&timezone=Asia/Kuwait&top_n=5`

## 4) How scheduling works
We use **BullMQ** delayed jobs. If `publish_at` is in the future, we enqueue a job with delay; a worker wakes up and publishes at that time. For immediate publish, the server creates a media container then publishes it. For videos/reels we poll processing status first.

## 5) Getting tokens & IDs (quick sketch)
- Link IG account to a Facebook Page (required to obtain IG user ID).
- Get the Page's `instagram_business_account` → this is the IG user ID.
- Generate a short-lived token (Facebook Login or Graph Explorer), then exchange it for a **long-lived** token, and refresh every < 60 days.
- Required permissions typically include: `instagram_content_publish`, `instagram_manage_insights`, `instagram_basic`, and relevant page permissions.

## 6) Using with ChatGPT Actions
- Open ChatGPT → **Create a GPT** → **Actions** → **Add Action (OpenAPI)** → paste `openapi.yaml`
- Under Authentication, choose **API Key** and set header `X-API-Key` to the same value in `.env`

## 7) Notes
- Stories publishing: supported via Content Publishing API with constraints; check latest Meta docs.
- Handle API errors: permission, media format, account eligibility (creator/business).
- For production, run API and worker as separate processes and use a durable Redis.

## 8) License
MIT
