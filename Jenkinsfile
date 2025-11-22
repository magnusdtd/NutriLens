pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '5', daysToKeepStr: '5'))
    timestamps()
  }

  environment {
    // Docker image names for the three services
    BACKEND_IMAGE = 'magnusdtd/naver-hkt-backend'
    FRONTEND_IMAGE = 'magnusdtd/naver-hkt-frontend'
    AGENT_SYSTEM_IMAGE = 'magnusdtd/naver-hkt-agent-system'
    
    // Full image names with latest tag
    BACKEND_FULL_IMAGE = "${BACKEND_IMAGE}:latest"
    FRONTEND_FULL_IMAGE = "${FRONTEND_IMAGE}:latest"
    AGENT_SYSTEM_FULL_IMAGE = "${AGENT_SYSTEM_IMAGE}:latest"
    
    DOCKER_REGISTRY_CREDENTIAL = 'dockerhub'
    
    // Credential IDs for sensitive data
    GOOGLE_CLIENT_ID_CREDENTIAL = 'google-client-id'
    GOOGLE_CLIENT_SECRET_CREDENTIAL = 'google-client-secret'
    SECRET_KEY_CREDENTIAL = 'secret-key'
    DB_PASSWORD_CREDENTIAL = 'db-password'
    MINIO_PASSWORD_CREDENTIAL = 'minio-password'
    LANGFUSE_PUBLIC_KEY_CREDENTIAL = 'langfuse-public-key'
    LANGFUSE_SECRET_KEY_CREDENTIAL = 'langfuse-secret-key'
    LANGFUSE_HOST_CREDENTIAL = 'langfuse-host'
    CLOVASTUDIO_API_KEY_CREDENTIAL = 'clovastudio-api-key'
    CLOVA_OCR_SECRET_CREDENTIAL = 'clova-ocr-secret'

    GCP_PROJECT_ID = 'feisty-legend-478903-c2'
    GKE_CLUSTER_NAME = 'feisty-legend-478903-c2-gke'
    GKE_CLUSTER_ZONE = 'asia-southeast1-a'
  }

  stages {

    stage('Run Tests') {
      steps {
        script {
          echo 'Running tests...'
          // Add running tests command here
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        script {
          echo 'Building all Docker images...'

          sh 'docker compose -f docker-compose.yml build'
          sh 'docker images'

          sh 'docker image ls'
        }
      }
    }

    stage('Push Docker Images') {
      steps {
        script {
          echo 'Pushing Docker images to the registry...'
        
          docker.withRegistry('', DOCKER_REGISTRY_CREDENTIAL) {
            // Push backend image
            echo "Pushing ${BACKEND_FULL_IMAGE}..."
            // docker.image("${BACKEND_FULL_IMAGE}").push()
            
            // Push frontend image
            echo "Pushing ${FRONTEND_FULL_IMAGE}..."
            docker.image("${FRONTEND_FULL_IMAGE}").push()
            
            // Push agent-system image
            echo "Pushing ${AGENT_SYSTEM_FULL_IMAGE}..."
            docker.image("${AGENT_SYSTEM_FULL_IMAGE}").push()
          }

          echo 'All Docker images pushed successfully!'
        }
      }
    }

    stage('Deploy to Google Kubernetes Engine') {
      agent {
        kubernetes {
          yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: helm
                image: magnusdtd/jenkins-k8s:latest
                imagePullPolicy: Always
                command:
                - cat
                tty: true
          '''
        }
      }
      steps {
        script {
          container('helm') {
            // Load sensitive data from Jenkins credentials
            withCredentials([
              // googleServiceAccountKey(credentialsId: 'GCP', variable: 'GOOGLE_APPLICATION_CREDENTIALS'),
              file(credentialsId: 'GCP', variable: 'GOOGLE_APPLICATION_CREDENTIALS'),
              string(credentialsId: env.GOOGLE_CLIENT_ID_CREDENTIAL, variable: 'GOOGLE_CLIENT_ID'),
              string(credentialsId: env.GOOGLE_CLIENT_SECRET_CREDENTIAL, variable: 'GOOGLE_CLIENT_SECRET'),
              string(credentialsId: env.SECRET_KEY_CREDENTIAL, variable: 'SECRET_KEY'),
              string(credentialsId: env.DB_PASSWORD_CREDENTIAL, variable: 'DB_PASSWORD'),
              string(credentialsId: env.MINIO_PASSWORD_CREDENTIAL, variable: 'MINIO_PASSWORD'),
              string(credentialsId: env.LANGFUSE_PUBLIC_KEY_CREDENTIAL, variable: 'LANGFUSE_PUBLIC_KEY'),
              string(credentialsId: env.LANGFUSE_SECRET_KEY_CREDENTIAL, variable: 'LANGFUSE_SECRET_KEY'),
              string(credentialsId: env.LANGFUSE_HOST_CREDENTIAL, variable: 'LANGFUSE_HOST'),
              string(credentialsId: env.CLOVASTUDIO_API_KEY_CREDENTIAL, variable: 'CLOVASTUDIO_API_KEY'),
              string(credentialsId: env.CLOVA_OCR_SECRET_CREDENTIAL, variable: 'CLOVA_OCR_SECRET'),

            ]) {
              
              // Store credentials in environment variables for later stages
              env.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID
              env.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET
              env.SECRET_KEY = SECRET_KEY
              env.DB_PASSWORD = DB_PASSWORD
              env.MINIO_PASSWORD = MINIO_PASSWORD
              env.LANGFUSE_PUBLIC_KEY = LANGFUSE_PUBLIC_KEY
              env.LANGFUSE_SECRET_KEY = LANGFUSE_SECRET_KEY
              env.LANGFUSE_HOST = LANGFUSE_HOST
              env.CLOVASTUDIO_API_KEY = CLOVASTUDIO_API_KEY
              env.CLOVA_OCR_SECRET = CLOVA_OCR_SECRET
              env.NAMESPACE = 'naver-hkt-app'
              env.KUBECONFIG = "/tmp/kubeconfig"

              sh "gcloud auth activate-service-account --key-file=${GOOGLE_APPLICATION_CREDENTIALS}"
              sh "gcloud container clusters get-credentials ${GKE_CLUSTER_NAME} --zone ${GKE_CLUSTER_ZONE} --project ${GCP_PROJECT_ID}"


              sh '''
                echo "Starting Helm deployment..."
                
                # Create namespace if it doesn't exist
                kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                
                # Deploy/Upgrade Helm chart with secrets
                helm upgrade --install naver-hkt ./k8s \
                  --namespace ${NAMESPACE} \
                  --set secrets.googleClientId="${GOOGLE_CLIENT_ID}" \
                  --set secrets.googleClientSecret="${GOOGLE_CLIENT_SECRET}" \
                  --set secrets.secretKey="${SECRET_KEY}" \
                  --set secrets.dbPassword="${DB_PASSWORD}" \
                  --set secrets.minioPassword="${MINIO_PASSWORD}" \
                  --set secrets.langfusePublicKey="${LANGFUSE_PUBLIC_KEY}" \
                  --set secrets.langfuseSecretKey="${LANGFUSE_SECRET_KEY}" \
                  --set secrets.langfuseHost="${LANGFUSE_HOST}" \
                  --set secrets.clovastudioApiKey="${CLOVASTUDIO_API_KEY}" \
                  --set secrets.clovaOcrSecret="${CLOVA_OCR_SECRET}" \
                  --wait \
                  --timeout 10m
                
                # Get LoadBalancer external IPs for frontend and agent-system
                echo "Waiting for LoadBalancer services to get external IPs..."
                kubectl get svc -n ${NAMESPACE} -l app.kubernetes.io/component=frontend
                kubectl get svc -n ${NAMESPACE} -l app.kubernetes.io/component=agent-system
                
                echo "Helm deployment completed successfully!"
              '''
            }
          }
        }
      }
    }

  }

  post {
    success {
      script {
        echo 'Build successful.'
      }
    }
    failure {
      script {
        echo 'Build failed!'
      }
    }
    cleanup {
      script {
        echo 'Cleaning up...'
        sh 'docker image prune -f'
      }
    }
  }
}