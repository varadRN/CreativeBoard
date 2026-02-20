Write-Host "🚀 Starting CreativeBoard Setup & Run..." -ForegroundColor Cyan

# Check for Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it from https://nodejs.org/"
    exit
}

# 1. Server Setup
Write-Host "`n📦 Setting up Server..." -ForegroundColor Yellow
Set-Location "server"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..."
    npm install
}

# 2. Database Setup
Write-Host "`n🗄️  Setting up Database..." -ForegroundColor Yellow
# Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Warning "No .env file found in server directory! Copying .env.example if it exists, otherwise please create one."
}

try {
    Write-Host "Running Prisma Migrations..."
    npx prisma migrate dev --name init
    Write-Host "Database ready!" -ForegroundColor Green
} catch {
    Write-Error "Database migration failed. Make sure PostgreSQL is running and connection string is correct."
    # Don't exit, might be already running
}

# 3. Client Setup
Write-Host "`n🎨 Setting up Client..." -ForegroundColor Yellow
Set-Location "../client"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing client dependencies..."
    npm install
}

# 4. Start Applications
Write-Host "`n🚀 Launching Applications..." -ForegroundColor Green

# Start Server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/../server'; npm run dev"
Write-Host "Server started in new window (Port 5000)"

# Start Client in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
Write-Host "Client started in new window (Port 5173)"

Write-Host "`n✨ Setup Complete!" -ForegroundColor Cyan
Write-Host "The application should open in your browser shortly."
Write-Host "Local: http://localhost:5173"

# Return to root
Set-Location ".."
