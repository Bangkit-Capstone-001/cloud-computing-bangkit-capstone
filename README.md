# Cloud Computing C241-PS014

This repository contains the server-side code and database setup for the FitFirst application.

## Table of Content

- [Introduction](#introduction)
- [Environment](#environment)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Running The Server](#running-the-server)
- [API URL](#api-url)

## Introduction

FitFirst comes as a personal diet assistant mobile application with workout plan, diet plan, calories analysis, and tracker for workout and diet goals. FitFirst simplifies the process for users aiming to achieve goals such as weight loss or targeted body training. Additionally, FitFirst provides detailed calorie information for foods entered by users. Our goal is to help users easily adopt a healthy lifestyle through proper nutrition and exercise.

## Environment

FitFirst Backend runs with:

1. Hapi.js
2. GCP Cloud Run
3. GitHub Action
4. Firebase
5. Cloud Storage

## Configuration

.env

- Firebase API Key
  (You can get the key from Firebase Project Settings)

  ```
  API_KEY="your-api-key"
  AUTH_DOMAIN="your-auth-domain"
  PROJECT_ID="your-project-id"
  STORAGE_BUCKET="your-storage-bucket"
  MESSAGING_SENDER_ID="your-messaging-sender-id"
  APP_ID="your-app-id"
  MEASUREMENT_ID="your-measurement-id"
  ```

- Firebase Admin SDK key
  (You can get the key from Firebase Project Settings -> Service accounts -> Firebase Admin SDK -> Generate Key)

  ```
  TYPE="your-type"
  PROJECT_ID="your-project-id"
  PRIVATE_KEY_ID="your-private-key-id"
  PRIVATE_KEY="your-private-key"
  CLIENT_EMAIL="your-client-email"
  CLIENT_ID="your-client-id"
  AUTH_URI="your-auth-uri"
  TOKEN_URI="your-token-uri"
  AUTH_PROVIDER_X509_CERT_URL="your-auth-provider-cert-url"
  CLIENT_X509_CERT_URL="your-client-cert-url"
  UNIVERSE_DOMAIN="your-universe-domain"
  ```

## API Documentation

[FitFirst API Contract](https://fitfirst-api-contract.notion.site/FitFirst-API-Contract-8ca743cd651b4ff7afb9e72ad749375f?pvs=4)

## Running The Server

### Prerequisites

Before running the server, ensure you have the following installed:

1. Node.js (version 14.x or later)
2. npm (comes with Node.js)
3. Google Cloud SDK (for deploying to GCP Cloud Run)
4. Firebase CLI (for Firebase setup)

### Installation Steps

1. Clone the repository:

```
https://github.com/FitFirst/cloud-computing-bangkit-capstone.git
cd cloud-computing-bangkit-capstone/backend-api
```

2. Install dependencies:

```
npm install
```

3. Set up environment variables:

- Create a `.env` file in the root of the project and add the following variables with the corresponding values from your Firebase project settings:

  ```
  API_KEY="your-api-key"
  AUTH_DOMAIN="your-auth-domain"
  PROJECT_ID="your-project-id"
  STORAGE_BUCKET="your-storage-bucket"
  MESSAGING_SENDER_ID="your-messaging-sender-id"
  APP_ID="your-app-id"
  MEASUREMENT_ID="your-measurement-id"
  ```

- Add the Firebase Admin SDK credentials directly to the `.env `file:

  ```
  TYPE="your-type"
  PROJECT_ID="your-project-id"
  PRIVATE_KEY_ID="your-private-key-id"
  PRIVATE_KEY="your-private-key"
  CLIENT_EMAIL="your-client-email"
  CLIENT_ID="your-client-id"
  AUTH_URI="your-auth-uri"
  TOKEN_URI="your-token-uri"
  AUTH_PROVIDER_X509_CERT_URL="your-auth-provider-cert-url"
  CLIENT_X509_CERT_URL="your-client-cert-url"
  UNIVERSE_DOMAIN="your-universe-domain"
  ```

- Add additional environment variables:
  ```
  PORT=3000
  HOST=localhost
  ML_API_URL="your-ml-api-url"
  FLASK_API_URL="your-flask-api-url"
  ```

4. Create `.env.yaml` for deployment:
   Create a .env.yaml file in the root of the project, copying all variables from .env but using YAML format:

   ```yaml
   API_KEY: "your-api-key"
   AUTH_DOMAIN: "your-auth-domain"
   PROJECT_ID: "your-project-id"
   STORAGE_BUCKET: "your-storage-bucket"
   MESSAGING_SENDER_ID: "your-messaging-sender-id"
   APP_ID: "your-app-id"
   MEASUREMENT_ID: "your-measurement-id"
   PORT: 3000
   HOST: 0.0.0.0
   ML_API_URL: "your-ml-api-url"
   FLASK_API_URL: "your-flask-api-url"
   TYPE: "your-type"
   PROJECT_ID: "your-project-id"
   PRIVATE_KEY_ID: "your-private-key-id"
   PRIVATE_KEY: "your-private-key"
   CLIENT_EMAIL: "your-client-email"
   CLIENT_ID: "your-client-id"
   AUTH_URI: "your-auth-uri"
   TOKEN_URI: "your-token-uri"
   AUTH_PROVIDER_X509_CERT_URL: "your-auth-provider-cert-url"
   CLIENT_X509_CERT_URL: "your-client-cert-url"
   UNIVERSE_DOMAIN: "your-universe-domain"
   ```

### Running the Server Locally

To run the server locally, use the following command:

```
npm start
```

This will start the Hapi.js server on http://localhost:3000.

### Deploying to Google Cloud Run

1. Enable required Google Cloud services:

   ```
   gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com
   ```

2. Create an Artifact Registry repository:

   ```
   gcloud artifacts repositories create fitfirst-backend --repository-format=docker --location=asia-southeast2 --async
   ```

3. Build the Docker image:

   ```
   gcloud builds submit --tag asia-southeast2-docker.pkg.dev/[PROJECT_ID]/fitfirst-backend/fitfirst-backend
   ```

4. Deploy the container to Cloud Run:

   ```
   gcloud run deploy --env-vars-file .env.yaml  --image asia-southeast2-docker.pkg.dev/[PROJECT_ID]/fitfirst-backend/fitfirst-backend --port=3000
   ```

Follow the prompts to set the region and allow unauthenticated invocations.

## API URL

Once deployed, your API will be available at the URL provided by Google Cloud Run. Replace `[PROJECT_ID]` with your actual Google Cloud project ID in the following template:

`https://[SERVICE_NAME]-[REGION]-[PROJECT_ID].run.app`

EXAMPLE:
`https://fitfirst-backend-uc.a.run.app`

Ensure you replace `fitfirst-backend`, `uc`, and `project-id` with your actual service name, region, and project ID respectively.
