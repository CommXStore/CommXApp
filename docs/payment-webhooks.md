# Payment webhooks

This project exposes two webhook endpoints:

- `/api/webhooks/clerk` for Clerk billing (entitlements sync).
- `/api/webhooks/payments/{providerId}` for external payment providers.

## Generic payment webhook signature (our format)

The external payment webhook expects:

- Header: `x-webhook-signature`
- Value: `sha256=<hex_hmac_sha256(secret, rawBody)>`

Where `secret` is the `signingSecret` stored for the provider, and `rawBody` is
the exact request body string. If the signature is missing or invalid, the
request is rejected.

### Example signature generation (Node.js)

```js
import crypto from 'crypto'

const secret = process.env.PROVIDER_SECRET
const rawBody = JSON.stringify(payload)

const signature = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex')

// Send: x-webhook-signature: sha256=<signature>
```

## Stripe example (adapter)

Stripe signs payloads and sends the `Stripe-Signature` header along with a
signing secret (starts with `whsec_`). Stripe recommends verifying signatures
with their official library using the raw body and the `Stripe-Signature`
header.

If you want to keep using `/api/webhooks/payments/{providerId}`, create a small
adapter endpoint for Stripe that:

1. Verifies the Stripe signature.
2. Forwards the raw payload to `/api/webhooks/payments/{providerId}` with
   `x-webhook-signature` generated using the provider `signingSecret`.

## Pagar.me and Asaas (adapter template)

These providers use their own webhook signature headers. Create an adapter
endpoint per provider to:

1. Verify the provider-specific signature (using their official docs).
2. Forward the raw payload to `/api/webhooks/payments/{providerId}` with our
   `x-webhook-signature` format.

This keeps the core webhook endpoint consistent while letting you add as many
providers as needed.
