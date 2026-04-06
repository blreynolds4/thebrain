# 🧠 TheBrain

A personal knowledge base for saving thoughts, URLs, and tags with full-text search — built with SvelteKit, ElasticSearch, and Stripe.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose **or** [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Node.js 20+](https://nodejs.org/) (only needed for the manual setup path)
- A [Stripe](https://stripe.com) account (free test mode is fine)

---

## Option A — VS Code Dev Container (recommended)

This is the easiest path. The container brings up Node 20 and ElasticSearch automatically.

1. **Clone the repo and open it in VS Code:**

   ```bash
   git clone https://github.com/blreynolds4/thebrain.git
   cd thebrain
   code .
   ```

2. **Set your Stripe keys** in `.devcontainer/docker-compose.yml`:

   ```yaml
   environment:
     - STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
     - STRIPE_PRICE_ID=price_YOUR_PRICE_ID
     - STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

   See [Stripe setup](#stripe-setup) below for how to get these values.

3. **Reopen in Container** — VS Code will prompt you, or use the command palette:
   `Dev Containers: Reopen in Container`

   The `postCreateCommand` runs `npm install` automatically.

4. **Start the dev server** inside the container terminal:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Option B — Docker Compose + local Node

Use this if you don't want VS Code Dev Containers but still want a containerised ElasticSearch.

1. **Clone the repo:**

   ```bash
   git clone https://github.com/blreynolds4/thebrain.git
   cd thebrain
   ```

2. **Start ElasticSearch:**

   ```bash
   docker compose -f .devcontainer/docker-compose.yml up elasticsearch -d
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Create a `.env` file** in the project root with your configuration:

   ```dotenv
   ELASTICSEARCH_URL=http://localhost:9200
   JWT_SECRET=change-me-in-production
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
   STRIPE_PRICE_ID=price_YOUR_PRICE_ID
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

5. **Start the dev server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com) (use test mode — no real money needed).

2. **Get your secret key** from the [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys):
   - Copy the **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

3. **Create a monthly product and price**:
   - Go to [Dashboard → Product catalog → Add product](https://dashboard.stripe.com/test/products/create)
   - Name it (e.g. "TheBrain Pro"), set price to **$9 / month**, recurring
   - Copy the **Price ID** (`price_...`) → `STRIPE_PRICE_ID`

4. **Set up a local webhook** using the [Stripe CLI](https://stripe.com/docs/stripe-cli):

   ```bash
   # Install the CLI (macOS example)
   brew install stripe/stripe-cli/stripe

   # Log in
   stripe login

   # Forward webhook events to your local dev server
   stripe listen --forward-to localhost:5173/api/stripe/webhook
   ```

   The CLI prints a webhook signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

   > **Production**: Register the webhook endpoint `https://yourdomain.com/api/stripe/webhook`
   > in [Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks) and
   > subscribe to `customer.subscription.created`, `customer.subscription.updated`, and
   > `customer.subscription.deleted` events.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ELASTICSEARCH_URL` | Yes | ElasticSearch connection URL (e.g. `http://localhost:9200`) |
| `JWT_SECRET` | Yes (prod) | Secret used to sign auth cookies. Falls back to a random value in development. |
| `STRIPE_SECRET_KEY` | Yes (prod) | Stripe secret API key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_PRICE_ID` | Yes | Stripe Price ID for the monthly subscription plan |
| `STRIPE_WEBHOOK_SECRET` | Yes (prod) | Stripe webhook signing secret (`whsec_...`) |

---

## Available Scripts

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build production bundle
npm run preview      # Preview production build locally
npm run check        # Run svelte-check TypeScript validation
npm run check:watch  # Type-check in watch mode
```

---

## Project Structure

```
src/
├── app.css                        # Tailwind CSS v4 base import
├── app.html                       # HTML shell
├── lib/
│   ├── schemas.ts                 # Zod validation schemas
│   ├── types.ts                   # TypeScript interfaces
│   └── server/
│       ├── auth.ts                # JWT + bcrypt authentication
│       ├── elasticsearch.ts       # ES client and index setup
│       ├── stripe.ts              # Stripe client
│       └── thoughts.ts            # Thought CRUD + search
└── routes/
    ├── +layout.server.ts          # Auth + subscription guard
    ├── +layout.svelte             # Navigation shell
    ├── +page.server.ts            # Thoughts list + CRUD actions
    ├── +page.svelte               # Main thoughts UI
    ├── api/stripe/webhook/        # Stripe webhook handler
    ├── login/                     # Login + register
    ├── logout/                    # Cookie clear
    └── subscribe/                 # Stripe Checkout + success page
```
