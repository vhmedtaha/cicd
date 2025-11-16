# Jenkins pipeline for this repositoryyy

This repo contains a sample `Jenkinsfile` that builds the project's Docker image (using the repository `Dockerfile`), optionally pushes it to a registry, and then deploys the container either locally on the Jenkins agent or to a remote host via SSH.

Usage

- Create a pipeline job in Jenkins and point it at this repository (branch: `main`).
- Configure any required credentials in Jenkins:
  - An SSH private key (optional) stored as a **Credentials > SSH Username with private key**, then provide its credentials id to the `SSH_CREDENTIALS_ID` parameter if you want Jenkins to perform remote deploys using `ssh-agent`.
- When you run the job you can set the pipeline parameters:
  - `DOCKER_IMAGE`: image name (e.g. `myregistry.example.com/myorg/myapp` or `vhmedtaha/cicd`)
  - `DOCKER_TAG`: image tag (defaults to `BUILD_NUMBER`)
  - `PUSH_TO_REGISTRY`: set true to `docker push` after build
  - `DEPLOY_HOST`: leave empty to run the container on the Jenkins agent; set to a hostname/IP to deploy remotely
  - `DEPLOY_USER`: SSH user for remote host
  - `SSH_CREDENTIALS_ID`: optional Jenkins credentials id for SSH (enables `ssh-agent` usage)

What the pipeline does

- Checks out the repo
- Builds the Docker image with `docker build` using the `Dockerfile` at repository root
- Optionally pushes the image to the registry if `PUSH_TO_REGISTRY` is true
- If `DEPLOY_HOST` is empty the pipeline stops any existing container named `cicd_app` on the agent and runs a new container listening on port 80
- If `DEPLOY_HOST` is provided the pipeline saves the image to a tarball, copies it to the remote host, loads it there and runs the container (requires Docker on the remote host and SSH access)

Notes & prerequisites

- Jenkins node that runs the pipeline must have Docker CLI installed and access to Docker daemon for local builds/runs.
- For remote deploys, the remote host must be reachable by SSH and have Docker installed.
- The `ssh-agent` plugin (or an alternate credentials approach) is recommended so Jenkins can use stored SSH keys; if not using `ssh-agent`, ensure the build agent can SSH to the remote host.
- Port mapping in the `Jenkinsfile` currently maps container port 80 to host port 80. Update the run command if you need different ports or additional options (volumes, env vars, etc.).

If you want, I can:
- Add a `deploy.sh` helper script for the remote host to standardize start/stop commands.
- Update the pipeline to support health checks, zero-downtime rolling deploys, or push to specific registries with authentication.
