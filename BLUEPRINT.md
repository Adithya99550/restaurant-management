# 🍽️ Real-Time Restaurant Management System — Claude Code Blueprint

## STEP 0 — LOAD SKILLS FIRST (do this before anything else)

Read these skill files in this exact order before writing a single line of code:

1. `F:\restaurant-management\.agents\skills\frontend-design\SKILL.md`
2. `F:\restaurant-management\.agents\skills\uiux-pro-max\SKILL.md`

Internalize every rule in both files. All UI, component, layout, typography, color, animation, and interaction decisions must follow those skills strictly. Do not proceed to Phase 1 until both are read.

---

## READ THIS FIRST
This file is the complete project specification. Build everything phase by phase.
After each phase, confirm completion before moving to the next.
Ask clarifying questions only if something is genuinely ambiguous.
Otherwise, make smart decisions and keep building.

---

## Project Overview

A real-time restaurant management web application with 4 roles:
- **Waiter** — takes orders, manages tables
- **Kitchen/Cook** — receives and prepares orders
- **Cashier/Admin** — billing, payments, monitoring
- **Customer** — scans QR code, views menu, places order

10 tables in the restaurant. All roles communicate in real-time via WebSockets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database | MySQL |
| ORM | Prisma (mysql provider) |
| Auth | JWT (jsonwebtoken) |
| Password Hash | bcryptjs |

---

## Folder Structure

```
restaurant-management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── tableController.js
│   │   │   ├── orderController.js
│   │   │   ├── menuController.js
│   │   │   └── billController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tables.js
│   │   │   ├── orders.js
│   │   │   ├── menu.js
│   │   │   └── bills.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.jsx
    │   ├── waiter/
    │   │   └── page.jsx
    │   ├── kitchen/
    │   │   └── page.jsx
    │   ├── cashier/
    │   │   └── page.jsx
    │   ├── customer/
    │   │   └── [tableId]/
    │   │       └── page.jsx
    │   ├── layout.jsx
    │   └── page.jsx
    ├── components/
    │   ├── waiter/
    │   │   ├── TableGrid.jsx
    │   │   ├── TableCard.jsx
    │   │   ├── OrderPanel.jsx
    │   │   └── MenuSelector.jsx
    │   ├── kitchen/
    │   │   ├── OrderQueue.jsx
    │   │   └── OrderCard.jsx
    │   ├── cashier/
    │   │   ├── ActiveTables.jsx
    │   │   ├── BillModal.jsx
    │   │   └── RevenueCard.jsx
    │   ├── customer/
    │   │   ├── MenuDisplay.jsx
    │   │   └── OrderSummary.jsx
    │   └── shared/
    │       ├── Navbar.jsx
    │       ├── StatusBadge.jsx
    │       └── RealTimeNotification.jsx
    ├── lib/
    │   ├── socket.js
    │   ├── api.js
    │   └── auth.js
    ├── hooks/
    │   ├── useSocket.js
    │   └── useAuth.js
    └── package.json
```

---

## Database Schema (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(WAITER)
  createdAt DateTime @default(now())
  orders    Order[]
}

enum Role {
  ADMIN
  WAITER
  KITCHEN
  CASHIER
}

model Table {
  id        Int         @id @default(autoincrement())
  number    Int         @unique
  status    TableStatus @default(AVAILABLE)
  orders    Order[]
  bills     Bill[]
}

enum TableStatus {
  AVAILABLE
  ORDERING
  PREPARING
  READY
  SERVED
  BILLING
}

model MenuItem {
  id          Int         @id @default(autoincrement())
  name        String
  category    String
  price       Float
  description String?
  isAvailable Boolean     @default(true)
  orderItems  OrderItem[]
}

model Order {
  id         Int         @id @default(autoincrement())
  tableId    Int
  waiterId   Int
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  table      Table       @relation(fields: [tableId], references: [id])
  waiter     User        @relation(fields: [waiterId], references: [id])
  orderItems OrderItem[]
  bill       Bill?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  SERVED
  BILLED
  PAID
}

model OrderItem {
  id         Int        @id @default(autoincrement())
  orderId    Int
  menuItemId Int
  quantity   Int        @default(1)
  status     ItemStatus @default(PENDING)
  order      Order      @relation(fields: [orderId], references: [id])
  menuItem   MenuItem   @relation(fields: [menuItemId], references: [id])
}

