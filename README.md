# neoRMS Management Service

## 1. Service Title
**neoRMS Management** (Frontend Service)

## 2. Purpose
This service provides the web management UI for restaurant operations in neoRMS. It is used by owner/admin/management roles to authenticate and manage restaurants, orders, menu items, inventory, staff, tables, analytics, and reviews.

## 3. Responsibilities
- Render authenticated management workflows and route protection.
- Handle owner/admin login and owner registration flows.
- Call backend APIs for management operations (CRUD and analytics views).
- Maintain client-side auth/session context (token, role, tenant, restaurant selection).
- Provide shared UI state (search, notifications) across admin pages.

## 4. Tech Stack
- **Runtime/Build:** Node.js, Vite
- **Frontend:** React 19, React Router 7
- **HTTP Client:** Axios
- **Styling/UI:** Tailwind CSS 4, Radix UI, Lucide React
- **Charts:** Recharts
- **Linting:** ESLint 9

## 5. Project Structure
```text
.
├── src/
│   ├── app/                     # Router + route protection
│   ├── hooks/                   # Reusable hooks (e.g., auth state)
│   ├── pages/                   # Feature pages (dashboard, orders, menu, etc.)
│   ├── services/                # API clients and browser storage utilities
│   │   └── restaurant/          # Restaurant-specific API wrapper
│   ├── shared/                  # Shared layout, navbar/sidebar, search, notifications
│   └── assets/                  # Static assets
├── index.html
├── vite.config.js               # Vite config + @ alias to src/
└── package.json
```

## 6. Setup / Installation
### Prerequisites
- Node.js 20+ (recommended)
- npm 10+

### Install
```bash
npm install
```

## 7. Configuration
Create a `.env` file in the repository root.

Required environment variables:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

### Notes
- `VITE_API_URL` is used by the shared Axios client in `src/services/api.js`.
- The app automatically attaches `Authorization: Bearer <token>` when `authToken` exists in localStorage.
- For tenant-scoped requests, `x-tenant-id` is attached when `tenantId` exists in localStorage.

## 8. Running the Service
### Development
```bash
npm run dev
```
Starts the Vite dev server (default: `http://localhost:5173`).

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 9. API / Interfaces
This service is a client/UI service and consumes HTTP APIs from backend services via `src/services/api.js`.

### Core integration behavior
- Base URL from `VITE_API_URL`
- Cookie support enabled (`withCredentials: true`)
- Automatic token refresh attempt on `401` via `POST /auth/refresh-token`

### Main consumed endpoint groups
- **Auth/User**
	- `POST /auth/login/management`
	- `POST /user/signup`
	- `GET /user/me`
	- `PATCH /user/:id`, `DELETE /user/:id`
- **Restaurant**
	- `GET /restaurant/my-restaurants`
	- `POST /restaurant`
	- `DELETE /restaurant/:id`
- **Orders**
	- `GET /order/restaurant-orders/:restaurantId`
- **Menu**
	- `POST /menuProduct/:restaurantId`
	- `GET /menuProduct/:restaurantId`
	- `GET /menuProduct/:restaurantId/:menuProductId`
	- `PATCH /menuProduct/:restaurantId/:menuProductId`
	- `DELETE /menuProduct/:restaurantId/:menuProductId`
- **Inventory**
	- `GET /inventory/restaurantInventory/:restaurantId`
	- `POST /inventory/restaurantInventory/:restaurantId`
	- `PATCH /inventory/restaurantInventory/:restaurantId/:restaurantInventoryId`
	- `DELETE /inventory/restaurantInventory/:restaurantId/:restaurantInventoryId`
	- `PATCH /inventory/restaurantInventory/:restaurantId/:restaurantInventoryId/add`
	- `PATCH /inventory/restaurantInventory/:restaurantId/:restaurantInventoryId/subtract`
- **Staff**
	- `GET /user/restaurant/:restaurantId/staff`
	- `POST /user/staff/waiter`
	- `POST /user/staff/manager`
	- `POST /user/staff/chef`
- **Tables**
	- `GET /table/:restaurantId`
	- `POST /table/:restaurantId`
	- `PATCH /table/:restaurantId/:tableId`
	- `DELETE /table/:restaurantId/:tableId`
- **Reviews/Analytics**
	- `GET /review/management/analyzer/:menuId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

## 13. Related Services
This service depends on backend APIs in the neoRMS ecosystem. It does not expose its own backend API.

- **Auth/User service(s):** authentication, profile, staff management
- **Restaurant service:** restaurant ownership and selection data
- **Order service:** order list and status data for dashboard/order pages
- **Menu service:** menu product lifecycle operations
- **Inventory service:** stock management and quantity adjustments
- **Table service:** dining table management
- **Review/Analytics service:** sentiment/review analysis for management insights

To run this service end-to-end locally, ensure the required backend API services are running and reachable via `VITE_API_URL`.
