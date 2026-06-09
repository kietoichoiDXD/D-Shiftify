param(
    [string]$ProjectId = "bdien-muonmay",
    [string]$Region = "asia-southeast1",
    [string]$ServiceName = "shiftify-backend",
    [string]$Repository = "shiftify-backend",
    [string]$Image = "shiftify-backend"
)

$ErrorActionPreference = "Stop"

$imageUri = "$Region-docker.pkg.dev/$ProjectId/$Repository/$Image:latest"

gcloud config set project $ProjectId | Out-Null
gcloud builds submit --config cloudbuild.yaml --substitutions "_SERVICE_NAME=$ServiceName,_REGION=$Region,_REPOSITORY=$Repository,_IMAGE=$Image" .
gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
