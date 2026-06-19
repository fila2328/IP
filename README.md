# 🎓 School Feedback System

![School Feedback Website](https://img.icons8.com/clouds/800/000000/feedback.png)

![School Feedback System](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

A comprehensive, responsive, and secure **School Feedback System** designed to facilitate seamless communication between students and school administrators.

> Empower students with anonymous teacher feedback, help administrators manage departments and users, and deliver a modern education experience with a polished dashboard.

---

## ✨ Features

### 👨‍🎓 For Students
*   **Secure Authentication:** Seamless login and registration process with department assignment.
*   **Teacher Evaluation:** Submit detailed feedback for teachers within your respective department.
*   **Interactive Feedback:** Like and interact with submitted feedback dynamically.
*   **Real-time Search:** Effortlessly search and filter through teachers in your department.
*   **Anonymity:** Ensure your voice is heard securely and anonymously.

### 👨‍💼 For Administrators
*   **Centralized Dashboard:** A powerful control center to monitor system-wide statistics and metrics.
*   **Department Management:** Dynamically create, manage, and delete school departments.
*   **Student Management:** View the list of registered students and manage their accounts (including associated feedback).
*   **Global Search:** A unified search bar to quickly find students, teachers, or specific feedback records.
*   **Data Integrity:** Cleanly structured backend controllers and services ensuring data consistency when records are modified or deleted.

---

## � Screenshot Preview

![Dashboard Screenshot](assets/dashboard-screenshot.svg)

A clean and modern interface preview showing the student/admin dashboard, quick metrics, and feedback controls.

---

## �🛠️ Technology Stack

**Frontend:**
*   HTML5 (Semantic & Accessible)
*   Vanilla CSS3 (Custom styling, animations, responsive design)
*   Vanilla JavaScript (DOM manipulation, asynchronous API calls)
*   [FontAwesome](https://fontawesome.com/) (Icons)
*   [Google Fonts](https://fonts.google.com/) (Poppins)

**Backend:**
*   [Node.js](https://nodejs.org/)
*   [Express.js](https://expressjs.com/) (RESTful API architecture)
*   CORS (Cross-Origin Resource Sharing)

---

## 📂 Project Structure

```text
📦 School-Feedback-System
 ┣ 📂 backend
 ┃ ┣ 📂 controllers     # Request handlers and business logic routing
 ┃ ┣ 📂 data            # Data models and file-based storage
 ┃ ┣ 📂 services        # Core business logic and database operations
 ┃ ┣ 📜 package.json    # Backend dependencies and scripts
 ┃ ┗ 📜 server.js       # Entry point for the Express server
 ┣ 📂 frontend
 ┃ ┣ 📜 index.html      # Authentication portal (Login/Register)
 ┃ ┣ 📜 script.js       # Authentication logic
 ┃ ┣ 📜 style.css       # Authentication styling
 ┃ ┣ 📜 DashBoard.html  # Main application dashboard (Student/Admin)
 ┃ ┣ 📜 dashboard.js    # Dashboard UI logic and API integration
 ┃ ┗ 📜 dashboard.css   # Dashboard styling
 ┗ 📜 README.md         # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) installed on your local machine (v14.x or higher recommended).

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd Project/IP
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Install backend dependencies:**
    ```bash
    npm install
    ```

4.  **Start the Express Server:**
    ```bash
    npm start
    ```
    *The server will typically run on `http://localhost:3000` or the port specified in your environment.*

5.  **Launch the Frontend:**
    *   Since the frontend uses vanilla HTML/CSS/JS, you can simply open the `frontend/index.html` file in any modern web browser.
    *   Alternatively, use a local development server like VS Code's "Live Server" extension for a better experience.

---

## 💡 Architecture Notes

The backend of this system was recently refactored to use a clean, decoupled **Controller and Service Architecture**. This ensures that the routing logic (Controllers) is kept separate from the business and data manipulation logic (Services), resulting in a highly maintainable and scalable codebase. 

---

## 🛡️ License

This project is licensed under the MIT License.

---
*Designed with ♥ for better education.*