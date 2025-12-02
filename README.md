# Kutipage: Smart Email-to-Telegram Integration

![Project Architecture]((https://meet.google.com/sro-gveq-iiw))

## Overview
**This project** is a full-stack automated notification system that bridges **Gmail** and **Telegram**. It solves the problem of missing important emails by filtering incoming messages using AI and instantly forwarding alerts to your Telegram chat.
Instead of constantly checking your inbox, it notifies you only when it matters.

---

## Architecture
The application follows a **Microservices-based architecture** hosted on AWS.

* **Frontend Layer:** Built with **React.js** and hosted on **AWS S3** for fast, static content delivery.
* **Backend Layer:** Node.js microservices containerized with **Docker**, running on **AWS EC2**.
    * *Auth Service:* Handles JWT authentication (Middleware).
    * *Gmail Service:* Manages OAuth2, Pub/Sub webhooks, and email fetching.
    * *Telegram Service:* Manages bot interactions and push notifications.
    * *Login/Signup Service:* Manages user account.
* **Database Layer:** **MongoDB Atlas** for storing user credentials, OAuth tokens, and preferences.
* **AI Layer:** Integrates with **AWS SageMaker / AI Model** to classify emails (Important vs. Spam) before forwarding.

---

## Tech Stack

### Frontend
* **React.js (Vite):** Fast, modern UI.
* **React Router:** For seamless navigation.
* **CSS3:** Custom responsive styling.

### Backend
* **Node.js & Express:** Robust REST API.
* **Docker:** Containerization for consistent deployment.
* **Google Gmail API:** For watching inboxes and fetching messages.
* **Telegram Bot API:** For sending real-time alerts.

### Infrastructure & DevOps
* **AWS EC2:** Hosting backend containers.
* **AWS S3:** Hosting frontend static assets.
* **Ngrok:** For exposing local/EC2 ports to receive secure Webhooks (HTTPS).
* **CI/CD:** Github Actions (Optional/Planned).

---

## ⚙️ Prerequisites

Before running the project, ensure you have:
* Node.js (v18+)
* Docker & Docker Compose
* A Google Cloud Project with **Gmail API** enabled.
* A Telegram Bot Token (from @BotFather).
* MongoDB Atlas Connection String.

---