enum ItemStatus {
  PENDING
  PREPARING
  DONE
}

model Bill {
  id          Int         @id @default(autoincrement())
  orderId     Int         @unique
  tableId     Int
  totalAmount Float
  status      BillStatus  @default(UNPAID)
  createdAt   DateTime    @default(now())
  order       Order       @relation(fields: [orderId], references: [id])
  table       Table       @relation(fields: [tableId], references: [id])
  payment     Payment?
}

enum BillStatus {
  UNPAID
  PAID
}

model Payment {
  id        Int           @id @default(autoincrement())
  billId    Int           @unique
  amount    Float
  method    PaymentMethod @default(CASH)
  paidAt    DateTime      @default(now())
  bill      Bill          @relation(fields: [billId], references: [id])
}

enum PaymentMethod {
  CASH
  CARD
  UPI
}
```

---

## Seed Data

```js
// backend/prisma/seed.js
// Seed the following:

// Users:
// 1. Admin/Cashier — email: admin@restaurant.com, password: admin123, role: CASHIER
// 2. Waiter 1 — email: waiter1@restaurant.com, password: waiter123, role: WAITER
// 3. Waiter 2 — email: waiter2@restaurant.com, password: waiter123, role: WAITER
// 4. Kitchen — email: kitchen@restaurant.com, password: kitchen123, role: KITCHEN

// Tables: Create 10 tables numbered 1 to 10, all AVAILABLE

// Menu Items (at least 15 items across categories):
// Starters: Veg Spring Roll (₹120), Paneer Tikka (₹180), Chicken Wings (₹220)
// Mains: Dal Makhani (₹160), Butter Chicken (₹280), Paneer Butter Masala (₹220), Biryani (₹260), Fried Rice (₹180)
// Breads: Naan (₹40), Roti (₹30), Garlic Naan (₹60)
// Beverages: Lassi (₹80), Cold Coffee (₹100), Fresh Lime Soda (₹70), Masala Chai (₹40)
```

---

## Backend Implementation

### server.js
```
- Express app
- CORS enabled for frontend URL
- JSON body parser
- Mount routes: /api/auth, /api/tables, /api/orders, /api/menu, /api/bills
- HTTP server wrapped with Socket.IO
- Import and initialize socketHandler
- Listen on PORT 5000
```

### authMiddleware.js
```
- Extract Bearer token from Authorization header
- Verify JWT with secret
- Attach decoded user to req.user
- Return 401 if invalid or missing
```

### roleMiddleware.js
```
- Factory function: requireRole(...roles)
- Check req.user.role against allowed roles
- Return 403 if not authorized
```

### authController.js
```
POST /api/auth/login
- Find user by email
- Compare password with bcrypt
- Return JWT token + user info (id, name, role)

POST /api/auth/register (admin only in production, open for dev)
- Hash password
- Create user with given role
```

### tableController.js
```
GET /api/tables — get all 10 tables with current status
GET /api/tables/:id — get single table with active order
PATCH /api/tables/:id/status — update table status, emit socket event
```

### menuController.js
```
GET /api/menu — get all available menu items
GET /api/menu/category/:category — filter by category
```

### orderController.js
```
POST /api/orders — create new order for a table
  - Create order with status PENDING
  - Create order items
  - Update table status to ORDERING
  - Emit socket: 'new_order' to all clients

GET /api/orders/table/:tableId — get active order for table

PATCH /api/orders/:id/status — update order status
  - Emit socket: 'order_status_update'

POST /api/orders/:id/items — add items to existing order
  - Emit socket: 'order_updated'

PATCH /api/orders/:id/items/:itemId — update item quantity or status

DELETE /api/orders/:id/items/:itemId — remove item from order
```

### billController.js
```
POST /api/bills/generate/:orderId
  - Calculate total from order items + prices
  - Create Bill record
  - Update order status to BILLED
  - Update table status to BILLING
  - Emit socket: 'bill_generated'

POST /api/bills/:id/pay
  - Create Payment record
  - Update bill status to PAID
  - Update order status to PAID
  - Update table status to AVAILABLE
  - Emit socket: 'payment_done'

