## Security hardening added
- Helmet middleware for common headers
- express-rate-limit configured (15 min window, 200 reqs)
- Added Veriff KYC integration helpers (server/src/kyc-veriff.js)
- Added /api/kyc/start endpoint and /api/kyc/veriff/webhook to receive verification results
- WARNING: Webhook signature verification and payload validation must be implemented in production
- Secrets (VERIFF_API_KEY, VERIFF_BASE_URL) should be stored in a secret manager (AWS Secrets Manager / HashiCorp Vault)
