# Momentum

<div align="center">

<img src="path/to/logo.png" alt="Momentum Logo" width="200"/>

**A powerful, intuitive, and beautiful task management application built with modern web technologies.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-319795?style=flat-square&logo=chakra-ui&logoColor=white)](https://chakra-ui.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

## Overview

Momentum is a modern task management application that combines powerful features with an intuitive interface. Built with React and TypeScript, it offers both Kanban and List views, keyboard shortcuts, and smart filtering capabilities.

## Features

### Core Features

- **Task Management**
  - Create, edit, and delete tasks
  - Rich text descriptions
  - Priority levels (Low, Medium, High)
  - Due date management
  - Status tracking (Pending, In Progress, Completed)

### Modern UI/UX

- **Flexible Views**
  - Kanban board for visual task management
  - List view for detailed organization
  - Smooth transitions between views

- **Drag and Drop**
  - Intuitive task reordering
  - Cross-column task movement
  - Status updates via drag and drop

### Power Features

- **Keyboard Shortcuts**

  | Action | Shortcut |
  |--------|----------|
  | Quick Search | `⌘/Ctrl + K` |
  | New Task | `⌘/Ctrl + N` |
  | Use Template | `⌘/Ctrl + T` |
  | Toggle View | `⌘/Ctrl + /` |
  | Select Mode | `⌘/Ctrl + S` |
  | Select All | `⌘/Ctrl + A` |
  | Clear Selection | `Esc` |

- **Smart Filtering**
  - Status-based filtering
  - Priority-based filtering
  - Full-text search
  - Multiple filter combinations

- **Bulk Operations**
  - Multi-select tasks
  - Batch status updates
  - Bulk delete
  - Title case conversion

### Templates & Workflows

- Pre-defined task templates
- Quick workflow setup
- Custom template creation
- Template categories

### Accessibility

- Dark/Light mode with system detection
- Keyboard navigation support
- Screen reader optimized
- ARIA labels and roles
- High contrast mode

## Tech Stack

### Frontend
```
React 18          → Modern UI library
TypeScript        → Type safety
Chakra UI         → Component library
Framer Motion     → Smooth animations
@dnd-kit         → Drag and drop functionality
date-fns         → Date manipulation
Vite             → Build tool
```

### Backend
```
Node.js          → Runtime environment
Express          → Web framework
TypeScript       → Type safety
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/momentum.git
   cd momentum
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd client && npm install

   # Backend dependencies
   cd ../server && npm install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start frontend
   cd client && npm run dev

   # Terminal 2: Start backend
   cd server && npm run dev
   ```

4. **Open application**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```plaintext
momentum/
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── types/       # TypeScript definitions
│   │   └── utils/       # Helper functions
│   └── ...
├── server/               # Backend application
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Data models
│   │   └── utils/       # Helper functions
│   └── ...
└── ...
```

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Chakra UI](https://chakra-ui.com/) - Beautiful and accessible component library
- [Framer Motion](https://www.framer.com/motion/) - Powerful animation library
- [dnd kit](https://dndkit.com/) - Flexible drag and drop toolkit

---

<div align="center">
<sub>Built with ❤️ by Your Name</sub>
</div> 