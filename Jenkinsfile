pipeline {
  agent any
  parameters {
    string(name: 'DOCKER_IMAGE', defaultValue: 'vhmedtaha/cicd', description: 'Docker image name (optionally include registry)')
    string(name: 'DOCKER_TAG', defaultValue: "${env.BUILD_NUMBER}", description: 'Docker image tag')
    booleanParam(name: 'PUSH_TO_REGISTRY', defaultValue: false, description: 'Push built image to registry')
    string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Remote host to deploy to (leave empty to run locally on agent)')
    string(name: 'DEPLOY_USER', defaultValue: 'ubuntu', description: 'SSH user for remote deploy')
    string(name: 'SSH_CREDENTIALS_ID', defaultValue: '', description: 'Jenkins SSH credentials id (optional, for ssh-agent)')
  }

  environment {
    IMAGE = "${params.DOCKER_IMAGE}"
    TAG = "${params.DOCKER_TAG ?: 'latest'}"
    FULL_IMAGE = "${env.IMAGE}:${env.TAG}"
    CONTAINER_NAME = 'cicd_app'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          echo "Building Docker image ${env.FULL_IMAGE}"
          sh "docker build -t ${env.FULL_IMAGE} ."
        }
      }
    }

    stage('Push Image (optional)') {
      when {
        expression { return params.PUSH_TO_REGISTRY }
      }
      steps {
        script {
          echo "Pushing ${env.FULL_IMAGE} to registry"
          sh "docker push ${env.FULL_IMAGE}"
        }
      }
    }

    stage('Run / Deploy') {
      steps {
        script {
          if (!params.DEPLOY_HOST) {
            echo 'No DEPLOY_HOST set: deploying locally on this agent'
            // Stop & remove existing container if present, then run new one
            sh '''
            if [ $(docker ps -aq -f name=${CONTAINER_NAME} | wc -l) -gt 0 ]; then
              docker stop ${CONTAINER_NAME} || true
              docker rm ${CONTAINER_NAME} || true
            fi
            docker run -d --name ${CONTAINER_NAME} -p 80:80 ${FULL_IMAGE}
            '''
          } else {
            echo "DEPLOY_HOST set: deploying to ${params.DEPLOY_USER}@${params.DEPLOY_HOST}"
            // Create a tarball of the built image
            def tarName = "${env.IMAGE.replaceAll('/','_')}_${env.TAG}.tar.gz"
            sh "docker save ${env.FULL_IMAGE} | gzip > ${tarName}"

            // Use ssh-agent if credentials provided, otherwise rely on agent's SSH setup
            if (params.SSH_CREDENTIALS_ID?.trim()) {
              sshagent (credentials: [params.SSH_CREDENTIALS_ID]) {
                sh "scp -o StrictHostKeyChecking=no ${tarName} ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/tmp/"
                sh "ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} 'gunzip -c /tmp/${tarName} | docker load && docker stop ${CONTAINER_NAME} || true && docker rm ${CONTAINER_NAME} || true && docker run -d --name ${CONTAINER_NAME} -p 80:80 ${FULL_IMAGE}'"
              }
            } else {
              sh "scp -o StrictHostKeyChecking=no ${tarName} ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/tmp/"
              sh "ssh -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} 'gunzip -c /tmp/${tarName} | docker load && docker stop ${CONTAINER_NAME} || true && docker rm ${CONTAINER_NAME} || true && docker run -d --name ${CONTAINER_NAME} -p 80:80 ${FULL_IMAGE}'"
            }
            // cleanup local tar
            sh "rm -f ${tarName}"
          }
        }
      }
    }

  }

  post {
    success {
      echo "Pipeline finished successfully"
    }
    failure {
      echo "Pipeline failed"
    }
  }
}
