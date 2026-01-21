# Flower Delivery App - Complete Deployment Guide

## Part 1: Backend Deployment to Render

### Prerequisites
- Render account (https://render.com)
- GitHub repository with latest code pushed ✅

### Step-by-Step Instructions

#### 1. Create PostgreSQL Database on Render
1. Go to https://render.com/dashboard
2. Click **New +** → **PostgreSQL**
3. Fill in details:
   - **Name**: `flower-delivery-db`
   - **Database**: `flower_db`
   - **User**: `flower_user`
   - **Region**: Your closest region
   - **Plan**: Free
4. Click **Create Database**
5. Wait for database to be ready (2-3 minutes)
6. Copy the **Internal Database URL** (looks like: `postgresql://user:password@hostname/database`)

#### 2. Create Web Service for Backend
1. Go to Render dashboard
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. If prompted to connect GitHub, authorize it
5. Fill in details:
   - **Name**: `flower-delivery-api`
   - **Environment**: `Python 3`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt && flask db upgrade`
   - **Start Command**: `gunicorn app:app --config gunicorn_config.py`
   - **Plan**: Free (or Starter for more reliability)

#### 3. Add Root Directory (Important!)
- **Root Directory**: `backend`
- This tells Render where your Flask app is located

#### 4. Set Environment Variables
In the "Environment" section, add these variables:

```
FLASK_ENV=production
FLASK_APP=run.py
DATABASE_URL=[Paste the Internal Database URL from step 1]
SECRET_KEY=[Generate using: python -c "import secrets; print(secrets.token_hex(32))"]
JWT_SECRET_KEY=[Generate using: python -c "import secrets; print(secrets.token_hex(32))"]
CORS_ORIGINS=http://localhost:3000
PESAPAL_CONSUMER_KEY=[Your PesaPal consumer key]
PESAPAL_CONSUMER_SECRET=[Your PesaPal consumer secret]
PESAPAL_API_URL=https://api.pesapal.com
```

To generate SECRET_KEY and JWT_SECRET_KEY, run locally:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

#### 5. Deploy
- Click **Create Web Service**
- Render will start building and deploying
- Wait for "Live" status (5-10 minutes)
- Copy your Render URL (looks like: `https://flower-delivery-api.onrender.com`)

#### 6. Update CORS Origins
- Go back to your Render web service settings
- Update `CORS_ORIGINS` with your Vercel frontend URL (you'll get this in Part 2)
- Format: `https://yourdomain.vercel.app`
- Save and Render will redeploy

---

## Part 2: Frontend Deployment to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- Your Render backend URL from Part 1

### Step-by-Step Instructions

#### 1. Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Search for your GitHub repository (`flowerdeliveryapp`)
5. Click **Import**

#### 2. Configure Project Settings
1. In the "Configure Project" step:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 3. Set Environment Variables
Add these in the "Environment Variables" section:

```
REACT_APP_API_URL=https://flower-delivery-api.onrender.com
```

Replace with your actual Render backend URL.

#### 4. Deploy
- Click **Deploy**
- Vercel will build and deploy your frontend
- Wait for deployment to complete (3-5 minutes)
- You'll get a Vercel URL (looks like: `https://yourname.vercel.app`)

#### 5. Update Backend CORS
- Go back to Render dashboard
- Edit your `flower-delivery-api` web service
- Update `CORS_ORIGINS` environment variable to your Vercel URL:
  ```
  CORS_ORIGINS=https://yourname.vercel.app
  ```
- Save and trigger a redeploy

---

## Part 3: Testing Your Deployment

### Test Backend
```bash
curl https://flower-delivery-api.onrender.com/api/health
```

### Test Frontend
1. Go to `https://yourname.vercel.app`
2. Try signing up or logging in
3. Check browser DevTools (F12) → Network tab to see API calls going to Render

### Common Issues & Fixes

**Issue**: Frontend shows "Cannot reach backend"
- **Fix**: Check `REACT_APP_API_URL` environment variable on Vercel
- Verify Render backend is "Live"
- Check CORS_ORIGINS setting on Render

**Issue**: Database errors on Render
- **Fix**: Verify DATABASE_URL is correct
- Run migrations manually: Go to Render → Web Service → Shell and run `flask db upgrade`

**Issue**: Static files not loading
- **Fix**: Ensure uploads folder exists on Render
- Add this to your Render environment: `FLASK_ENV=production`

---

## Part 4: Continuous Deployment

After setup, deployments happen automatically:

1. **Backend**: Push to `main` branch → Render auto-deploys (5-10 minutes)
2. **Frontend**: Push to `main` branch → Vercel auto-deploys (3-5 minutes)

To disable auto-deploy, go to service settings and turn off "Auto-Deploy".

---

## Important Environment Variables Summary

### Render Backend (.env)
- `FLASK_ENV=production`
- `FLASK_APP=run.py`
- `DATABASE_URL=[PostgreSQL connection string]`
- `SECRET_KEY=[Random 64-char string]`
- `JWT_SECRET_KEY=[Random 64-char string]`
- `CORS_ORIGINS=[Your Vercel URL]`
- `PESAPAL_CONSUMER_KEY=[Your key]`
- `PESAPAL_CONSUMER_SECRET=[Your secret]`

### Vercel Frontend (.env)
- `REACT_APP_API_URL=[Your Render backend URL]`

---

## Success Checklist

- [ ] PostgreSQL database created on Render
- [ ] Backend web service deployed on Render with "Live" status
- [ ] Frontend imported to Vercel
- [ ] Frontend deployment successful
- [ ] Backend CORS_ORIGINS updated with Vercel URL
- [ ] `REACT_APP_API_URL` set on Vercel
- [ ] Can access frontend via Vercel URL
- [ ] Frontend can communicate with backend API
- [ ] Database migrations ran successfully

---

## Next Steps

1. Monitor your deployments in Render and Vercel dashboards
2. Set up error alerts (optional)
3. Configure custom domain if desired
4. Test all features (auth, orders, payments, etc.)
5. Monitor logs for any issues

Both services have free tiers suitable for testing!
