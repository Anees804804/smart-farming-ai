---
title: Smart Farming AI Server
emoji: 🚜
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Smart Farming AI Server

This Hugging Face Space runs the backend API for the Smart Farming AI project.

## How this relates to the main project

This Dockerfile is a deployment variant of the real backend in the project root under `server/`.
It does not duplicate the application code by hand. It builds using the repository root as the Docker build context, then copies the actual files from the real `server/` folder into the image.

For a monorepo-style build from the project root, use:

```bash
docker build -f deploy/hf-server/Dockerfile .
```

That keeps the deploy configuration in this folder while still using the source from the real `server/` directory.

## If you create a standalone Space repo

A Hugging Face Space repo usually contains only the files needed for that app. In that case, the Space repo must include the actual backend source tree at the root level, for example:

```text
my-space-repo/
├── Dockerfile
├── package.json
├── src/
├── ...
```

In other words, the Space repo should contain the backend app itself, not a relative path like `../server` outside the build context. Docker build contexts cannot copy from parent folders.
