# GEMINI.md - Project: TurtleRocket Time Twister

## Project Overview

This project, "TurtleRocket Time Twister," is a single-page React application designed to optimize calendar schedules. It allows users to import their calendars as `.ics` files, define their daily energy levels, and receive an optimized schedule based on the cognitive load of their events.

The application classifies calendar events as "heavy," "medium," or "light" based on keyword matching within the event titles. It then reorganizes the schedule to align high-energy tasks with periods of high user-defined energy and low-energy tasks with periods of low energy.

**Key Technologies:**

*   **Frontend:** React with TypeScript
*   **Calendar Parsing:** `ical.js`
*   **Styling:** CSS Modules or a similar solution
*   **Testing:** Jest and React Testing Library

**Architecture:**

The application follows a standard React project structure:

*   `src/components`: Reusable UI components (e.g., `EnergySelector`, `FileUpload`).
*   `src/utils`: Helper functions for tasks like ICS parsing, event classification, and schedule optimization.
*   `src/types`: TypeScript interfaces and type definitions.
*   `src/config`: Configuration files, such as keyword lists for event classification.
*   `src/__tests__`: Test files for components and utility functions.

## Building and Running

This is a standard Create React App project.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm start
    ```
    This will open the application at `http://localhost:3000`.

3.  **Run Tests:**
    ```bash
    npm test
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## Development Conventions

*   **Test-Driven Development (TDD):** The project emphasizes writing tests before or alongside implementation. The `Todos.md` file outlines a detailed, test-driven approach for each feature.
*   **Iterative Development:** Features are broken down into small, manageable iterations, each with its own set of tests.
*   **Atomic Commits:** Commits should be small, focused, and descriptive.
*   **Folder Structure:** Adhere to the established folder structure for components, utils, types, and tests.
*   **State Management:** The core application state is managed within the main `App.tsx` component, with state-related logic potentially abstracted into helper functions.
