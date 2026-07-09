# Setup Backend
Write-Host "Initializing Backend..."
New-Item -ItemType Directory -Force -Path "backend"
Set-Location "backend"
npm init -y
npm i express mongoose cors dotenv bcryptjs jsonwebtoken zod socket.io cloudinary
npm i -D typescript @types/node @types/express ts-node nodemon eslint prettier
npx tsc --init
Set-Location ..

# Setup Admin
Write-Host "Initializing Admin..."
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

# Setup Website
Write-Host "Initializing Website..."
npx create-next-app@latest website --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

# Setup Mobile
Write-Host "Initializing Mobile (React Native)..."
npx @react-native-community/cli@latest init mobile --template react-native-template-typescript --skip-install --yes

Write-Host "Project Setup Complete."
