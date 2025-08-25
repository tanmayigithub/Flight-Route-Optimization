// Backend Route Optimizer - Clean Implementation
// Save this as: Backend/route-optimizer.js

class BackendRouteOptimizer {
  constructor() {
    this.routes = new Map();
  }

  // Add any backend file with automatic type detection
  addFile(filePath, priority = 2) {
    const fileName = this.getFileName(filePath);
    const extension = this.getFileExtension(filePath);

    // Handle special files without extensions
    if (fileName.startsWith(".")) {
      return this.handleConfigFile(filePath, priority);
    }

    // Handle different file types
    switch (extension) {
      case "js":
        return this.handleJavaScript(filePath, priority);
      case "json":
        return this.handleJSON(filePath, priority);
      case "html":
        return this.handleHTML(filePath, priority);
      case "css":
        return this.handleCSS(filePath, priority);
      case "env":
        return this.handleEnvironment(filePath, priority);
      case "md":
        return this.handleDocumentation(filePath, priority);
      default:
        return this.handleGeneric(filePath, priority);
    }
  }

  // JavaScript file handler
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
      description: isReactApp
        ? "React App component"
        : isMainFile
        ? "Main JavaScript file"
        : "JavaScript module",
    };

    this.routes.set(filePath, routeData);
    console.log(
      `✅ Added JS: ${filePath} ${isMainFile ? "(ENTRY POINT)" : ""} ${
        isReactApp ? "(REACT APP)" : ""
      }`
    );
    return routeData;
  }

  // JSON file handler
  handleJSON(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isPackageFile = fileName.includes("package");

    const routeData = {
      path: filePath,
      type: "configuration",
      priority: isPackageFile ? 5 : priority,
      loadOrder: isPackageFile ? 0 : 1,
      essential: isPackageFile,
      description: isPackageFile ? "Package configuration" : "JSON data",
    };

    this.routes.set(filePath, routeData);
    console.log(
      `✅ Added JSON: ${filePath} ${isPackageFile ? "(ESSENTIAL)" : ""}`
    );
    return routeData;
  }

  // Environment file handler
  handleEnvironment(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "environment",
      priority: 5,
      loadOrder: 0,
      essential: true,
      sensitive: true,
      description: "Environment variables",
    };

    this.routes.set(filePath, routeData);
    console.log(`✅ Added ENV: ${filePath} (CRITICAL)`);
    return routeData;
  }

  // Config files (.gitignore, .env, etc.)
  handleConfigFile(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isEnv = fileName === ".env";

    const routeData = {
      path: filePath,
      type: "config",
      priority: isEnv ? 5 : priority,
      loadOrder: isEnv ? 0 : 3,
      essential: isEnv,
      description: `Configuration file (${fileName})`,
    };

    this.routes.set(filePath, routeData);
    console.log(`✅ Added config: ${filePath} ${isEnv ? "(CRITICAL)" : ""}`);
    return routeData;
  }

  // HTML file handler
  handleHTML(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "html",
      priority: priority + 1,
      loadOrder: 1,
      isEntryPage: filePath.includes("index.html"),
      description: "HTML page",
    };

    this.routes.set(filePath, routeData);
    console.log(
      `✅ Added HTML: ${filePath} ${
        routeData.isEntryPage ? "(ENTRY PAGE)" : ""
      }`
    );
    return routeData;
  }

  // CSS file handler
  handleCSS(filePath, priority) {
    const fileName = this.getFileName(filePath);
    const isCritical = fileName.includes("index") || fileName.includes("main");

    const routeData = {
      path: filePath,
      type: "stylesheet",
      priority: isCritical ? priority + 1 : priority,
      loadOrder: isCritical ? 2 : 3,
      critical: isCritical,
      description: isCritical ? "Critical CSS" : "CSS stylesheet",
    };

    this.routes.set(filePath, routeData);
    console.log(`✅ Added CSS: ${filePath} ${isCritical ? "(CRITICAL)" : ""}`);
    return routeData;
  }

  // Documentation handler
  handleDocumentation(filePath, priority) {
    const routeData = {
      path: filePath,
      type: "documentation",
      priority: 1,
      loadOrder: 5,
      description: "Documentation file",
    };

    this.routes.set(filePath, routeData);
    console.log(`✅ Added docs: ${filePath}`);
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

  // Get optimized loading order
  getOptimizedOrder() {
    const routes = Array.from(this.routes.values()).sort((a, b) => {
      if (a.loadOrder !== b.loadOrder) {
        return a.loadOrder - b.loadOrder;
      }
      return b.priority - a.priority;
    });

    console.log("\n🚀 OPTIMIZED LOADING ORDER:");
    console.log("===========================");

    routes.forEach((route, index) => {
      const priority = route.essential
        ? "🔥"
        : route.isEntryPoint
        ? "⭐"
        : route.isEntryPage
        ? "🌐"
        : route.critical
        ? "🎨"
        : route.isReactComponent
        ? "⚛️"
        : "📄";
      console.log(
        `${index + 1}. ${priority} ${route.path} - ${route.description}`
      );
    });

    return routes;
  }

  // Add all your current backend files
  setupYourBackend() {
    console.log("🔧 Setting up your current backend files...\n");

    // Backend root files
    this.addFile("Backend/package-lock.json");
    this.addFile("Backend/package.json");

    // Public folder (frontend assets)
    this.addFile("Backend/public/index.html");

    // Src folder (main application code)
    this.addFile("Backend/src/App.js");
    this.addFile("Backend/src/index.css");
    this.addFile("Backend/src/index.js");
    this.addFile("Backend/src/output.css");

    console.log(`\n✨ Successfully added ${this.routes.size} files!`);
    return this.getOptimizedOrder();
  }

  // Get summary report
  getSummary() {
    const routes = Array.from(this.routes.values());
    const summary = {
      totalFiles: routes.length,
      essential: routes.filter((r) => r.essential).length,
      entryPoints: routes.filter((r) => r.isEntryPoint).length,
      fileTypes: {},
    };

    routes.forEach((route) => {
      summary.fileTypes[route.type] = (summary.fileTypes[route.type] || 0) + 1;
    });

    console.log("\n📊 BACKEND SUMMARY:");
    console.log(`Total files: ${summary.totalFiles}`);
    console.log(`Essential files: ${summary.essential}`);
    console.log(`Entry points: ${summary.entryPoints}`);
    console.log("File types:", summary.fileTypes);

    return summary;
  }
}

// HOW TO USE THIS:
// ================

// 1. Create the optimizer
const optimizer = new BackendRouteOptimizer();

// 2. Setup all your backend files
const optimizedOrder = optimizer.setupYourBackend();

// 3. Get summary
const summary = optimizer.getSummary();

// 4. If you want to add more files later:
// optimizer.addFile('Backend/routes/users.js', 3);
// optimizer.addFile('Backend/middleware/auth.js', 4);

// 5. Export for use in other files
module.exports = { BackendRouteOptimizer, optimizer };

// USAGE IN YOUR SERVER.JS:
// ========================
/*
const { optimizer } = require('./route-optimizer');

// Get the optimized loading order for your app
const loadOrder = optimizer.getOptimizedOrder();

// Use this order to structure your server startup
console.log('Starting server with optimized file loading...');
*/
