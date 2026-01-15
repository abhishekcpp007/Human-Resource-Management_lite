@echo off
echo production| vercel env add NODE_ENV production
echo 4000| vercel env add DB_PORT production
echo gateway01.ap-southeast-1.prod.aws.tidbcloud.com| vercel env add DB_HOST production
echo 4C3pWCoeLYJaDxv.root| vercel env add DB_USER production
echo jqj0ZD3tWkUGabY9| vercel env add DB_PASSWORD production
echo hrms_lite| vercel env add DB_NAME production
echo *| vercel env add CORS_ORIGIN production
echo Done!
