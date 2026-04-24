# 🏪 Sari-Sari Store POS System

A complete Point of Sale (POS) system built for Filipino sari-sari stores, featuring inventory management, sales tracking, analytics, and QR code scanning.

![POS System](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## ✨ Features

### 💰 Cashier Module
- Product browsing with search and category filters
- Shopping cart management
- QR code / barcode scanning
- Manual product ID entry
- Cash payment with change calculation
- Receipt generation

### 📦 Inventory Management
- Add/edit/delete products
- Image upload support
- Low stock alerts (< 10 items)
- Category organization
- Stock level tracking

### 📊 Analytics Dashboard
- Weekly and monthly sales views
- Transaction history with payment details
- Revenue and profit tracking
- Top 5 best-selling products
- Stock prediction based on sales velocity
- Interactive charts (Recharts)

## 🚀 Quick Start

### Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

### Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Vercel deployment instructions.

## 🛠️ Tech Stack

- **Frontend:** React 18.3.1 + TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **QR Scanner:** html5-qrcode
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Hosting:** Vercel (recommended)

## 📱 Product Categories

1. Canned Foods
2. Instant Noodles
3. Snacks
4. Drinks
5. Fresh Items
6. Personal Care
7. Household Items
8. Other

## 💾 Data Storage

- **LocalStorage** for offline-first functionality
- Version-controlled data schema (current: v6)
- Automatic data migration
- No backend required

## 🎨 Design System

- **Color Scheme:** White background with blue accents
- **Primary Blue:** #3B82F6
- **Dark Blue:** #1E40AF
- **Responsive:** Mobile-first design
- **Theme:** Clean, modern UI optimized for touch

## 📷 Camera Features

- QR code scanning for products
- Barcode support
- Front & rear camera selection
- Manual entry fallback
- Works on deployed version (not in Figma iframe)

## 🌐 Browser Support

- Chrome/Edge (recommended for camera)
- Safari
- Firefox
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Sample Products

The app comes with 10 pre-loaded products:
1. Coca Cola - ₱25
2. Pancit Canton - ₱12
3. Skyflakes Crackers - ₱35
4. Milo 3-in-1 - ₱10
5. Eggs - ₱9
6. Bread - ₱45
7. Bottled Water - ₱15
8. Head & Shoulders Shampoo Sachet - ₱8
9. PureFood Corned Beef - ₱65
10. Trash Bag 50pcs - ₱85

## 🔒 Security

- HTTPS required for camera access
- No sensitive data stored
- Client-side only (no server)
- Secure localStorage encryption recommended

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📞 Support

Need help? Check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
2. GitHub Issues - Report problems
3. Vercel Docs - Hosting questions

## 🎯 Roadmap

- [ ] Receipt printing
- [ ] Multiple payment methods
- [ ] Customer accounts
- [ ] Supplier management
- [ ] Expense tracking
- [ ] Cloud sync option
- [ ] Multi-store support

## 🙏 Acknowledgments

Built with ❤️ using:
- React & TypeScript
- Tailwind CSS
- Recharts
- html5-qrcode
- Lucide Icons

---

**Made for Filipino sari-sari stores** 🇵🇭

**Camera scanning works when deployed!** See [DEPLOYMENT.md](./DEPLOYMENT.md)
