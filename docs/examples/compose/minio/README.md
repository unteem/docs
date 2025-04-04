# Deploy Minio with docker compose

## Installation
> \[!NOTE\]
> This step is optional if you already have an S3 compatible Object Storage.

> \[!CAUTION\]
> We provide those instructions as an example, it should not be run in production. For extended development or production environments, deploy MinIO [in a Multi-Node Multi-Drive (Distributed)](https://min.io/docs/minio/linux/operations/install-deploy-manage/deploy-minio-multi-node-multi-drive.html#minio-mnmd) topology

### Step 1: Prepare your working environment:
```bash
mkdir minio
curl -o compose.yaml https://github.com/unteem/docs/blob/compose-production/docs/examples/compose/minio/compose.yaml
```
### Step 2:. Update compose file with your own values

```yaml
version: '3'
services:
  minio:
   ...
    environment:
    - MINIO_ROOT_USER=<Set minio root username>
    - MINIO_ROOT_PASSWORD=<Set minio root password>
```
### Step 3: Expose minio instance on https

To access your minio instance, it needs to be exposed on a domain with SSL termination. You can use our [example](../nginx-proxy/README.md) with an nginx proxy and Let's Encrypt companion for automated creation/renewal of Let's Encrypt certificates using [acme.sh](http://acme.sh).

If following our example, uncomment this section in compose file and update it with your values.
```yaml
version: '3'
services:
   docs:
   ...
  minio:
   ...
    environment:
   ...
    # - VIRTUAL_HOST=https://id.example.org # used by nginx proxy 
    # - VIRTUAL_PORT=8080 # used by nginx proxy
    # - LETSENCRYPT_HOST=https://id.example.org # used by lets encrypt to generate TLS certificate
```

### Step 4: Start the service
```bash
`docker-compose up -d`
```

Your minio instance is now available on https://doc.example.org

## Creating a User and Bucket for your Docs instance

### Installing mc

Follow the [official documentation](https://min.io/docs/minio/linux/reference/minio-mc.html#install-mc) to install mc

### Step 1: Configure `mc` to Connect to Your MinIO Server

```shellscript
mc alias set minio <MINIO_SERVER_URL> <MINIO_ACCESS_KEY> <MINIO_SECRET_KEY>
```

*   Replace `<MINIO_SERVER_URL>` with the URL of your MinIO server (e.g., `http://localhost:9000`)
*   Replace `<MINIO_ACCESS_KEY>` and `<MINIO_SECRET_KEY>` with your MinIO access key and secret key, respectively

### Step 2: Create a New Bucket with Versioning Enabled

```shellscript
mc mb --versioning minio/your-bucket-name
```

*   Replace `your-bucket-name` with the desired name for your bucket

### Step 3: Create a New User with Read-Write Access to the Bucket

```shellscript
mc admin user add minio your-username your-password
mc admin policy attach minio readwrite --user your-username your-bucket-name
```

*   Replace `your-username` and `your-password` with the desired username and password for the new user
*   Replace `rw-your-bucket-policy` with a suitable name for the policy
*   Replace `your-bucket-name` with the the bucket you created in Step 2

### Additional Notes

*   To enable or disable versioning on an existing bucket, use the following commands:

```shellscript
mc versioning enable minio/your-bucket-name
mc versioning disable minio/your-bucket-name
```

*   To list all policies, use the following command:

```shellscript
mc admin policy list minio
```

*   To list all users, use the following command:

```shellscript
mc admin user list minio
```
