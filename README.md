# Mktraders — Binary Trading Demo Platform

# Binary Trading — Demo Full Site

## Quick start (dev)

1. Copy server/.env.example to server/.env and set `JWT_SECRET` (and BROKER_API_TOKEN if you have one).
2. From repo root run:

```bash
docker-compose up --build
```

3. Wait for server (4000) and client (3000) to start. Open http://localhost:3000

4. Register a user, go to Dashboard, and use the Trade widget. Prices come from broker sandbox ticks (if available).

## Notes
- This is a **development** demo. Replace the KYC stub, strengthen authentication, move secrets to vault, and get legal/regulatory clearance before any real-money usage.
- Use `npx prisma studio --schema=server/prisma/schema.prisma` to inspect the SQLite DB during development.


## GitHub-ready notes

This repository is prepared for a GitHub initial commit. After unzipping locally:

```bash
git init
git branch -M main
git remote add origin <your-github-repo-url>
git add .
git commit -m "Initial commit — Mktraders"
git push -u origin main
```

Make sure to configure repository secrets in GitHub (for CI / deployment) rather than committing `.env` files.


## GitHub Actions CI/CD (ECS)

This repo includes a GitHub Actions workflow at `.github/workflows/ci-cd-ecs.yml`
that builds Docker images for the server and client, pushes them to Amazon ECR,
renders ECS task definitions, and deploys services on ECS/Fargate.

### Required GitHub repository secrets (Settings → Secrets → Actions)
- `AWS_ACCESS_KEY_ID` — IAM user/role with ECR & ECS permissions
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` — e.g. us-east-1
- `ECR_REGISTRY` — e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com
- `ECR_REPOSITORY_SERVER` — ECR repo name for server (e.g. mktraders-server)
- `ECR_REPOSITORY_CLIENT` — ECR repo name for client (e.g. mktraders-client)
- `CONTAINER_NAME_SERVER` — container name in task def (e.g. mktraders-server)
- `CONTAINER_NAME_CLIENT` — container name in task def (e.g. mktraders-client)
- `ECS_CLUSTER` — ECS cluster name
- `ECS_SERVICE_SERVER` — ECS service name (server)
- `ECS_SERVICE_CLIENT` — ECS service name (client)

Also make sure to set the `executionRoleArn` and `taskRoleArn` placeholders in the
`server/ecs-task-def.json` and `client/ecs-task-def.json` with correct ARNs.
