Bike Management System

This project consists of two separate client applications:

📱 Mobile application (Bike App) – built with React Native (Expo)

💻 Admin panel (Web) – built with Angular

📦 Data layer – simulated using JSON Server (no database required)

The system is designed so that end users interact with the system via the mobile app, while administrators manage data through the web interface.

For the purposes of this project, a traditional database is not used. Data is stored locally using JSON Server, ensuring functional consistency during runtime.

Architecture:
Mobile App (Expo)
        ↓
   REST API (JSON Server)
        ↑
Admin Panel (Angular)

The mobile app sends HTTP requests (POST/GET) to JSON Server
The admin panel consumes the same API
Images are stored as Base64 strings inside JSON (no backend storage service)

Technologies Used:
React Native (Expo)
Angular
TypeScript
JSON Server


Start JSON Server: Navigate to the root (or where db.json is located):
npx json-server --watch db.json --port 3000 --host 0.0.0.0

Run Mobile App (Expo):
npm install
npx expo start

Run Admin Panel (Angular):
npm install
ng serve



