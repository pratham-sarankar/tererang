# Tererang on Cloud Run

Project: `tererang`. Region: `asia-south1`. Service: `tererang`.

Live URL: https://tererang-213428076034.asia-south1.run.app

The initial release uses Razorpay **test** keys. Do not accept real online
payments until live keys are configured in a new backend secret version and
payment handling has been verified. SMTP authentication was verified without
sending email. Firebase authorizes the Cloud Run hostname for sign-in.

The Cloud Run service runs Nginx and Express together. Nginx receives HTTPS
traffic forwarded by Cloud Run on port 8080 and proxies `/backend/` to Express
on localhost:8081. Express has no separately published service URL.

`cloud-run.yaml` pins the tested images by digest. Update those digests for each
release and pin each secret to the intended numeric version before applying it.

Backend configuration (including the MongoDB URL, JWT secret, payment keys,
and SMTP credentials) is stored in `tererang-backend-env`. The Firebase key is
stored in `tererang-firebase-key`. These secrets are mounted only into the
backend container. The runtime identity is
`tererang-run@tererang.iam.gserviceaccount.com`, with access granted separately
on those two secrets. Never commit secret values or generated env files.

The frontend Firebase web configuration is public browser configuration. It is
provided to Docker as a BuildKit secret during the build; the values used by
Vite are necessarily included in the JavaScript bundle.

## Rebuild images

Use a unique image tag per release. Cloud Run requires the linux/amd64 image:

```sh
docker buildx build --platform linux/amd64 \
  --secret id=frontend_env,src=.env \
  -t asia-south1-docker.pkg.dev/tererang/tererang/frontend:RELEASE --push .
docker buildx build --platform linux/amd64 \
  -t asia-south1-docker.pkg.dev/tererang/tererang/backend:RELEASE --push backend
```

When changing frontend `.env`, add `--no-cache` to its build, because BuildKit
secret changes alone do not invalidate cached build layers.

Apply the manifest with `gcloud run services replace MANIFEST --project=tererang
--region=asia-south1`. Backend `.env` edits do not update Cloud Run automatically:
create a new Secret Manager version from the reviewed production configuration,
update its version in the manifest, and deploy a new revision. Preserve the
production JWT secret unless intentionally invalidating existing sessions.

The service permits at most three instances and scales to zero when idle. Cloud
Run, Artifact Registry, Secret Manager, and external database charges may apply.
The deployment uses the configured external MongoDB; it does not host MongoDB
or migrate its data. Configure backups and network access at the database host.

Admin credentials are stored separately in `tererang-admin-login`. The runtime
service account is not granted access to that secret. Authorized project admins
can retrieve it through Secret Manager; never include its value in logs or Git.