GET /api/bills/revenue/today — sum of all paid bills today
```

### socketHandler.js
```
- On connection, log connected user
- Handle events:
  - 'join_role' — client joins a room by role (waiter, kitchen, cashier)
  - 'new_order' — broadcast to kitchen and cashier rooms
  - 'order_updated' — broadcast to kitchen and cashier rooms
  - 'order_status_update' — broadcast to waiter and cashier rooms
  - 'bill_generated' — broadcast to waiter room
  - 'payment_done' — broadcast to all rooms
- On disconnect, log
```

---

## Frontend Implementation

### Design System
```
Theme: Dark minimal — near-black backgrounds, sharp accent colors per role
- Waiter: Amber/Orange accent (#F59E0B)
- Kitchen: Red/Rose accent (#F43F5E)
- Cashier: Emerald/Green accent (#10B981)
- Customer: Blue accent (#3B82F6)

Font: Use Google Fonts
- Display: 'Syne' or 'Space Grotesk'
- Body: 'DM Sans' or 'Inter'

Background: #0A0A0A (near black)
Card: #111111
Border: #1F1F1F
Text primary: #FAFAFA
Text muted: #6B7280
```

### lib/socket.js
```
- Create Socket.IO client instance
- Connect to backend URL
- Export socket singleton
```

### lib/api.js
```
- Axios instance with baseURL = backend URL
- Request interceptor: attach JWT from localStorage
- Response interceptor: handle 401 (redirect to login)
```

### hooks/useSocket.js
```
- Connect to socket on mount
- Join room by user role
- Listen for events passed as parameter
- Return latest event data
- Disconnect on unmount
```

### Login Page (app/(auth)/login/page.jsx)
```
- Dark minimal login card, centered
- Email + Password fields
- Login button
- On success: save token + user to localStorage
- Redirect based on role:
  WAITER → /waiter
  KITCHEN → /kitchen
  CASHIER → /cashier
```

---

## Waiter Dashboard

### TableGrid.jsx
```
- 10 table cards in a responsive grid (2 cols mobile, 3-4 cols desktop)
- Each card shows: Table Number, Status badge, active order count
- Color coding:
  AVAILABLE → dark card, green dot
  ORDERING → amber glow
  PREPARING → orange pulse animation
  READY → green pulse (food is ready, serve now)
  SERVED → muted blue
  BILLING → yellow
- Click table → open OrderPanel for that table
```

### OrderPanel.jsx
```
- Slide-in panel or modal
- Shows current order items for the table
- Add items button → opens MenuSelector
- Each item: name, quantity controls (+/-), remove button
- Send to Kitchen button (only if items exist)
- Mark as Served button (only if status is READY)
- Real-time updates via socket
```

### MenuSelector.jsx
```
- Searchable menu list
- Filter by category tabs
- Each item: name, price, Add button
- Selected items shown with quantity
- Confirm button adds to order
```

---

## Kitchen Dashboard

### OrderQueue.jsx
```
- Real-time feed of all active orders
- Each order card shows:
  - Table number
  - Items list with quantities
  - Time since order placed (live timer)
  - Status: PENDING / PREPARING
- Actions:
  - "Start Preparing" → updates status to PREPARING, emits socket
  - "Mark Ready" → updates status to READY, emits socket
  - Card disappears when order is SERVED
- New orders animate in from top (Framer Motion)
- Sound notification or visual flash on new order
```

---

## Cashier Dashboard

### ActiveTables.jsx
```
- Overview of all 10 tables
- Status of each table
- Click table → see order details
```

### BillModal.jsx
```
- Shows itemized bill
- Total calculation
- Payment method selector: Cash / Card / UPI
- Confirm Payment button
- On payment: table resets to AVAILABLE, emits socket
```

### RevenueCard.jsx
```
- Today's total revenue
- Number of orders completed
- Updates in real-time as payments come in
```

---

## Customer Page (app/customer/[tableId]/page.jsx)

```
- QR accessible page — no login required
- Shows table number prominently
- Full menu with categories
- Add to cart functionality
- Place Order button → POST /api/orders (with tableId)
- Order confirmation screen
- Live order status tracker
```

---

## Real-Time Event Flow (implement exactly)

```
1. Waiter places order:
   - POST /api/orders
   - Server emits 'new_order' to kitchen + cashier rooms
   - Kitchen sees new card appear
   - Cashier sees table status update

2. Kitchen starts preparing:
   - PATCH /api/orders/:id/status { status: 'PREPARING' }
   - Server emits 'order_status_update' to waiter + cashier
   - Waiter sees table card glow change

3. Kitchen marks ready:
   - PATCH /api/orders/:id/status { status: 'READY' }
   - Server emits 'order_status_update' to waiter + cashier
   - Waiter gets visual alert — food ready for table X

4. Waiter marks served:
   - PATCH /api/orders/:id/status { status: 'SERVED' }
   - Server emits 'order_status_update' to cashier
   - Kitchen card disappears

5. Cashier generates bill:
   - POST /api/bills/generate/:orderId
   - Server emits 'bill_generated' to waiter
   - Table status → BILLING

6. Cashier processes payment:
   - POST /api/bills/:id/pay
   - Server emits 'payment_done' to all
   - Table resets to AVAILABLE everywhere
```

---

## Environment Variables

### backend/.env
```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/restaurant_db"
JWT_SECRET="restaurant_jwt_secret_key_2024"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

---

## Build Order (follow strictly)

### Phase 1 — Backend Foundation
1. Initialize Node.js project in `/backend`
2. Install dependencies: express, prisma, @prisma/client, mysql2, jsonwebtoken, bcryptjs, socket.io, cors, dotenv
3. Create prisma schema (exact schema above)
4. Run `npx prisma migrate dev --name init`
5. Run seed file
6. Build auth system (register + login)
7. Test auth with a REST client

### Phase 2 — Core Backend APIs
1. Build all controllers and routes
2. Build socketHandler
3. Test each endpoint
4. Verify socket events fire correctly

### Phase 3 — Frontend Foundation
1. Initialize Next.js 14 project in `/frontend` with App Router + Tailwind
2. Install: shadcn/ui, framer-motion, socket.io-client, axios
3. Set up design tokens in tailwind.config.js and globals.css
4. Build login page
5. Build useAuth hook and route protection

### Phase 4 — Waiter Dashboard
1. TableGrid with 10 cards
2. OrderPanel slide-in
3. MenuSelector
4. Wire to backend APIs
5. Wire socket events

### Phase 5 — Kitchen Dashboard
1. OrderQueue with live feed
2. Order cards with timers
3. Status update actions
4. Socket integration

### Phase 6 — Cashier Dashboard
1. ActiveTables overview
2. BillModal with payment
3. RevenueCard
4. Socket integration

### Phase 7 — Customer QR Page
1. Public menu page by tableId
2. Cart and order placement
3. Live status tracker

### Phase 8 — Polish
1. Loading states everywhere
2. Error handling and toasts
3. Responsive mobile layout
4. Framer Motion animations on all major interactions
5. Empty states for each dashboard

---

## Key Implementation Rules

1. **Always emit socket events after every DB mutation** — never skip this
2. **JWT must be verified on every protected route** — no exceptions
3. **Prisma transactions** — use `prisma.$transaction` when updating multiple tables at once (e.g., create order + update table status)
4. **Error responses** — always return `{ success: false, message: "..." }` with correct HTTP status
5. **Success responses** — always return `{ success: true, data: ... }`
6. **Frontend socket** — reconnect automatically if disconnected
7. **Role guards** — each dashboard page checks role on load, redirects to login if wrong role
8. **No hardcoded URLs** — always use env variables

---

## Start Command

After full build, the app should run with:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Login as waiter: waiter1@restaurant.com / waiter123
- Login as kitchen: kitchen@restaurant.com / kitchen123
- Login as cashier: admin@restaurant.com / admin123
- Customer QR: http://localhost:3000/customer/1 (table 1)

---

## Done ✓

When all phases are complete, the system should:
- Allow waiter to manage 10 tables and place orders
- Show kitchen a live queue that updates in real-time
- Allow cashier to generate bills and process payments
- Allow customers to order via QR link
- All four views stay in sync within under 1 second via Socket.IO
