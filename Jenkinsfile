@Library('jenkins-shared-libs') _

pipeline {
    agent any
    
    environment {
        APP_VERSION = generateVersion()
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                sendNotification("Starting build for Frontend React", "INFO")
                echo "Frontend code checked out successfully"
                echo "Build version: ${APP_VERSION}"
            }
        }
        
        stage('Build & Test Frontend') {
            agent { label 'build-heavy' }
            steps {
                sendNotification("Building and testing React app...", "INFO")
                
                // Simulation d'un build React/Node.js
                sh '''
                    echo "📦 Installing Node.js dependencies..."
                    # npm install
                    echo "🔨 Building React application..."
                    # npm run build
                    echo "🧪 Running Jest tests..."
                    # npm test -- --coverage
                    echo "🌐 Running E2E tests..."
                    # npm run test:e2e
                '''
                
                sendNotification("Frontend build and tests completed successfully", "SUCCESS")
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('SonarQube Analysis') {
                    steps {
                        sendNotification("Running SonarQube analysis...", "INFO")
                        
                        sh '''
                            echo "🔍 Running SonarQube analysis for React..."
                            # sonar-scanner
                        '''
                        
                        sendNotification("SonarQube analysis completed", "SUCCESS")
                    }
                }
                
                stage('Linting & Formatting') {
                    agent { label 'build-heavy' }
                    steps {
                        sendNotification("Running linting and code formatting...", "INFO")
                        
                        sh '''
                            echo "🔍 Running ESLint..."
                            # npm run lint
                            echo "💅 Checking Prettier formatting..."
                            # npm run format:check
                        '''
                        
                        sendNotification("Code quality checks passed", "SUCCESS")
                    }
                }
            }
        }
        
        stage('Security Scan Frontend') {
            agent { label 'build-heavy' }
            steps {
                sendNotification("Running frontend security scans...", "INFO")
                
                sh '''
                    echo "🔒 Running npm audit..."
                    # npm audit --audit-level=high
                    echo "🐳 Building Docker image for scan..."
                    # docker build -t bookmymovie-front:${APP_VERSION} .
                    echo "🔍 Scanning Docker image with Trivy..."
                    # trivy image bookmymovie-front:${APP_VERSION}
                '''
                
                sendNotification("Frontend security scan completed", "SUCCESS")
            }
        }
        
        stage('Package & Docker Build') {
            agent { label 'build-heavy' }
            steps {
                sendNotification("Creating frontend artifacts and Docker image...", "INFO")
                
                sh '''
                    echo "📦 Creating build artifacts..."
                    mkdir -p build dist
                    echo "Frontend Build ${APP_VERSION}" > build/index.html
                    echo "Static assets ready" > build/assets.txt
                    
                    echo "🐳 Building Docker image..."
                    # docker build -t bookmymovie-front:${APP_VERSION} .
                    # docker tag bookmymovie-front:${APP_VERSION} registry.local/bookmymovie-front:${APP_VERSION}
                    
                    echo "📁 Preparing artifacts for archiving..."
                    cp -r build dist/
                '''
                
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
                
                sendNotification("Frontend artifacts and Docker image created", "SUCCESS")
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sendNotification("Deploying frontend to staging environment...", "INFO")
                
                sh '''
                    echo "🚀 Deploying to staging..."
                    # docker-compose -f docker-compose.staging.yml up -d frontend
                    # kubectl apply -f k8s/staging/frontend-deployment.yml
                    echo "✅ Frontend deployed to staging environment"
                '''
                
                sendNotification("Frontend successfully deployed to staging", "SUCCESS")
            }
        }
        
        stage('Manual Approval') {
            when {
                branch 'main'
            }
            steps {
                sendNotification("Waiting for manual approval for production deployment...", "INFO")
                
                script {
                    def deployDecision = input(
                        message: 'Deploy frontend to production?',
                        parameters: [
                            choice(choices: ['Deploy', 'Cancel'], description: 'Choose action', name: 'ACTION')
                        ]
                    )
                    
                    if (deployDecision == 'Cancel') {
                        error('Production deployment cancelled by user')
                    }
                }
                
                sendNotification("Production deployment approved", "SUCCESS")
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                sendNotification("Deploying frontend to production environment...", "INFO")
                
                sh '''
                    echo "🌟 Deploying to production..."
                    # docker-compose -f docker-compose.prod.yml up -d frontend
                    # kubectl apply -f k8s/prod/frontend-deployment.yml
                    echo "🎉 Frontend deployed to production environment"
                '''
                
                sendNotification("🎉 Frontend successfully deployed to production!", "SUCCESS")
            }
        }
    }
    
    post {
        success {
            sendNotification("🎊 Frontend pipeline completed successfully! Version: ${APP_VERSION} deployed", "SUCCESS")
        }
        failure {
            sendNotification("💥 Frontend pipeline failed! Check the logs.", "FAILURE")
        }
        always {
            echo "Cleaning up workspace..."
        }
    }
}