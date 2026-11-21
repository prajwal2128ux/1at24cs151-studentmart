# StudentMart — Campus Marketplace

A React + Express + MongoDB product marketplace with one shared sign-in page and role-based access.

## Features

### Administrator
- Sign in through the same sign-in page used by customers. The server reads the account role and redirects administrators to `/admin`.
- View store statistics, customers and orders.
- Add products with an image, edit product details/stock, and delete products.
- Update order status.

### Customer
- Create a customer account or sign in through the same page.
- Browse and search products, filter by category, and view stock.
- Add products to the cart, change quantities, and place a Cash on Delivery order.
- View order history and profile.

### Security
- Public registration always creates a `user` account. It does not accept a role from the browser.
- Product create/update/delete, customer administration, order administration and order status changes are protected by server-side administrator authorization.
- Authentication uses an HTTP-only cookie. Do not store passwords or authentication tokens in local storage.

## Requirements
- Node.js 20.19+ or 22.12+
- MongoDB local service or MongoDB Atlas database

## 1. Configure the backend

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and set your MongoDB connection string, a random `JWT_SECRET` (at least 32 characters), and administrator credentials. Keep `.env` private; never commit it.

## 2. Create the administrator account

From the `server` directory:

```bash
npm run seed:admin
```

This creates or updates the account configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Use those credentials on the regular StudentMart sign-in screen. Do not add an Admin/Customer role selector to public registration.

## 3. Start the backend

```bash
cd server
npm run dev
```

The API runs at `http://localhost:5000` by default.

## 4. Configure and start the frontend

In another terminal, from the project root:

```bash
npm install
```

Copy `.env.example` to `.env` if your API is not running at `http://localhost:5000`. Then run:

```bash
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Main routes

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Shared sign-in and account creation page |
| `/admin` | Admin | Admin overview |
| `/admin/products` | Admin | Add, edit and delete products |
| `/admin/orders` | Admin | Manage customer orders |
| `/admin/users` | Admin | View customers |
| `/shop` | Customer | Customer dashboard |
| `/shop/products` | Customer | Browse products |
| `/shop/cart` | Customer | Shopping cart |
| `/shop/checkout` | Customer | Place an order |
| `/shop/orders` | Customer | Order history |

## Notes
- Product images are uploaded to `server/uploads/` and served from `/uploads`.
- Orders use Cash on Delivery in this project; no online payment gateway is configured.
- Product data, user accounts and orders are stored in MongoDB. The cart is currently stored in the customer's browser.
