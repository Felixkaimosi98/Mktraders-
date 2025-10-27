Quick deploy

1) Push this repo to GitHub
2) Backend (Render):
   - Create new Web Service -> Connect GitHub -> select server/ folder
   - Build Command: npm install
   - Start Command: node index.js
   - Set environment variables: DERIV_TOKEN, DERIV_APP_ID, PORT
3) Frontend (Vercel):
   - Import client/ from GitHub
   - Build Command: npm run build
   - Output Directory: dist
   - Set Environment: REACT_APP_API_URL to backend URL
