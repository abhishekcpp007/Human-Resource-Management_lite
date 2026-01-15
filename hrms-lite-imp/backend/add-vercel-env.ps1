Write-Host "Adding Vercel environment variables..."

# Env vars to add
$envVars = @{
    "NODE_ENV" = "production"
    "DB_HOST" = "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
    "DB_PORT" = "4000"
    "DB_USER" = "4C3pWCoeLYJaDxv.root"
    "DB_PASSWORD" = "jqj0ZD3tWkUGabY9"
    "DB_NAME" = "hrms_lite"
    "CORS_ORIGIN" = "*"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Adding $key..."
    $value = $envVars[$key]
    Write-Output $value | vercel env add $key production
}

Write-Host "Done! Now redeploying..."
vercel --prod --yes
