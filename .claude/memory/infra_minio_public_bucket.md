---
name: MinIO bucket must be public read
description: The 'curiosity' MinIO bucket must have anonymous download policy — images are served directly to the browser
type: project
originSessionId: b2030c1c-d7fc-4c0b-b02d-7b69c3d1854c
---
The MinIO `curiosity` bucket must have `anonymous set download` policy. Without it, every `<img src="http://localhost:9000/curiosity/...">` gets a 403 in the browser.

The `docker-compose.yaml` `createbuckets` service now handles this automatically: `mc mb --ignore-existing local/curiosity` + `mc anonymous set download local/curiosity`.

**Why:** Store images and any future media assets are public-facing — the browser loads them directly from MinIO (locally) or from Cloudflare R2 (production). There is no auth proxy in front of media.

**How to apply:** When adding new MinIO buckets (e.g. for user avatars, catalogues), always set `anonymous download` policy in the `createbuckets` entrypoint. When migrating to Cloudflare R2 in production, configure the bucket as public or use a Workers route for public delivery — same principle.
