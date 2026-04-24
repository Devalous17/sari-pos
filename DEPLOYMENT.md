# 🚀 Deploy Sari-Sari Store POS to Vercel (FREE!)

## ✅ What You'll Get
- **FREE website** at `your-app-name.vercel.app`
- **Camera scanning WORKS** (no iframe restrictions!)
- **HTTPS automatically** (secure by default)
- **Auto-updates** when you push changes
- **100% FREE forever** for personal projects

---

## 📋 Prerequisites

Before you start, you need:
1. **GitHub account** (free) - [Create one here](https://github.com/signup)
2. **Vercel account** (free) - [Sign up here](https://vercel.com/signup)
3. **Your code** - Already in this folder!

**Time needed:** 10-15 minutes total

---

## 🎯 Step-by-Step Deployment

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the **"+"** icon in the top-right → **"New repository"**
3. Fill in:
   - **Repository name:** `sarisari-pos` (or any name you like)
   - **Description:** "Sari-Sari Store POS System"
   - **Public** or **Private** (your choice)
   - ✅ Check **"Initialize this repository with a README"**
4. Click **"Create repository"**

### Step 2: Upload Your Code to GitHub

**Option A: Using GitHub Web Interface (Easiest)**

1. On your new repository page, click **"Add file"** → **"Upload files"**
2. **Drag and drop ALL files** from your project folder:
   ```
   ✅ src/
   ✅ public/
   ✅ package.json
   ✅ vercel.json
   ✅ vite.config.ts
   ✅ tsconfig.json
   ✅ index.html
   ✅ All other files
   ```
3. Write a commit message: "Initial commit - Sari-Sari POS"
4. Click **"Commit changes"**

**Option B: Using Git Command Line (If you know Git)**

```bash
# Navigate to your project folder
cd /path/to/your/project

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Sari-Sari POS"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/sarisari-pos.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and **Sign in with GitHub**
2. Click **"Add New..."** → **"Project"**
3. Find your `sarisari-pos` repository and click **"Import"**
4. Vercel will auto-detect settings:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
5. Click **"Deploy"**

⏳ **Wait 2-3 minutes** while Vercel builds and deploys your app...

### Step 4: Test Your Live Website! 🎉

1. Once deployment completes, you'll see: **"Congratulations! 🎉"**
2. Click **"Visit"** to open your live website
3. Your URL will be: `https://sarisari-pos-xxxxx.vercel.app`
4. **Test the camera scanner:**
   - Click the **"Scan"** button
   - Your browser will ask for camera permission
   - Click **"Allow"**
   - Camera should work perfectly! 📷✅

---

## 🔧 Customizing Your Domain (Optional)

### Get a Custom Vercel Domain (Free)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add a custom domain like: `my-sarisari-store.vercel.app`
4. Click **"Add"** - Done!

### Use Your Own Domain (Costs money)

If you own a domain (like `sarisaristore.com`):
1. In Vercel → **"Settings"** → **"Domains"**
2. Add your domain
3. Update your domain's DNS settings (Vercel shows you how)
4. Wait 24-48 hours for DNS propagation

---

## 🔄 Updating Your App

When you want to make changes:

1. **Edit your code** in Figma Make or locally
2. **Upload new files to GitHub** (same as Step 2)
3. **Vercel auto-deploys!** - Your website updates automatically in 2-3 minutes

---

## 📱 Camera Scanner Features

### What Works Now:
- ✅ **QR Code scanning** with device camera
- ✅ **Barcode scanning**
- ✅ **Front & back camera** support (mobile)
- ✅ **Permission requests** work properly
- ✅ **Manual entry** as fallback

### How to Use QR Codes:

1. Generate QR codes for your products (IDs 1-10):
   - Go to: https://www.figma.com/qr-code-generator/
   - Type the product ID (e.g., "1" for Coca Cola)
   - Download the QR code
   - Print it or display on screen

2. In your POS app:
   - Click **"Scan"** button
   - Allow camera access
   - Point at QR code
   - Product automatically added to cart!

---

## 💰 Costs Breakdown

| Service | Cost |
|---------|------|
| **Vercel Hosting** | ₱0 (FREE forever) |
| **HTTPS Certificate** | ₱0 (Included) |
| **Bandwidth** | ₱0 (100GB/month free) |
| **Auto-deployments** | ₱0 (Unlimited) |
| **Custom .vercel.app domain** | ₱0 (FREE) |
| **Total** | **₱0.00** 🎉 |

**Paid options (optional):**
- Custom domain (.com, .ph, etc.): ₱500-1,500/year
- Vercel Pro (more features): $20/month - **NOT NEEDED for your app**

---

## 🆘 Troubleshooting

### "Build failed"
- Check that all files were uploaded to GitHub
- Make sure `package.json` and `vercel.json` are in the root folder

### "Camera doesn't work"
- Make sure you're using **HTTPS** (Vercel auto-provides this)
- Check browser permissions: Click lock icon → Camera → Allow
- Try on mobile - camera works better on phones

### "Page not found"
- Wait 5 minutes after deployment
- Clear browser cache (Ctrl+Shift+Del)
- Try incognito/private browsing mode

### "Dependencies failed to install"
- This is rare with Vercel
- Check the build logs in Vercel dashboard
- Contact me for help!

---

## 🎓 Next Steps

After deployment:
1. ✅ **Test all features** (cashier, storage, analytics)
2. ✅ **Try camera scanning** with QR codes
3. ✅ **Share your URL** with others to use
4. ✅ **Add products** to your inventory
5. ✅ **Start selling!** 🛒

---

## 📞 Need Help?

If you get stuck:
1. Check the Vercel build logs (shows errors)
2. Try redeploying (click "Redeploy" in Vercel)
3. Ask me for help!

---

## 🎉 You Did It!

Your Sari-Sari POS is now:
- ✅ Live on the internet
- ✅ Accessible from any device
- ✅ Camera scanning works
- ✅ FREE forever
- ✅ Automatically backed up
- ✅ Auto-updates when you push changes

**Congratulations! 🎊**

Your live URL: `https://[your-project-name].vercel.app`

---

## 📸 Screenshot Your Success!

Take a screenshot of:
1. Your live website URL
2. Camera scanner working
3. A completed transaction

You built and deployed a real web application! 🚀
