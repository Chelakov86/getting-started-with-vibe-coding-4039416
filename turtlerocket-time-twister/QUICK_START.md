# 🚀 Quick Start Guide - TurtleRocket Time Twister

## Installation & Running

```bash
cd turtlerocket-time-twister
npm install
npm start
```

Opens at: http://localhost:3000

## Features at a Glance

| Feature | Description | Shortcut |
|---------|-------------|----------|
| Energy Selector | Set hourly energy levels (8 AM - 8 PM) | - |
| File Upload | Import .ics calendar files | - |
| Optimize | Match tasks to energy levels | `Ctrl/Cmd + O` |
| Compare | View before/after side-by-side | - |
| Export | Download optimized calendar | - |
| Reset Energy | Return to default levels | `Ctrl/Cmd + R` |

## User Workflow

1. **Set Energy** → Click hour blocks (High/Medium/Low)
2. **Upload** → Choose .ics file or drag & drop
3. **Review** → See classified events
4. **Optimize** → Click button or press Ctrl/Cmd+O
5. **Compare** → View optimization results
6. **Export** → Download optimized calendar
7. **Import** → Add to your calendar app

## Testing

```bash
npm test                              # Run tests
npm test -- --coverage --watchAll=false  # With coverage
npm run build                         # Production build
```

## Sample File

Use `public/sample-calendar.ics` for testing

## Tech Stack

- React 19.2 + TypeScript
- ical.js for ICS parsing
- CSS Modules for styling
- React Testing Library

## Project Status

✅ Production Ready
✅ All Features Integrated
✅ 375+ Tests Passing
✅ Accessible (WCAG 2.1 AA)
✅ Responsive Design
✅ Error Handling
✅ Performance Optimized

## Support

- README.md - Full documentation
- INTEGRATION_COMPLETE.md - Technical details
- Inline comments - Code documentation

---

**Happy Optimizing! 🐢🚀**
