# 🚀 Frontend CI/CD Pipeline

## Vue d'ensemble

Cette pipeline Jenkins implémente un workflow CI/CD complet pour l'application React BookMyMovie Frontend.

## 🏗️ Architecture

### Agent Configuration
- **Global Agent** : Configuration dynamique basée sur la branche
  - `main` → `build-heavy-prod` (optimisé pour la production)
  - Autres branches → `build-heavy-dev` (environnement de développement)

### Avantages de l'agent global
- ✅ **Performance** : Un seul agent utilisé, pas de changements d'agents
- ✅ **Simplicité** : Configuration centralisée
- ✅ **Ressources** : Optimisation de l'utilisation des agents Jenkins

## 📋 Étapes de la Pipeline

### 🚀 Initialize
- Affichage des informations de build
- Version, branche, agent utilisé

### 🏗️ Build & Test
- Installation des dépendances (`npm install`)
- Build de l'application (`npm run build`)
- Exécution des tests (`npm run test:ci`)
- Publication des résultats de tests et couverture

### 🔍 Code Quality
- **SonarQube** : Analyse statique du code
- **ESLint** : Vérification des règles de codage
- **Prettier** : Vérification du formatage

### 🔒 Security Scan
- **NPM Audit** : Vérification des vulnérabilités des dépendances
- **Trivy** : Scan de sécurité de l'image Docker

### 📦 Package & Build
- Construction de l'image Docker
- Tagging avec version et `latest`
- Création des artefacts de build

### 🚀 Deploy Staging
- Déploiement automatique sur staging (branche `main` uniquement)
- Utilisation de Docker Compose
- Vérification du déploiement

### ⏳ Manual Approval
- Validation manuelle avant production
- Possibilité d'annuler le déploiement

### 🌟 Deploy Production
- Déploiement en production après approbation
- Utilisation de Docker Compose
- Port 80 pour la production

## 🐳 Docker Compose

### Staging (`docker-compose.staging.yml`)
```yaml
services:
  bookmymovie-front:
    image: bookmymovie-front:${APP_VERSION:-latest}
    ports:
      - "3000:80"
    container_name: bookmymovie-front-staging
```

### Production (`docker-compose.prod.yml`)
```yaml
services:
  bookmymovie-front:
    image: bookmymovie-front:${APP_VERSION:-latest}
    ports:
      - "80:80"
    container_name: bookmymovie-front-production
```

## 🔧 Configuration Requise

### Jenkins Plugins
- Pipeline
- Docker Pipeline
- SonarQube Scanner
- JUnit
- HTML Publisher

### Tools
- Node.js 24.7.0
- SonarQube Scanner
- Docker

### Agents
- `build-heavy-prod` : Avec accès Docker, optimisé pour production
- `build-heavy-dev` : Avec accès Docker, pour développement

## 📊 Métriques et Rapports

- **Tests** : Résultats JUnit et couverture de code
- **Qualité** : Rapports SonarQube et ESLint
- **Sécurité** : Rapports npm audit et Trivy
- **Artefacts** : Images Docker et fichiers de build

## 🚀 Améliorations Implémentées

### Lisibilité
- 🎯 Noms de stages avec émojis pour clarté visuelle
- 📝 Messages simplifiés et cohérents
- 🧹 Suppression des commentaires verbeux

### Performance
- ⚡ Agent global unique (au lieu de 5 agents différents)
- 🏃 Pas de changements d'agents entre stages
- 💾 Optimisation des ressources Jenkins

### Maintenance
- 🔧 Configuration centralisée
- 📦 Structure modulaire
- 🎯 Gestion d'erreurs simplifiée

## 🌐 Accès aux Applications

- **Staging** : http://localhost:3000
- **Production** : http://localhost:80

## 🔄 Workflow Git

1. **Développement** : Push sur feature branches → Build et tests uniquement
2. **Production** : Merge sur `main` → Pipeline complète avec déploiements

Cette configuration offre un équilibre optimal entre performance, lisibilité et fonctionnalités complètes pour le CI/CD.
