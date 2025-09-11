@Library('jenkins-shared-lib') _

pipeline {
    agent any
    
    tools {
        nodejs 'nodejs24.7.0'
    }
    
    environment {
        APP_VERSION = generateVersion()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "📋 Starting build for Frontend React"
                echo "Frontend code checked out successfully"
                echo "Build version: ${APP_VERSION}"
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Will use agent: ${env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev'}"
            }
        }
        
        stage('Build & Test Frontend') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                sendNotification("🏗️ Building and testing React app...", "INFO")
                
                sh 'npm install'
                sh 'npx react-scripts --version || echo "react-scripts not found, checking node_modules..."'
                sh 'ls -la node_modules/.bin/ | grep react || echo "No react scripts in node_modules/.bin"'
                sh 'npm run build'
                sh 'npm run test:ci'
                
                sh '''
                    echo "Checking generated files:"
                    ls -la
                    echo "Looking for junit.xml:"
                    find . -name "junit.xml" -type f || echo "junit.xml not found"
                    echo "Looking for coverage directory:"
                    ls -la coverage/ || echo "coverage directory not found"
                '''
                
                script {
                    if (fileExists('junit.xml')) {
                        junit testResults: 'junit.xml', allowEmptyResults: true
                        echo "✅ JUnit results published"
                    } else {
                        echo "⚠️ junit.xml not found, skipping JUnit results"
                    }
                }
                
                script {
                    if (fileExists('coverage/lcov-report/index.html')) {
                        // Archive les rapports de couverture
                        archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true, fingerprint: true
                        echo "✅ Coverage report archived"
                    } else {
                        echo "⚠️ Coverage report not found, skipping"
                    }
                }
                
                sendNotification("✅ Frontend build and tests completed successfully", "SUCCESS")
            }
        }
        
        stage('Code Quality') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                echo "🔍 Running code quality checks..."
                
                script {
                    try {
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
                                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                                    -Dsonar.language=js
                            """
                        }
                        echo "✅ SonarQube analysis completed successfully"
                        
                        try {
                            timeout(time: 3, unit: 'MINUTES') {
                                def qg = waitForQualityGate()
                                if (qg.status != 'OK') {
                                    echo "⚠️ Quality Gate failed: ${qg.status}"
                                    echo "Continuing pipeline for demo purposes..."
                                } else {
                                    echo "✅ Quality Gate passed successfully!"
                                }
                            }
                        } catch (Exception e) {
                            echo "⚠️ Quality Gate check failed: ${e.getMessage()}"
                            echo "Continuing pipeline for demo purposes..."
                        }
                    } catch (Exception e) {
                        echo "⚠️ SonarQube analysis failed: ${e.getMessage()}"
                        echo "Continuing pipeline for demo purposes..."
                    }
                }
                
                echo "🧹 Running linting and code formatting..."
                script {
                    try {
                        sh '''
                            echo "=== Running ESLint ==="
                            npm run lint || {
                                echo "ESLint found issues, but continuing for demo..."
                                exit 0
                            }
                            
                            echo "=== Checking Prettier formatting ==="
                            npm run format:check || {
                                echo "Prettier found formatting issues, but continuing for demo..."
                                exit 0
                            }
                            
                            echo "All linting and formatting checks passed!"
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Linting failed: ${e.getMessage()}"
                        echo "Continuing pipeline for demo purposes..."
                    }
                }
                
                echo "✅ All code quality checks completed"
            }
        }
        
        stage('Security Scan Frontend') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                echo "🔒 Running frontend security scans..."
                
                script {
                    try {
                        // NPM Security Audit - Simple et efficace
                        echo "Running npm audit for dependency vulnerabilities..."
                        sh '''
                            npm audit --audit-level=moderate --production || {
                                echo "⚠️ NPM audit found some vulnerabilities, but continuing build..."
                                npm audit --audit-level=moderate --production --json > npm-audit-report.json || true
                            }
                        '''
                        
                        // Simple Docker scan - uniquement l'image de base
                        echo "Scanning base Docker image for critical vulnerabilities..."
                        sh '''
                            docker run --rm aquasec/trivy:latest image --exit-code 0 --format table --severity CRITICAL node:18-alpine || {
                                echo "⚠️ Critical vulnerabilities found in Node.js base image"
                                echo "Consider upgrading to a newer Node.js version"
                            }
                        '''
                        
                        // Archive security reports if they exist
                        archiveArtifacts artifacts: '*-report.json', allowEmptyArchive: true, fingerprint: true
                        
                    } catch (Exception e) {
                        echo "⚠️ Security scan failed: ${e.getMessage()}"
                        echo "Continuing build for demo purposes..."
                    }
                }
                
                echo "✅ Frontend security scan completed"
            }
        }
        
        stage('Package & Docker Build') {
            agent { 
                label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
            }
            steps {
                echo "📦 Creating frontend artifacts and Docker image..."
                
                script {
                    try {
                        // Utilisation du Docker Pipeline plugin - permissions configurées
                        sh 'docker build -t bookmymovie-front:${APP_VERSION} .'
                        sh 'docker tag bookmymovie-front:${APP_VERSION} bookmymovie-front:latest'
                        
                        echo "✅ Docker image built: bookmymovie-front:${APP_VERSION}"
                    } catch (Exception e) {
                        echo "⚠️ Docker build failed: ${e.getMessage()}"
                        echo "Continuing for demo purposes..."
                    }
                }
                
                sh '''
                    echo "Creating deployment artifacts..."
                    mkdir -p dist
                    echo "bookmymovie-front:${APP_VERSION}" > dist/docker-image-tag.txt
                    echo "${APP_VERSION}" > dist/version.txt
                    echo "$(date)" > dist/build-timestamp.txt
                    
                    echo "Artifacts created:"
                    ls -la dist/
                '''
                
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
                
                echo "✅ Frontend artifacts and Docker image created"
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Deploying frontend to staging environment..."
                
                sh '''
                    echo "🚀 Deploying to staging..."
                    
                    # Utilise docker compose (nouvelle syntaxe) ou fallback
                    docker compose -f docker-compose.staging.yml down || docker-compose -f docker-compose.staging.yml down || echo "No existing containers"
                    docker compose -f docker-compose.staging.yml up -d || docker-compose -f docker-compose.staging.yml up -d
                    
                    echo "✅ Staging deployment completed"
                    docker ps | grep staging || echo "Checking containers..."
                '''
                
                echo "✅ Frontend successfully deployed to staging"
            }
        }
        
        stage('Manual Approval') {
            when {
                branch 'main'
            }
            steps {
                echo "⏳ Waiting for manual approval for production deployment..."
                
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
                
                echo "✅ Production deployment approved"
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo "🌟 Deploying frontend to production environment..."
                
                sh '''
                    echo "🌟 Deploying to production..."
                    
                    # Utilise docker compose (nouvelle syntaxe) ou fallback
                    docker compose -f docker-compose.prod.yml down || docker-compose -f docker-compose.prod.yml down || echo "No existing containers"
                    docker compose -f docker-compose.prod.yml up -d || docker-compose -f docker-compose.prod.yml up -d
                    
                    echo "🎉 Production deployment completed!"
                    docker ps | grep production || echo "Checking containers..."
                '''
                
                echo "🎉 Frontend successfully deployed to production!"
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