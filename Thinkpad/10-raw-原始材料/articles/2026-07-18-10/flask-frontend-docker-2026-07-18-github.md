---
title: "flask-frontend-docker"
created: 2026-07-18
updated: 2026-07-18
type: summary
tags: [ai, tool, github]
owner: 沈超
agent: 小马(架构师)
confidence: medium
cron-batch: "2026-07-18-000685"
cron-counter: 427
source-platform: github
source-url: "https://github.com/tiangolo/flask-frontend-docker"
---

agent: 小马(架构师)
owner: 沈超

# flask-frontend-docker

## 来源元数据

- 平台: github
- URL: https://github.com/tiangolo/flask-frontend-docker
- 查询: frontend Vue React
- Stars: 130
- Language: Vue
- Topics: (无)

## 仓库简介

Minimal project generator with a Flask backend, a modern frontend (Vue, React or Angular), a Traefik load balancer with HTTPS, all based on Docker.

## README 摘录(前 1500 字符)

🚨 DEPRECATION WARNING 🚨

I'm currently not actively using this generator for any project.

You might still find some internal pieces of code useful for your own use cases, but I won't be able to fix bugs and add features.

If you are starting a new project from scratch, check the alternatives at the FastAPI docs: Project Generation.

You are still free to use this project if you want to, you might still find some internal pieces of code useful for your own use case. And if you already have a project generated with it that's fine as well (and you probably already updated it to suit your needs).

Flask Frontend Docker - project generator

[](https://travis-ci.org/tiangolo/flask-frontend-docker)

Generate stack with a a Flask backend and a modern (Vue.js, React, Angular) frontend.

Each in its own container, with routes handled by a Traefik proxy.

With automatic HTTPS certificate generation using Let's Encrypt.

Features

* Full Docker integration (Docker based)
* Docker Swarm Mode deployment
* Docker Compose integration and optimization for local development
* Production ready Python web server using Nginx and uWSGI
* Python Flask backend:
    * CORS already configured, to be used by the frontend.
* Vue frontend
    * Easily updated to be Angular or React.
    * Docker server based on Nginx (configured to play nicely with Vue-router)
    * Docker multi-stage building, so you don't need to save or commit compiled code
    * Easily enable frontend tests at build time
* Load ba

