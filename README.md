# Odoo-Spit

A full-stack inventory and supply-chain management application (backend API + React frontend) built with Node.js, Express, MongoDB, and a modern React + TypeScript Vite frontend.

**Repository layout**
- `backend/` : Express API, MongoDB (Mongoose) models, authentication, file uploads (Cloudinary).
- `frontend/`: Vite + React + TypeScript single-page app (Tailwind CSS, shadcn UI primitives).

**Quick Links**
- Backend entry: `backend/src/index.js`
- Frontend entry: `frontend/src/main.tsx`

**Project goals**
- Manage products, warehouses, receipts, deliveries, transfers and stock adjustments.
- Provide user authentication (JWT) and media uploads via Cloudinary.
- Offer dashboards and supply-chain optimization views in the frontend.

**Features**
- User authentication (access & refresh tokens)
- Product & category management
- Warehouse & location management
- Receipts, deliveries, transfers, and stock adjustments
- Inventory dashboard and movement history
- Image uploads (Cloudinary)
- Supply chain optimization UI

**Tech stack**
- Backend: `Node.js`, `Express`, `Mongoose` (MongoDB), `JWT` for auth, `multer` for uploads
- Frontend: `React` + `TypeScript`, `Vite`, `Tailwind CSS`, `react-router-dom`, `@tanstack/react-query`
- Media: `Cloudinary` for image handling

**Environment / Requirements**
- Node.js (recommended v18+)
- npm (or yarn)
- MongoDB instance (local or remote)
- (Optional) Cloudinary account for image uploads

**Important environment variables**
Create a `.env` file in `backend/` with the following keys (example values shown):

```
# Backend - backend/.env
PORT=8000
MONGO_URI=mongodb://localhost:27017
DB_NAME=odoo-spit
CORS_ORIGIN=http://localhost:5173

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUNDNAME=your_cloud_name   # note: project uses this exact key name
CLOUDINARY_APIKEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Notes:
- The backend code expects `CLOUDINARY_CLOUNDNAME` (there is a small typo in the key name in the code). Keep that name or update the code to `CLOUDINARY_CLOUDNAME` consistently.
- `CORS_ORIGIN` should point to your frontend host during development (for example `http://localhost:5173`).

Frontend environment variables (optional):
- If you want to configure API base URL in the frontend, add a Vite env variable like `VITE_API_URL` and reference it with `import.meta.env.VITE_API_URL` in `frontend` code.

**Development - quick start**
1. Install dependencies

```bash
# from project root
cd backend
npm install

cd ../frontend
npm install
```

2. Start development servers (run both in separate terminals)

```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

Backend dev script uses `nodemon src/index.js` (see `backend/package.json`). The server will try to listen on `process.env.PORT` or default to `8000`.

**Build & Preview (production-like)**
- Frontend

```bash
cd frontend
npm run build
npm run preview
```

- Backend

For production you can run the built Node server directly (ensure `NODE_ENV=production` and environment variables are set), e.g. use a process manager like `pm2` or a container.

**Database**
- The project uses MongoDB via Mongoose. The connection string used by the backend is constructed as `${MONGO_URI}/${DB_NAME}`. Ensure your `MONGO_URI` is reachable and `DB_NAME` is set (default in code: `odoo-spit`).

**API overview**
The backend exposes REST endpoints mounted in `backend/src/app.js`:

- `POST /api/users` and various `/api/users/*` routes — user auth and profile
- `GET/POST /api/categories` — category management
- `GET/POST /api/warehouses` — warehouse management
- `GET/POST /api/products` — product management
- `GET/POST /api/receipts` — receipts
- `GET/POST /api/deliveries` — deliveries
- `GET/POST /api/transfers` — transfers
- `GET/POST /api/adjustments` — stock adjustments
- `GET /api/dashboard` — inventory dashboard

Refer to the router files in `backend/src/routes/` for exact HTTP methods and payload expectations.

**Authentication**
- JWT-based authentication using access and refresh tokens. See `backend/src/middlewares/auth.middleware.js` for the `verifyJWT` middleware.

**File uploads**
- Image uploads are handled via Cloudinary in `backend/src/utils/cloudinary.js`.

**Testing & Linting**
- The frontend includes an `eslint` script (`npm run lint`). Add test suites as needed.

**Docker & Deployment (suggestions)**
- To containerize:
  - Build the frontend (`npm run build`) and serve the static files from a simple web server or reverse-proxy behind Nginx.
  - Run the backend in a separate container with environment variables injected.
%- Use `docker-compose` to orchestrate services (frontend static server, backend, and MongoDB).

**CI/CD recommendations**
- Add a pipeline to install dependencies, run linters, build the frontend, run backend static checks, and optionally run tests. Deploy artifacts to your chosen host (Vercel/Netlify for frontend; Azure/AWS/GCP/DigitalOcean or container registry + orchestration for backend).

**Contributing**
- Fork the repo, create a feature branch, open a PR with a clear description and tests for substantial changes.

**License**
- This repository does not include an explicit license. Add a `LICENSE` file (for example MIT) if you want to make the project open-source.

**Acknowledgements**
- Built with common OSS tooling: Express, React, Vite, Tailwind, Mongoose, Cloudinary.

---
If you'd like, I can also:
- generate a `backend/.env.example` file with the keys above,
- add a `docker-compose.yml` for local dev, or
- create a Postman collection / OpenAPI spec for the backend endpoints.

Tell me which of these you'd like next.
