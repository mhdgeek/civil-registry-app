# DevOps - Déploiement AWS Low-Cost

Cette documentation décrit comment déployer l'application de gestion des états civils sur AWS avec une architecture à coût minimal.

## Architecture

**Coût total estimé: ~$10-15/mois**

## Prérequis

1. **Compte AWS** avec accès programmatique
2. **MongoDB Atlas** (cluster gratuit M0)
3. **DockerHub** compte (pour les images)
4. **GitHub** repository

## Configuration des Secrets GitHub

Ajoutez ces secrets dans GitHub → Repository → Settings → Secrets → Actions:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` 
- `AWS_REGION` (us-east-1)
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `MONGODB_URI` (de MongoDB Atlas)
- `JWT_SECRET` (clé secrète pour JWT)

## Étapes de déploiement

### 1. Initialiser Terraform
```bash
./terraform-init.sh
