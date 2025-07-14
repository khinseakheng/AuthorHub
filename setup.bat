@echo off
echo 🚀 Setting up AuthorHub...

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

:: Backend setup
echo 📦 Setting up backend...
cd backend

:: Copy environment file
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file
)

:: Install dependencies
echo 📥 Installing backend dependencies...
call npm install

:: Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

:: Run database migrations
echo 🗄️ Running database migrations...
call npx prisma migrate dev --name init

echo ✅ Backend setup complete!

:: Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend

:: Install dependencies
echo 📥 Installing frontend dependencies...
call npm install

echo ✅ Frontend setup complete!

cd ..

echo 🎉 AuthorHub setup complete!
echo.
echo 📋 Next steps:
echo 1. Start the backend: cd backend && npm run dev
echo 2. Start the frontend: cd frontend && npm start
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 API Documentation will be available at: http://localhost:3001/api-docs
pause
