# 🐢🚀 TurtleRocket Time Twister

**Optimize your schedule based on your energy levels**

TurtleRocket Time Twister is a smart calendar optimization tool that reorganizes your schedule to match tasks with your natural energy patterns throughout the day. Upload your calendar, set your energy levels, and get an optimized schedule that aligns high-energy tasks with your peak performance hours.

## ✨ Features

- 📅 **ICS File Support** - Import calendars from Google Calendar, Outlook, Apple Calendar, and more
- 🎯 **Smart Classification** - Automatically categorizes events as Heavy, Medium, or Light cognitive load
- ⚡ **Energy-Based Optimization** - Matches tasks to your energy levels throughout the day
- 📊 **Visual Comparison** - Side-by-side view of original vs. optimized schedule
- 💾 **Export Optimized Schedule** - Download your optimized calendar as an ICS file
- 💪 **Persistent State** - Your energy levels are saved locally
- ⌨️ **Keyboard Shortcuts** - Quick actions for power users
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessibility** - WCAG 2.1 compliant with full keyboard navigation
- 🎨 **Beautiful UI** - Modern, polished interface with smooth transitions

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

\`\`\`bash
# Navigate to project directory
cd turtlerocket-time-twister

# Install dependencies
npm install

# Start development server
npm start
\`\`\`

The app will open at [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### Step 1: Set Your Energy Levels

Define your energy levels for each hour of the day (8 AM - 8 PM):
- 🔴 **High** - Peak focus and productivity
- 🟡 **Medium** - Moderate energy and attention
- 🟢 **Low** - Relaxed, suitable for lighter tasks

### Step 2: Upload Your Calendar

1. Click "Choose File" or drag-and-drop your \`.ics\` calendar file
2. The app will automatically parse and classify your events
3. View your current schedule with cognitive load indicators

### Step 3: Optimize Your Schedule

1. Click "Optimize Schedule" or press \`Ctrl/Cmd + O\`
2. Review the side-by-side comparison of original vs. optimized schedules
3. See detailed metrics about how your schedule was improved

### Step 4: Export Your Optimized Calendar

1. Click "Export Optimized Calendar"
2. Import the downloaded \`.ics\` file into your calendar application
3. Enjoy your optimized schedule!

## 🎮 Keyboard Shortcuts

- \`Ctrl/Cmd + O\` - Optimize schedule
- \`Ctrl/Cmd + R\` - Reset energy levels to default
- \`Tab\` - Navigate between interactive elements

## 🧪 Testing

Run the comprehensive test suite:

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- App.integration.test
\`\`\`

### Test Coverage

- ✅ Unit tests for all utility functions
- ✅ Component integration tests
- ✅ End-to-end user flow tests
- ✅ Error handling scenarios
- ✅ Performance benchmarks
- ✅ Accessibility compliance

## 🚀 Production Build

\`\`\`bash
npm run build
\`\`\`

The optimized production build will be in the \`build/\` folder.

---

Made with ❤️ by the TurtleRocket Team

**Happy Optimizing! 🐢🚀**
