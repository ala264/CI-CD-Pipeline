# E-Commerce CI/CD Pipeline
## Overview

The E-Commerce CI/CD Pipeline is a microservices-based project for automating the testing and deployment of a user service and product service. Both services were built with Node.js and Express, containerized with Docker, and deployed to Google Kubernetes Engine.

The project provided hands-on experience with automated testing, containerization, cloud deployment, Kubernetes, and CI/CD workflows.

## Technical Details

The backend services use PostgreSQL for persistent data storage and are tested with Jest and Supertest. Database credentials are supplied through environment variables and managed with GitHub and Kubernetes Secrets.

Each service has its own Docker image and Kubernetes Deployment. Both services run in separate namespaces within the same GKE cluster, with three Pod replicas configured for each service. LoadBalancer Services are used to expose the applications externally.

## CI/CD Pipeline

A push to the main branch triggers separate GitHub Actions workflows for the user and product services.

Each workflow:

- installs dependencies and runs the Jest test suite
- builds and tags a Docker image
- pushes the image to Docker Hub
- authenticates with Google Cloud
- connects to the GKE cluster with `kubectl`
- updates the Kubernetes Deployment to use the new image

If the tests fail, the deployment steps do not run.

## Architecture

The diagram below shows the technologies used in the project and the flow between the backend services, GitHub Actions, Docker, Google Kubernetes Engine, and PostgreSQL.

<p align="center">
  <img width="600" alt="E-Commerce CI/CD Architecture" src="https://github.com/user-attachments/assets/d99768d8-c300-441a-acee-0b8f66a13be1">
</p>

## Challenges

One challenge was configuring GitHub Actions to authenticate with Google Cloud and securely connect `kubectl` to the GKE cluster. This required several separate authentication and configuration steps to work together correctly.
