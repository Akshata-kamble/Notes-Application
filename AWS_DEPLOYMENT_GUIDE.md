# AWS Deployment Guide for Notes Application

This document provides a step-by-step walkthrough to containerize and deploy your **Notes Application** to Amazon Web Services (AWS) using Docker.

---

## 1. Prerequisites
Before starting, ensure you have:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
- An [AWS Account](https://aws.amazon.com/).
- [AWS CLI](https://aws.amazon.com/cli/) configured with `aws configure`.

---

## 2. Container Strategy
We use a microservices approach:
1.  **Frontend**: Static files served by Nginx (Port 80).
2.  **Backend**: Node.js API (Port 5000).
3.  **Database**: MySQL 8.0 (Port 3306).

---

## 3. Local Preparation
Check your project files:
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml` (for local testing)

### Run Locally with Docker Compose
To verify everything works before pushing to AWS:
```bash
docker-compose up --build
```
Your frontend will be at `http://localhost`, talking to the backend at `http://localhost:5000`.

---

## 4. Pushing Images to AWS ECR
AWS ECR (Elastic Container Registry) is where we store our Docker images.

1.  **Create Repositories**:
    ```bash
    aws ecr create-repository --repository-name notes-backend
    aws ecr create-repository --repository-name notes-frontend
    ```

2.  **Authenticate Docker to ECR**:
    ```bash
    aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
    ```

3.  **Build and Tag Images**:
    ```bash
    # Backend
    docker build -t notes-backend ./backend
    docker tag notes-backend:latest <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/notes-backend:latest

    # Frontend
    docker build -t notes-frontend ./frontend
    docker tag notes-frontend:latest <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/notes-frontend:latest
    ```

4.  **Push Images**:
    ```bash
    docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/notes-backend:latest
    docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/notes-frontend:latest
    ```

---

## 5. Deployment Options on AWS

### Option A: AWS App Runner (Easiest)
Ideal for simple web apps.
1.  Go to the **App Runner** console.
2.  Create a Service.
3.  Source: **Container Registry**.
4.  Provider: **Amazon ECR**.
5.  Select `notes-backend` image.
6.  Set Port to `5000`.
7.  Repeat for `notes-frontend` (Port 80).

### Option B: AWS ECS (with Fargate)
Best for production and scalability.
1.  **Create a Cluster**: Use the "Networking only" (Fargate) template.
2.  **Task Definition**:
    -   Create a new Task Definition for Fargate.
    -   Add two containers: `backend` (using the ECR URI) and `frontend`.
    -   Define Environment Variables for the backend (`DB_HOST`, `DB_PASSWORD`, etc.).
3.  **Service**: Create a service from your Task Definition.

### Option C: AWS RDS (Recommended for Database)
Instead of running MySQL in a container, use **Amazon RDS**.
1.  Create a MySQL instance in RDS.
2.  Copy the **Endpoint** (e.g., `notes-db.xyz.us-east-1.rds.amazonaws.com`).
3.  Update your `DB_HOST` in the backend service to point to this endpoint.

---

## 6. Update Frontend API URL
Before deploying the final frontend, update `frontend/script.js` to point to your backend's **AWS Load Balancer URL** or **App Runner URL** instead of `localhost`.

```javascript
// frontend/script.js
const API_BASE_URL = 'https://your-aws-backend-url.com';
```
