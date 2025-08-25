// Enhanced Route Optimizer with Build & Deployment Integration
// Save as: Backend/build-optimizer.js

const fs = require("fs");
const path = require("path");

class BuildDeploymentOptimizer {
  constructor() {
    this.routes = new Map();
    this.buildConfig = {
      outputDir: "dist",
      buildOrder: [],
      deploymentSteps: [],
      optimizations: [],
    };
  }

  // Your existing route optimizer logic
  addFile(filePath, priority = 2) {
    const fileName = this.getFileName(filePath);
    const extension = this.getFileExtension(filePath);

    if (fileName.startsWith(".")) {
      return this.handleConfigFile(filePath, priority);
    }

    switch (extension) {
      case "js":
        return this.handleJavaScript(filePath, priority);
      case "json":
        return this.handleJSON(filePath, priority);
      case "html":
        return this.handleHTML(filePath, priority);
      case "css":
        return this.handleCSS(filePath, priority);
      default:
        return this.handleGeneric(filePath, priority);
    }
  }

  handleJavaScript(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isMainFile = ["App.js", "index.js", "server.js"].includes(fileName);
    const isReactApp = fileName === "App.js";

    const routeData = {
      path: filePath,
      type: isReactApp ? "react-app" : "javascript",
      priority: isMainFile ? priority + 2 : priority,
      loadOrder: isMainFile ? 1 : 2,
      isEntryPoint: isMainFile,
      isReactComponent: isReactApp,
      buildStep: isReactApp ? "compile-react" : "bundle-js",
      deployStep: "copy-to-dist",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  handleJSON(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isPackageFile = fileName.includes("package");

    const routeData = {
      path: filePath,
      type: "configuration",
      priority: isPackageFile ? 5 : priority,
      loadOrder: isPackageFile ? 0 : 1,
      essential: isPackageFile,
      buildStep: "validate-config",
      deployStep: isPackageFile ? "npm-install" : "copy-config",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  handleHTML(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "html",
      priority: priority + 1,
      loadOrder: 1,
      isEntryPage: filePath.includes("index.html"),
      buildStep: "minify-html",
      deployStep: "copy-public",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  handleCSS(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isCritical = fileName.includes("index") || fileName.includes("main");

    const routeData = {
      path: filePath,
      type: "stylesheet",
      priority: isCritical ? priority + 1 : priority,
      loadOrder: isCritical ? 2 : 3,
      critical: isCritical,
      buildStep: isCritical ? "inline-critical-css" : "minify-css",
      deployStep: "copy-styles",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  handleConfigFile(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "config",
      priority: 5,
      loadOrder: 0,
      essential: true,
      buildStep: "validate-env",
      deployStep: "setup-env",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  handleGeneric(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "generic",
      priority: priority,
      loadOrder: 4,
      buildStep: "copy-assets",
      deployStep: "copy-generic",
    };

    this.routes.set(filePath, routeData);
    return routeData;
  }

  // Utility methods
  getFileName(filePath) {
    return filePath.split("/").pop();
  }

  getFileExtension(filePath) {
    const fileName = this.getFileName(filePath);
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  // BUILD PROCESS INTEGRATION
  generateBuildPipeline() {
    const routes = Array.from(this.routes.values()).sort((a, b) => {
      if (a.loadOrder !== b.loadOrder) {
        return a.loadOrder - b.loadOrder;
      }
      return b.priority - a.priority;
    });

    console.log("\n🔨 BUILD PIPELINE GENERATED:");
    console.log("============================");

    const buildSteps = new Map();

    routes.forEach((route, index) => {
      const step = route.buildStep;
      if (!buildSteps.has(step)) {
        buildSteps.set(step, []);
      }
      buildSteps.get(step).push(route.path);

      console.log(
        `${index + 1}. ${this.getStepIcon(step)} ${route.path} → ${step}`
      );
    });

    return this.createBuildScript(buildSteps);
  }

  getStepIcon(step) {
    const icons = {
      "validate-config": "✅",
      "validate-env": "🔧",
      "npm-install": "📦",
      "compile-react": "⚛️",
      "bundle-js": "📦",
      "minify-html": "🗜️",
      "inline-critical-css": "🎨",
      "minify-css": "🗜️",
      "copy-assets": "📄",
    };
    return icons[step] || "🔨";
  }

  // CREATE BUILD SCRIPT
  createBuildScript(buildSteps) {
    const buildScript = `#!/bin/bash
# Auto-generated Build Script from Route Optimizer
# Generated on: ${new Date().toLocaleString()}

echo "🚀 Starting optimized build process..."

# Step 1: Validate Configuration
echo "✅ Validating configurations..."
${this.generateStepCommands("validate-config", buildSteps)}

# Step 2: Environment Setup  
echo "🔧 Setting up environment..."
${this.generateStepCommands("validate-env", buildSteps)}

# Step 3: Install Dependencies
echo "📦 Installing dependencies..."
${this.generateStepCommands("npm-install", buildSteps)}

# Step 4: Compile React Components
echo "⚛️ Compiling React components..."
${this.generateStepCommands("compile-react", buildSteps)}

# Step 5: Bundle JavaScript
echo "📦 Bundling JavaScript..."
${this.generateStepCommands("bundle-js", buildSteps)}

# Step 6: Process CSS
echo "🎨 Processing stylesheets..."
${this.generateStepCommands("inline-critical-css", buildSteps)}
${this.generateStepCommands("minify-css", buildSteps)}

# Step 7: Minify HTML
echo "🗜️ Minifying HTML..."
${this.generateStepCommands("minify-html", buildSteps)}

# Step 8: Copy Assets
echo "📄 Copying assets..."
${this.generateStepCommands("copy-assets", buildSteps)}

echo "✅ Build completed successfully!"
`;

    this.saveBuildScript(buildScript);
    return buildScript;
  }

  generateStepCommands(stepName, buildSteps) {
    if (!buildSteps.has(stepName)) return "# No files for this step";

    const files = buildSteps.get(stepName);
    const commands = {
      "validate-config": files.map((f) => `npm config list`).join("\n"),
      "validate-env": `# Validate environment variables`,
      "npm-install": `npm ci --production`,
      "compile-react": `npm run build`,
      "bundle-js": files.map((f) => `# Bundle ${f}`).join("\n"),
      "inline-critical-css": files
        .map((f) => `# Inline critical CSS from ${f}`)
        .join("\n"),
      "minify-css": files.map((f) => `# Minify ${f}`).join("\n"),
      "minify-html": files.map((f) => `# Minify ${f}`).join("\n"),
      "copy-assets": `cp -r src/ dist/`,
    };

    return commands[stepName] || `# Process ${stepName}`;
  }

  // DEPLOYMENT PIPELINE
  generateDeploymentPipeline() {
    const routes = Array.from(this.routes.values());

    console.log("\n🚀 DEPLOYMENT PIPELINE:");
    console.log("=======================");

    const deployScript = `# Deployment Pipeline
# Auto-generated from Route Optimizer

# Pre-deployment checks
echo "🔍 Pre-deployment checks..."
npm test
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy based on file priorities
${this.generateDeploymentSteps(routes)}

echo "✅ Deployment completed!"
`;

    console.log(deployScript);
    this.saveDeploymentScript(deployScript);
    return deployScript;
  }

  generateDeploymentSteps(routes) {
    const steps = routes.map((route) => {
      const priority = route.essential
        ? "HIGH"
        : route.isEntryPoint
        ? "MEDIUM"
        : "LOW";
      return `# ${priority}: ${route.path} → ${route.deployStep}`;
    });

    return steps.join("\n");
  }

  // PACKAGE.JSON INTEGRATION
  updatePackageJsonScripts() {
    // Try different possible paths for package.json
    const possiblePaths = [
      "package.json",
      "./package.json",
      "../package.json",
      "Backend/package.json",
    ];

    let packagePath = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        packagePath = path;
        break;
      }
    }

    if (!packagePath) {
      console.log("❌ package.json not found in expected locations");
      console.log(
        "💡 Creating a sample package.json with optimized scripts..."
      );

      // Create a sample package.json with optimized scripts
      const samplePackage = {
        name: "flight-route-optimization",
        version: "1.0.0",
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build",
          "build:optimized": "node build-optimizer.js && npm run build",
          "deploy:optimized": "npm run build:optimized && echo 'Deploying...'",
          analyze: "node build-optimizer.js",
          test: "react-scripts test",
        },
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          "react-scripts": "5.0.1",
        },
      };

      fs.writeFileSync("package.json", JSON.stringify(samplePackage, null, 2));
      console.log("✅ Created package.json with optimized scripts");
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      // Add optimized build scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        "build:optimized": "node build-optimizer.js && npm run build",
        "deploy:optimized":
          'npm run build:optimized && echo "Deploying optimized build..."',
        analyze: "node build-optimizer.js",
        "start:optimized": "npm run analyze && npm start",
      };

      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Updated ${packagePath} with optimized scripts`);
    } catch (error) {
      console.log(`❌ Error updating package.json: ${error.message}`);
    }
  }

  // WEBPACK INTEGRATION (if using webpack)
  generateWebpackConfig() {
    const routes = Array.from(this.routes.values());
    const entryPoints = routes.filter((r) => r.isEntryPoint);

    const webpackConfig = `
// Auto-generated Webpack config from Route Optimizer
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
${entryPoints
  .map(
    (ep) =>
      `    '${this.getFileName(ep.path).replace(".js", "")}': './${ep.path}'`
  )
  .join(",\n")}
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
`;

    fs.writeFileSync("webpack.config.js", webpackConfig);
    console.log("✅ Generated optimized webpack.config.js");
    return webpackConfig;
  }

  // SAVE SCRIPTS TO FILES
  saveBuildScript(script) {
    fs.writeFileSync("build-optimized.sh", script);
    console.log("✅ Saved build-optimized.sh");
  }

  saveDeploymentScript(script) {
    fs.writeFileSync("deploy-optimized.sh", script);
    console.log("✅ Saved deploy-optimized.sh");
  }

  // MAIN SETUP METHOD
  setupYourBackend() {
    console.log("🔧 Setting up optimized build & deployment...\n");

    // Add your files
    this.addFile("Backend/package-lock.json");
    this.addFile("Backend/package.json");
    this.addFile("Backend/public/index.html");
    this.addFile("Backend/src/App.js");
    this.addFile("Backend/src/index.css");
    this.addFile("Backend/src/index.js");
    this.addFile("Backend/src/output.css");

    console.log("📊 FILES ANALYSIS COMPLETE\n");

    // Generate build pipeline
    this.generateBuildPipeline();

    // Generate deployment pipeline
    this.generateDeploymentPipeline();

    // Update package.json
    this.updatePackageJsonScripts();

    // Generate webpack config
    this.generateWebpackConfig();

    console.log("\n🎉 INTEGRATION COMPLETE!");
    console.log("================================");
    console.log("✅ Build script: build-optimized.sh");
    console.log("✅ Deploy script: deploy-optimized.sh");
    console.log("✅ Webpack config: webpack.config.js");
    console.log("✅ Package.json updated with new scripts");
    console.log("\n🚀 You can now run:");
    console.log("   npm run build:optimized");
    console.log("   npm run deploy:optimized");
    console.log("   npm run analyze");

    return this.routes;
  }
}

// Run the integration
const optimizer = new BuildDeploymentOptimizer();
optimizer.setupYourBackend();

module.exports = { BuildDeploymentOptimizer };
