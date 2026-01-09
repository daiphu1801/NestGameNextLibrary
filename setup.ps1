# Setup script for NestGame Next.js project

Write-Host "🎮 NestGame Next.js Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the NestGameNext directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1/4: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Setup environment
Write-Host "⚙️  Step 2/4: Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local and add your R2 URL" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env.local already exists" -ForegroundColor Blue
}
Write-Host ""

# Step 3: Copy game data
Write-Host "🎲 Step 3/4: Copying game data..." -ForegroundColor Yellow
$gamesJsPath = "..\assets\data\games.js"
if (Test-Path $gamesJsPath) {
    node -e "const data=require('../assets/data/games.js'); require('fs').writeFileSync('./src/data/games.json', JSON.stringify(data, null, 2))"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Game data copied successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to copy game data - you may need to do this manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Game data not found at ../assets/data/games.js" -ForegroundColor Yellow
    Write-Host "   You'll need to copy your games data manually to src/data/games.json" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Type check
Write-Host "🔍 Step 4/4: Running type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Type check found some issues (this is normal on first setup)" -ForegroundColor Yellow
}
Write-Host ""

# Final instructions
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your NEXT_PUBLIC_R2_URL" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Gray
Write-Host ""
