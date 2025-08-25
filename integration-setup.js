const fs = require("fs");
const path = require("path");

class FullStackIntegrator {
  constructor() {
    this.backendPort = 5000;
    this.frontendPort = 3000;
    this.apiBaseUrl = `http://localhost:${this.backendPort}`;
  }

  createBackendServer() {
    const serverCode = `
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || ${this.backendPort};

app.use(cors({
    origin: ['http://localhost:${this.frontendPort}', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

app.get('/api/airports', (req, res) => {
    res.json({
        airports: [
            { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
            { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
            { code: 'ORD', name: 'O\\'Hare International', city: 'Chicago' }
        ]
    });
});

app.post('/api/optimize-route', (req, res) => {
    const { origin, destination, preferences } = req.body;
    
    res.json({
        optimizedRoute: {
            origin,
            destination,
            distance: '2,475 miles',
            duration: '5h 30m',
            cost: '$299',
            stops: []
        },
        alternatives: [],
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(\`🚀 Backend server running on port \${PORT}\`);
    console.log(\`📡 API available at http://localhost:\${PORT}/api\`);
    console.log(\`🌐 Frontend served at http://localhost:\${PORT}\`);
});

module.exports = app;
`;

    fs.writeFileSync("server.js", serverCode);
    console.log("✅ Created server.js");
  }

  createFrontendService() {
    const apiServiceCode = `
class ApiService {
    constructor() {
        this.baseURL = '${this.apiBaseUrl}/api';
    }

    async apiCall(endpoint, options = {}) {
        try {
            const url = \`\${this.baseURL}\${endpoint}\`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async testConnection() {
        return this.apiCall('/test');
    }

    async getAirports() {
        return this.apiCall('/airports');
    }

    async optimizeRoute(routeData) {
        return this.apiCall('/optimize-route', {
            method: 'POST',
            body: JSON.stringify(routeData)
        });
    }

    async healthCheck() {
        return this.apiCall('/health');
    }
}

export default new ApiService();
`;

    if (!fs.existsSync("src/services")) {
      fs.mkdirSync("src/services", { recursive: true });
    }

    fs.writeFileSync("src/services/api.js", apiServiceCode);
    console.log("✅ Created src/services/api.js");
  }

  updateReactApp() {
    const appCode = `
import React, { useState, useEffect } from 'react';
import ApiService from './services/api';
import './App.css';

function App() {
    const [backendStatus, setBackendStatus] = useState('checking...');
    const [airports, setAirports] = useState([]);
    const [routeData, setRouteData] = useState({
        origin: '',
        destination: '',
        preferences: {}
    });
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkBackendConnection();
        loadAirports();
    }, []);

    const checkBackendConnection = async () => {
        try {
            const response = await ApiService.testConnection();
            setBackendStatus('✅ Connected');
            console.log('Backend response:', response);
        } catch (error) {
            setBackendStatus('❌ Not connected');
            console.error('Backend connection failed:', error);
        }
    };

    const loadAirports = async () => {
        try {
            const response = await ApiService.getAirports();
            setAirports(response.airports);
        } catch (error) {
            console.error('Failed to load airports:', error);
        }
    };

    const handleOptimizeRoute = async (e) => {
        e.preventDefault();
        if (!routeData.origin || !routeData.destination) {
            alert('Please select both origin and destination');
            return;
        }

        setLoading(true);
        try {
            const response = await ApiService.optimizeRoute(routeData);
            setOptimizedRoute(response.optimizedRoute);
            console.log('Optimized route:', response);
        } catch (error) {
            console.error('Route optimization failed:', error);
            alert('Failed to optimize route. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setRouteData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>🛫 Flight Route Optimizer</h1>
                <p>Backend Status: {backendStatus}</p>
            </header>

            <main className="main-content">
                <div className="status-card">
                    <h3>System Status</h3>
                    <p>Backend: {backendStatus}</p>
                    <p>Airports loaded: {airports.length}</p>
                    <button onClick={checkBackendConnection}>
                        🔄 Test Connection
                    </button>
                </div>

                <div className="route-form">
                    <h3>Optimize Your Route</h3>
                    <form onSubmit={handleOptimizeRoute}>
                        <div className="form-group">
                            <label>Origin Airport:</label>
                            <select 
                                value={routeData.origin}
                                onChange={(e) => handleInputChange('origin', e.target.value)}
                            >
                                <option value="">Select Origin</option>
                                {airports.map(airport => (
                                    <option key={airport.code} value={airport.code}>
                                        {airport.code} - {airport.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Destination Airport:</label>
                            <select 
                                value={routeData.destination}
                                onChange={(e) => handleInputChange('destination', e.target.value)}
                            >
                                <option value="">Select Destination</option>
                                {airports.map(airport => (
                                    <option key={airport.code} value={airport.code}>
                                        {airport.code} - {airport.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? '🔄 Optimizing...' : '🚀 Optimize Route'}
                        </button>
                    </form>
                </div>

                {optimizedRoute && (
                    <div className="results">
                        <h3>✈️ Optimized Route</h3>
                        <div className="route-details">
                            <p><strong>From:</strong> {optimizedRoute.origin}</p>
                            <p><strong>To:</strong> {optimizedRoute.destination}</p>
                            <p><strong>Distance:</strong> {optimizedRoute.distance}</p>
                            <p><strong>Duration:</strong> {optimizedRoute.duration}</p>
                            <p><strong>Cost:</strong> {optimizedRoute.cost}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
`;

    fs.writeFileSync("src/App.js", appCode);
    console.log("✅ Updated src/App.js");
  }

