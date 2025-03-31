# Deploy Minio with docker compose
## Installation
> \[!NOTE\]
> This step is optional if you already have an S3 compatible Object Storage.

> \[!CAUTION\]
> We provide those instructions as an example, it should not be run in production. For extended development or production environments, deploy MinIO [in a Multi-Node Multi-Drive (Distributed)](https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-multi-node-multi-drive.html#minio-mnmd) topology

1. Copy Minio docker compose file:

```
curl -o compose.yaml https://github.com/suitenumerique/docs/tree/main/docs/examples/compose/minio/compose.yaml
```

2. Copy the environment variables file:

```
curl -o env https://github.com/suitenumerique/docs/tree/main/docs/examples/compose/minio/env
```

3. Edit `env` file and change the values with your own
1. Run the service with `docker-compose up -d`

## Configuration
Explain how to us mc client to create a user and a bucket for Docs. This user should have read write access on the bucket.

All the configuration files are in the directory `env.d/production`. You have to edit all the files to complete them. Explain