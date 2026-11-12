# Deployment Guide — L5 Spare Parts Inventory (Track SE)

## 1. Requirements

- Git 2.30 or newer.
- Docker Desktop 4.25 or newer, with Docker Compose v2 running.
- About 2 GB of free disk space.
- Host ports `3000` and `5173` must be available.
- Node.js and PostgreSQL do not need to be installed on the host for the Docker method.

## 2. Setup steps

1. Clone the repository and open its root directory.
2. Create the runtime configuration file.

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead.

3. Build and start the complete prototype.

   ```bash
   docker compose up -d --build
   ```

The first build downloads images and dependencies. PostgreSQL, the seed task, the API, and the React frontend start automatically. No additional migration or seed command is required.

## 3. Environment variables

| Name | Meaning | Sample value | Required |
| --- | --- | --- | --- |
| `DB_NAME` | PostgreSQL database name. | `mekong_l5` | Yes |
| `DB_USER` | PostgreSQL application user. | `app_user` | Yes |
| `DB_PASSWORD` | PostgreSQL password for the local prototype. Change it in a real deployment. | `doi_mat_khau_nay` | Yes |
| `API_PORT` | Host port mapped to the API container. | `3000` | Yes |
| `WEB_PORT` | Host port mapped to the frontend container. | `5173` | Yes |
| `PUBLIC_API_URL` | API URL compiled into the frontend image. | `http://localhost:3000` | Yes |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. | `http://localhost:5173,http://127.0.0.1:5173` | Yes |
| `LOG_LEVEL` | Minimum JSON log level. | `info` | No |
| `DB_POOL_MAX` | Maximum PostgreSQL connections used by the API. | `10` | No |

The `.env` file is local-only and must never be committed. The database port is intentionally not exposed to the host; containers communicate on the internal Compose network.

## 4. Sample data

On the first start of an empty Docker volume, the `seed` service loads the CSV files in `data/sample/` automatically. The expected data is:

- 6 service centres;
- 180 parts and 123 stock records;
- 95 warranty tickets;
- 200 stock transactions.

The web page is available at `http://localhost:5173`. Use **Centre Manager** for stock viewing and receiving, or **Technician** for issuing parts against a warranty ticket. These are prototype demo roles, not production accounts.

## 5. Verify it works

```bash
docker compose ps
```

Expected result: `db`, `api`, and `web` are `healthy`; `seed` has completed successfully with exit code `0`.

```bash
curl http://localhost:3000/health
```

Expected result: JSON containing `"status":"ok"` and `"db":"ok"`.

```bash
docker compose exec api npm run test:all
```

Expected result: all unit/API tests, PostgreSQL integration tests, and the repeatable-seed verification pass.

To verify that a second seed run does not duplicate data, run:

```bash
docker compose exec api npm run db:verify:repeatable
```

Expected result: a JSON log event named `dataset_seed_repeatability_verified`, with identical counts after the first and second seed runs.

Open `http://localhost:5173`, sign in with a demo role, and confirm that the inventory list contains sample parts.

### Troubleshooting

- If a host port is busy, change `API_PORT` or `WEB_PORT` in `.env`, then run `docker compose up -d --build` again.
- To recreate all Docker data from the sample CSV files, run `docker compose down -v` followed by `docker compose up -d --build`.
- For API logs, run `docker compose logs api --tail 50` and use the `request_id` in a returned error response.
