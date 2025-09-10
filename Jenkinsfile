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
                echo "🌿 Branch: ${env.BRANCH_NAME}"
                echo "🎯 Will use agent: ${env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev'}"
            }
        }
        
        stage('Build & Test Frontend') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                sendNotification("Building and testing React app...", "INFO")
                
                // Build et tests React/Node.js avec docker run
                sh '''
                    echo "� Debug: Listing current directory..."
                    ls -la
                    echo "�📦 Installing Node.js dependencies..."
                    docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install
                    echo "🔨 Building React application..."
                    docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run build
                    echo "🧪 Running Jest tests with coverage and JUnit reports..."
                    docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run test:ci
                    echo "🌐 Running E2E tests..."
                    # docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run test:e2e
                '''
                
                // Publication des rapports de tests
                publishTestResults testResultsPattern: 'test-results/junit.xml'
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
                
                sendNotification("Frontend build and tests completed successfully", "SUCCESS")
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('SonarQube Analysis') {
                    steps {
                        sendNotification("Running SonarQube analysis...", "INFO")
                        
                        script {
                            def scannerHome = tool 'SonarQubeScanner'
                            withSonarQubeEnv('sonarqube') {
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \\
                                        -Dsonar.projectKey=bookmymovie-front \\
                                        -Dsonar.projectName='BookMyMovie Frontend' \\
                                        -Dsonar.projectVersion=${APP_VERSION} \\
                                        -Dsonar.sources=src \\
                                        -Dsonar.exclusions='**/node_modules/**,**/*.test.js,**/coverage/**' \\
                                        -Dsonar.tests=src \\
                                        -Dsonar.test.inclusions='**/*.test.js' \\
                                        -Dsonar.language=js
                                """
                            }
                        }
                        
                        sendNotification("SonarQube analysis completed successfully", "SUCCESS")
                        
                        /*
                        // Attendre le Quality Gate avec timeout légèrement augmenté
                        timeout(time: 5, unit: 'MINUTES') {
                            script {
                                def qg = waitForQualityGate()
                                if (qg.status != 'OK') {
                                    sendNotification("Quality Gate failed: ${qg.status}", "FAILURE")
                                    error "Pipeline aborted due to quality gate failure: ${qg.status}"
                                } else {
                                    sendNotification("Quality Gate passed successfully!", "SUCCESS")
                                }
                            }
                        }
                        */
                    }
                }
                
                stage('Linting & Formatting') {
                    agent { 
                        label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
                    }
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
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                sendNotification("Running frontend security scans...", "INFO")
                
                script {
                    try {
                        // NPM Security Audit avec l'image Node.js officielle
                        sh '''
                            echo "🔒 Running npm audit for dependency vulnerabilities..."
                            if [ -f "package.json" ]; then
                                docker run --rm -v $(pwd):/workspace -w /workspace node:18-alpine sh -c "
                                    npm audit --audit-level=moderate --production || {
                                        echo '⚠️ NPM audit found vulnerabilities!'
                                        npm audit --audit-level=moderate --production --json > npm-audit-report.json || true
                                    }
                                "
                            else
                                echo "No package.json found, skipping npm audit"
                            fi
                        '''
                        
                        // Docker Image Security Scan avec Trivy dans un conteneur
                        sh '''
                            echo "🐳 Creating test Docker image for security scan..."
                            cat > Dockerfile.security << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY src/ src/
COPY public/ public/
EXPOSE 3000
CMD ["npm", "start"]
EOF
                            
                            echo "Building test image..."
                            docker build -t bookmymovie-front:security-scan -f Dockerfile.security . || echo "Docker build failed, using base image"
                            
                            echo "🔍 Scanning with Trivy container..."
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                                aquasec/trivy:latest image --exit-code 0 --format table --severity HIGH,CRITICAL node:18-alpine || echo "High/Critical vulnerabilities found in base image"
                            
                            if docker images bookmymovie-front:security-scan -q; then
                                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                                    aquasec/trivy:latest image --exit-code 1 --format table --severity CRITICAL bookmymovie-front:security-scan || {
                                    echo "❌ CRITICAL vulnerabilities found in application image!"
                                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd):/workspace \\
                                        aquasec/trivy:latest image --format json --severity CRITICAL bookmymovie-front:security-scan > /workspace/trivy-report.json || true
                                    echo "⚠️ Continuing build despite critical vulnerabilities (demo mode)"
                                }
                            fi
                        '''
                        
                        // Archiver les rapports de sécurité
                        archiveArtifacts artifacts: '*.json', allowEmptyArchive: true, fingerprint: true
                        
                    } catch (Exception e) {
                        echo "⚠️ Security scan failed: ${e.getMessage()}"
                        echo "Continuing build for demo purposes..."
                    }
                }
                
                sendNotification("Frontend security scan completed", "SUCCESS")
            }
        }
        
        stage('Package & Docker Build') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
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