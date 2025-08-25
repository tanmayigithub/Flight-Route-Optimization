# Deployment Pipeline
# Auto-generated from Route Optimizer

# Pre-deployment checks
echo "🔍 Pre-deployment checks..."
npm test
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy based on file priorities
# HIGH: Backend/package-lock.json → npm-install
# HIGH: Backend/package.json → npm-install
# LOW: Backend/public/index.html → copy-public
# MEDIUM: Backend/src/App.js → copy-to-dist
# LOW: Backend/src/index.css → copy-styles
# MEDIUM: Backend/src/index.js → copy-to-dist
# LOW: Backend/src/output.css → copy-styles

echo "✅ Deployment completed!"
