#!/bin/bash
# Development startup script

echo "🚀 Starting Full-Stack Development Environment"
echo "=============================================="

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend server
echo "🔧 Starting backend server on port 5000..."
npm run dev &

# Wait a moment for backend to start
sleep 3

# Test backend
echo "🧪 Testing backend connection..."
curl -s http://localhost:5000/api/test || echo "⚠️  Backend not responding yet"

echo ""
echo "✅ Backend running at: http://localhost:5000"
echo "📡 API endpoints:"
echo "   - http://localhost:5000/api/test"
echo "   - http://localhost:5000/api/airports"
echo "   - http://localhost:5000/api/optimize-route"
echo ""
echo "🎯 Next steps:"
echo "   1. Start your React frontend: npm start (in parent directory)"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Test the integration!"
