---
title: Smart Farming AI ML Service
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Smart Farming AI ML Service

This Hugging Face Space runs the disease-detection machine learning API for the Smart Farming AI project.

## How this relates to the main project

This Dockerfile is a deployment variant of the real ML service in the project root under `ml-service/`.
It uses the repo root as the Docker build context and copies the actual files from the real `ml-service/` folder, rather than duplicating the code manually.

For a monorepo-style build from the project root, use:

```bash
docker build -f deploy/hf-ml-service/Dockerfile .
```

## If you create a standalone Space repo

If this is pushed as its own Hugging Face Space repository, the repository must contain the ML service source tree itself at the root level, for example:

```text
my-ml-space/
├── Dockerfile
├── requirements.txt
├── app/
├── model_files/
└── ...
```

Docker cannot reach outside the build context, so you cannot reliably do a `COPY ../ml-service` in a normal Space build.
