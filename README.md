# CreativeBoard

CreativeBoard is a real-time collaborative whiteboard web application designed for teams to design, and create together in a seamless, high-performance environment.

## 🚀 Key Features

- **Real-time Collaboration**: Multiple users can draw, erase, and manipulate objects simultaneously with instant synchronization powered by Yjs and Socket.io.
- **Drawing Tools**:
  - Freehand drawing with smooth curves.
  - Shape tools (Rectangle, Circle, Triangle, Line).
  - Text annotations.
  - Move, scale, and rotate objects.
  - Undo/Redo support.
- **User Management**:
  - Secure authentication with JWT.
  - Email verification and password reset functionality.
  - User profiles and cursors with identifiable colors.
- **Board Management**:
  - Personal dashboard to manage multiple boards.
  - Star your favorite boards for quick access.
  - Real-time thumbnails.
- **Secure Sharing**:
  - Share boards via unique links.
  - Granular permissions (Viewer vs. Editor).
- **Modern UI**:
  - Sleek, premium design with Tailwind CSS v4.
  - Smooth animations using Framer Motion.
  - Dark-mode optimized theme by default.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Canvas Engine**: [Fabric.js](http://fabricjs.com/)
- **Collaboration/CRDT**: [Yjs](https://yjs.dev/) & [y-websocket](https://github.com/yjs/y-websocket)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Real-time Communication**: [Socket.io-client](https://socket.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache/Pub-Sub**: [Redis](https://redis.io/)
- **Real-time Communication**: [Socket.io](https://socket.io/)
- **Authentication**: JWT 

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)


### Quick Start (Windows)
Run the PowerShell script to start:

```powershell
./start_app.ps1



## Manual Setup

git clone https://github.com/varadRN/CreativeBoard.git
cd CreativeBoard

cd client && npm install
cd ../server && npm install

cd client && npm run dev
cd server && npm run dev



## Project Structure

CreativeBoard/
├── client/                 # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/           # API clients, Fabric.js utils
│   │   ├── pages/
│   │   ├── stores/        # Zustand
│   │   ├── styles/
│   │   └── types/
│   └── public/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── websocket/     # Socket.IO sync
│   │   ├── prisma/
│   │   ├── scripts/
│   │   └── validators/    # Zod
│   └── prisma/
├── LICENSE
├── start_app.ps1
├── TODO.md
└── README.md