  createEnvironmentConfig() {
    const envConfig = `PORT=${this.backendPort}
NODE_ENV=development
API_BASE_URL=${this.apiBaseUrl}
`;

    fs.writeFileSync(".env", envConfig);
    console.log("✅ Created .env file");
  }

  updatePackageJsonScripts() {
    if (!fs.existsSync("package.json")) {
      console.log("❌ package.json not found");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "nodemon server.js",
      "start:backend": "node server.js",
      "start:frontend": "cd .. && npm start",
      "start:both":
        'concurrently "npm run start:backend" "npm run start:frontend"',
      "build:frontend": "cd .. && npm run build",
      "deploy:full": "npm run build:frontend && npm run start:backend",
    };

    packageJson.dependencies = {
      ...packageJson.dependencies,
      express: "^4.18.2",
      cors: "^2.8.5",
      dotenv: "^16.3.1",
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      nodemon: "^3.0.1",
      concurrently: "^8.2.2",
    };

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json");
  }

  createDevScript() {
    const devScript = `#!/bin/bash

echo "🚀 Starting Full-Stack Development Environment"
echo "=============================================="

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🔧 Starting backend server on port ${this.backendPort}..."
npm run dev &

sleep 3

echo "🧪 Testing backend connection..."
curl -s http://localhost:${this.backendPort}/api/test || echo "⚠️  Backend not responding yet"

echo ""
echo "✅ Backend running at: http://localhost:${this.backendPort}"
echo "📡 API endpoints:"
echo "   - http://localhost:${this.backendPort}/api/test"
echo "   - http://localhost:${this.backendPort}/api/airports"
echo "   - http://localhost:${this.backendPort}/api/optimize-route"
echo ""
echo "🎯 Next steps:"
echo "   1. Start your React frontend: npm start (in parent directory)"
echo "   2. Open http://localhost:${this.frontendPort} in your browser"
echo "   3. Test the integration!"
`;

    fs.writeFileSync("start-dev.sh", devScript);
    console.log("✅ Created start-dev.sh");
  }

  setupFullStackIntegration() {
    console.log("🔧 Setting up Full-Stack Integration...\n");

    this.createBackendServer();
    this.createFrontendService();
    this.updateReactApp();
    this.createEnvironmentConfig();
    this.updatePackageJsonScripts();
    this.createDevScript();

    console.log("\n🎉 FULL-STACK INTEGRATION COMPLETE!");
    console.log("=====================================");
    console.log("✅ Backend server: server.js");
    console.log("✅ Frontend API service: src/services/api.js");
    console.log("✅ Updated React App: src/App.js");
    console.log("✅ Environment config: .env");
    console.log("✅ Development script: start-dev.sh");

    console.log("\n🚀 TO START YOUR FULL-STACK APP:");
    console.log("=================================");
    console.log("1. Install dependencies:");
    console.log("   npm install");
    console.log("");
    console.log("2. Start backend:");
    console.log("   npm run dev");
    console.log("");
    console.log("3. In another terminal, start frontend:");
    console.log("   cd .. && npm start");
    console.log("");
    console.log("4. Open browser:");
    console.log(`   Backend API: http://localhost:${this.backendPort}/api`);
    console.log(`   Frontend App: http://localhost:${this.frontendPort}`);

    return true;
  }
}

const integrator = new FullStackIntegrator();
integrator.setupFullStackIntegration();

module.exports = { FullStackIntegrator };
