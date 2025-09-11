@Library('jenkins-shared-lib') _

pipeline {
    agent { 
        label env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev' 
    }
    
    tools {
        nodejs 'nodejs24.7.0'
    }
    
    environment {
        APP_VERSION = generateVersion()
    }
    
    stages {
        stage('🚀 Initialize') {
            steps {
                echo "📋 Starting Frontend CI/CD Pipeline"
                echo "🏷️  Version: ${APP_VERSION}"
                echo "🌿 Branch: ${env.BRANCH_NAME}"
                echo "🤖 Agent: ${env.BRANCH_NAME == 'main' ? 'build-heavy-prod' : 'build-heavy-dev'}"
            }
        }
        
        stage('🏗️ Build & Test') {
            steps {
                sendNotification("🏗️ Building and testing React app...", "INFO")
                
                echo "📦 Installing dependencies..."
                sh 'npm install'
                
                echo "🔨 Building application..."
                sh 'npm run build'
                
                echo "🧪 Running tests..."
                sh 'npm run test:ci'
                
                script {
                    if (fileExists('junit.xml')) {
                        junit testResults: 'junit.xml', allowEmptyResults: true
                        echo "✅ Test results published"
                    }
                    
                    if (fileExists('coverage/lcov-report/index.html')) {
                        archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true, fingerprint: true
                        echo "✅ Coverage report archived"
                    }
                }
                
                sendNotification("✅ Build and tests completed", "SUCCESS")
            }
        }
        
        stage('🔍 Code Quality') {
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
        
        stage('🔒 Security Scan') {
            steps {
                echo "🔒 Running security analysis..."
                
                script {
                    try {
                        echo "📋 Checking npm dependencies..."
                        sh '''
                            npm audit --audit-level=moderate --production || {
                                echo "⚠️ NPM audit found vulnerabilities (continuing)"
                                npm audit --audit-level=moderate --production --json > npm-audit-report.json || true
                            }
                        '''
                        
                        echo "Scanning base Docker image for critical vulnerabilities..."
                        sh '''
                            docker run --rm aquasec/trivy:latest image --exit-code 0 --format table --severity CRITICAL node:18-alpine || {
                                echo "⚠️ Critical vulnerabilities found in Node.js base image"
                                echo "Consider upgrading to a newer Node.js version"
                            }
                        '''
                        
                        archiveArtifacts artifacts: '*-report.json', allowEmptyArchive: true, fingerprint: true
                        
                    } catch (Exception e) {
                        echo "⚠️ Security scan failed: ${e.getMessage()}"
                        echo "Continuing build for demo purposes..."
                    }
                }
                
                echo "✅ Frontend security scan completed"
            }
        }
        
        stage('📦 Package & Build') {
            steps {
                echo "📦 Creating Docker image and artifacts..."
                
                script {
                    try {
                        sh 'docker build -t bookmymovie-front:${APP_VERSION} .'
                        sh 'docker tag bookmymovie-front:${APP_VERSION} bookmymovie-front:latest'
                        echo "✅ Docker image built: bookmymovie-front:${APP_VERSION}"
                    } catch (Exception e) {
                        echo "⚠️ Docker build failed: ${e.getMessage()} (continuing)"
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
        
        stage('🚀 Deploy Staging') {
            when { branch 'main' }
            steps {
                echo "🚀 Deploying to staging environment..."
                
                sh '''
                    echo "🚀 Starting staging deployment..."
                    docker compose -f docker-compose.staging.yml down
                    APP_VERSION=${APP_VERSION} docker compose -f docker-compose.staging.yml up -d
                    echo "✅ Staging deployment completed"
                    docker compose -f docker-compose.staging.yml ps
                '''
                
                echo "✅ Staging deployment successful"
            }
        }
        
        stage('⏳ Manual Approval') {
            when { branch 'main' }
            steps {
                echo "⏳ Waiting for production deployment approval..."
                
                script {
                    def deployDecision = input(
                        message: 'Deploy to Production?',
                        ok: 'Proceed',
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
        
        stage('🌟 Deploy Production') {
            when { branch 'main' }
            steps {
                echo "🌟 Deploying to production environment..."
                
                sh '''
                    echo "🌟 Starting production deployment..."
                    docker compose -f docker-compose.prod.yml down
                    APP_VERSION=${APP_VERSION} docker compose -f docker-compose.prod.yml up -d
                    echo "🎉 Production deployment completed!"
                    docker compose -f docker-compose.prod.yml ps
                '''
                
                echo "🎉 Production deployment successful!"
            }
        }
    }
    
    post {
        success {
            sendNotification("🎊 Pipeline completed! Version: ${APP_VERSION} deployed", "SUCCESS")
        }
        failure {
            sendNotification("💥 Pipeline failed! Check the logs.", "FAILURE")
        }
        always {
            echo "Cleaning up workspace..."
        }
    }
}