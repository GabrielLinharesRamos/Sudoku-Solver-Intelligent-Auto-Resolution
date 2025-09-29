# 🧩 Sudoku Solver - Intelligent Auto-Resolution

<div align="center">
  <img src="public/favicon.svg" alt="Sudoku Solver Logo" width="80" height="80">
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  
  **A modern and interactive web application for solving Sudoku puzzles with advanced AI features**
</div>

---

## 🎯 Project Purpose

Sudoku Solver is a cutting-edge web application designed to provide an intelligent and interactive Sudoku-solving experience. The application combines modern web technologies with advanced algorithmic techniques to create a seamless puzzle-solving environment that both educates and entertains users.

**Main Objectives:**
- Provide an intuitive interface for Sudoku puzzle interaction
- Implement intelligent auto-solving capabilities using advanced algorithms
- Offer educational insights into Sudoku-solving techniques
- Deliver a responsive and accessible user experience across all devices

---

## ✨ Key Features

### 🤖 **Intelligent Auto-Solving System**
Advanced algorithm implementation featuring multiple solving techniques:
- **Naked Singles**: Identifies cells with only one possible value
- **Hidden Singles**: Finds numbers that can only go in one position within a row, column, or box
- **Box/Line Reduction**: Eliminates candidates using constraint propagation

### 🔍 **Candidates Mode**
- Visual display of possible numbers for each empty cell
- Real-time candidate calculation and updates
- Interactive candidate visualization with grid overlay

### ⚡ **Real-Time Validation**
- Instant conflict detection with visual error highlighting
- Dynamic board validation as you type
- Smart error indication with pulsing animations

### 🎨 **Modern User Interface**
- Responsive design optimized for all screen sizes
- Smooth animations and visual feedback
- Clean, minimalist aesthetic with intuitive controls
- Custom favicon with tic-tac-toe theme

### ⌨️ **Enhanced Navigation**
- Full keyboard support with arrow key navigation
- Numeric keypad input for quick number entry
- Focus management with visual indicators

### 🧹 **Utility Features**
- One-click board clearing functionality
- Toggle between solving modes
- Persistent state management

---

## 🛠️ Implemented Technologies

### **Frontend Framework**
- **Next.js 15.5.4** - React framework with App Router for optimal performance and SEO
- **React 19.1.0** - Latest React version with enhanced concurrent features

### **Language & Type Safety**
- **TypeScript 5.0** - Static type checking for robust code quality and developer experience

### **Styling & UI**
- **Tailwind CSS 4.0** - Utility-first CSS framework for rapid UI development
- **Lucide React 0.544.0** - Beautiful, customizable SVG icons

### **Development Tools**
- **ESLint 9.0** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization

### **Core Algorithms**
- **Custom Sudoku Solver Engine** - Proprietary implementation of advanced solving techniques
- **Constraint Satisfaction Problem (CSP)** - Mathematical approach to puzzle solving
- **Backtracking Algorithm** - Fallback solving method for complex puzzles

---

## 📦 Installation Guide

### **Prerequisites**
Ensure you have the following installed on your system:
- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Git** for version control

### **Step-by-Step Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/sudoku-solver.git
   cd sudoku-solver
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Verify Installation**
   ```bash
   npm run build
   ```

### **Configuration Requirements**
- No additional configuration files needed
- All dependencies are managed through `package.json`
- TypeScript configuration is pre-configured in `tsconfig.json`

---

## 🚀 Running the Application

### **Development Mode**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### **Production Build**
```bash
npm run build
npm run start
# or
yarn build
yarn start
```

### **Linting**
```bash
npm run lint
# or
yarn lint
```

### **Troubleshooting Common Issues**

**Port Already in Use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or specify different port
npm run dev -- -p 3001
```

**Node Version Issues:**
```bash
# Check Node version
node --version
# Update to latest LTS
nvm install --lts
nvm use --lts
```

**Dependency Conflicts:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Usage Examples

### **Basic Sudoku Solving**
1. **Input Numbers**: Click on any cell and enter numbers 1-9
2. **Navigate**: Use arrow keys to move between cells
3. **Auto-Solve**: The system automatically fills in obvious solutions
4. **View Candidates**: Click the "👁️ Candidates" button to see possible numbers

### **Keyboard Shortcuts**
- **Arrow Keys**: Navigate between cells
- **1-9**: Enter numbers directly
- **Backspace/Delete**: Clear cell content
- **Escape**: Clear current selection

### **Expected Behaviors**
- **Real-time Validation**: Invalid entries are highlighted in red
- **Auto-completion**: System-solved cells appear in gray
- **User Input**: Your entries appear in blue
- **Candidate Display**: Small numbers show possible values

### **Example Interaction Flow**
```
1. Load the application → Empty 9x9 Sudoku grid appears
2. Click on a cell → Cell becomes focused with blue border
3. Type a number → Number appears in blue (user input)
4. System automatically → Fills obvious solutions in gray
5. Toggle candidates → See possible numbers for empty cells
6. Clear board → Reset to start over
```

---

## 🎮 Advanced Features

### **Intelligent Resolution Modes**
- **Passive Mode**: System suggests moves without auto-filling
- **Active Mode**: Automatic solving with visual feedback
- **Educational Mode**: Step-by-step solving with explanations

### **Algorithm Insights**
The solver implements multiple techniques in order of complexity:
1. **Naked Singles** - Cells with only one candidate
2. **Hidden Singles** - Numbers with only one position
3. **Intersection Removal** - Box/line interactions
4. **Backtracking** - Brute force for difficult puzzles

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Sudoku puzzle algorithms inspired by constraint satisfaction research
- UI/UX design principles from modern web applications
- Community feedback and testing contributions

---

<div align="center">
  <p><strong>Built with ❤️ using Next.js and React</strong></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
