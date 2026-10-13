# CODEVOYAGE — Project Viva & Explanation Guide
> **Simple, Clear, and Direct Answers for Project Presentation & Viva Voce**

---

## 1. Project Overview in Simple Words (Elevator Pitch)

> **"What is CODEVOYAGE?"**
> 
> **CODEVOYAGE** is a gamified, space-themed web application designed to teach authentic **Java 21** programming. Instead of dry theoretical exercises, students become starship cadets navigating space stations and celestial hazards. To fix life support, power up ion engines, or navigate asteroid fields, students write, compile, and execute real Java code in an integrated code editor with real-time feedback from an AI-style companion named **B.Y.T.E.**

---

## 2. Real-World Problem It Solves

- **The Problem:** Beginners often find learning Java intimidating due to verbose syntax (`public static void main`, types, imports) and unhelpful compiler errors.
- **The Solution:** 
  1. **Gamified Pedagogy:** Breaks learning into bite-sized missions, giving students visual progress, XP points, and star ratings.
  2. **Safe Code Execution:** Provides a dedicated sandbox compiler so students execute real Java code without needing local IDE setups or risking the main server's security.
  3. **Friendly Error Translation:** Translates cryptic Java compiler and runtime stack traces into plain English advice.

---

## 3. High-Level Architecture & Working (How It Works)

The system follows a **3-tier micro-modular architecture**:

```
[ Frontend: React + Vite ] (Port 5173)
         │
         │  1. HTTP/REST + JWT Bearer Token
         ▼
[ Backend: Spring Boot 3.2.5 ] (Port 8080)
         │
         │  2. Internal REST Call (Code + Test Cases + Stdin)
         ▼
[ Execution Service: Node.js / JDK 21 Sandbox ] (Port 5050)
         │
         │  3. Compiles (`javac`) & Runs (`java`) in an isolated temp environment
         ▼
[ Results & Output ] ──▶ Evaluated in Backend ──▶ Returned to Frontend
```

### Step-by-Step Flow of Code Submission:
1. **User Types Code:** The student writes Java code in the browser using the embedded **Monaco Editor** (the same editor engine powering VS Code).
2. **Submission to Backend:** When the student clicks **"Run"** or **"Submit"**, the frontend sends a secure `POST` request to the Spring Boot REST API along with the student's JWT token.
3. **Delegation to Sandbox:** Spring Boot validates the request and forwards the raw Java code to the **isolated Execution Service**.
4. **Sandboxed Compilation & Execution:**
   - The execution service generates a unique temporary directory.
   - It runs `javac Solution.java` to compile the code.
   - If compilation succeeds, it executes `java -Xmx128m Solution` with memory caps (`128MB`) and a strict timeout (`5000ms`) to protect against infinite loops or resource starvation.
5. **Grading & Evaluation:** The output is returned to Spring Boot, which compares it against visible and hidden test cases.
6. **Progress & Gamification:** If all test cases pass:
   - XP, Stars (1 to 3 stars based on attempts and hint usage), and Badges/Commendations are awarded.
   - The next mission is unlocked sequentially.
7. **Feedback:** The frontend renders live test results, output diffs, and encouraging comments from the robot companion **B.Y.T.E.**.

---

## 4. All Tools & Technologies Used (Categorized)

| Category | Technology / Tool | Why We Used It (Viva Justification) |
|---|---|---|
| **Frontend UI** | **React 18** & **TypeScript** | For building a fast, modular Single Page Application (SPA) with type safety. |
| **Build Tool** | **Vite** | Ultra-fast development server and bundle optimization compared to older Webpack. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework enabling high-tech glassmorphism, responsive sci-fi HUDs, and clean UI components. |
| **Code Editor** | **Monaco Editor** | The core editor behind VS Code; provides Java syntax highlighting, line numbers, and keyboard shortcuts. |
| **Animation & Icons**| **Framer Motion** & **Lucide React** | Smooth UI transitions, interactive modals, and clean modern vector icons. |
| **HTTP Client** | **Axios** | Handles API communication with backend, including automatic JWT token interceptors. |
| **Routing** | **React Router DOM v7** | Handles client-side navigation (Dashboard, Galaxy Map, Mission Experience, Profile). |
| **Backend API** | **Spring Boot 3.2.5 (Java 21)** | Enterprise-grade RESTful API framework with robust dependency injection, security, and data handling. |
| **Security** | **Spring Security & JJWT (0.12.5)** | Stateless authentication using JSON Web Tokens (JWT) and BCrypt password encryption. |
| **Database ORM** | **Spring Data JPA / Hibernate** | Object-Relational Mapping to interact with databases using Java entities without writing raw SQL. |
| **Databases** | **PostgreSQL** & **H2 Database** | **PostgreSQL** for persistent production data; **H2 Database** for zero-setup local development and rapid testing. |
| **Code Runner** | **Node.js (TypeScript) & Express** | Lightweight, high-speed execution runner interfacing with OS processes (`javac` and `java`). |
| **Compiler & Runtime**| **JDK 21** | Modern Long-Term Support (LTS) Java version for authentic compilation and execution. |
| **Containerization** | **Docker & Docker Compose** | Packages PostgreSQL, Backend, Execution Service, and Frontend into unified multi-container deployment. |

---

## 5. Key Modules in the Project

1. **Authentication & Security Module (`auth` & `security`):**
   - User registration and login.
   - Passwords hashed using **BCrypt**.
   - Stateless **JWT** authentication filter for protecting endpoints.
2. **Learning & Mission Engine (`world`, `mission`, `lesson`, `practice`):**
   - 4 Worlds (Ignis Station, Kryon Belt, Nova Sector, Function Nebula).
   - Structured learning path: Story &rarr; Concept Lesson &rarr; Practice Questions (MCQ/Debugging) &rarr; Final Coding Challenge.
3. **Execution & Evaluation Engine (`execution`, `challenge`, `submission`):**
   - Segregated compilation service that catches syntax errors, runtime exceptions, and timeouts.
   - Evaluates code against multiple test scenarios (both visible and hidden).
4. **Gamification & Progress System (`progress`, `achievement`, `level`):**
   - Sequential mission unlocking (cannot skip ahead).
   - Dynamic Level formula based on cumulative XP ($0 \to 900+$ XP).
   - Star evaluation logic: 3 stars (no hints, $\le 3$ tries), 2 stars (with hints), 1 star (completed).
   - Achievements & Badges (e.g., *First Steps*, *Variable Master*, *Code Warrior*).

---

## 6. Top Viva Questions & Answers (Be Prepared!)

### Q1: Why did you separate the code execution into a microservice instead of running it inside Spring Boot?
> **Answer:** **Security and stability.** If student code were executed directly inside Spring Boot:
> - An infinite loop (e.g., `while(true)`) or memory leak could crash the entire backend and disconnect all users.
> - A student could run malicious code (e.g., `System.exit(0)` or file deletion).
> By isolating it in a separate sandbox service with restricted memory (`-Xmx128m`) and process timeouts (`5000ms`), the main application remains 100% safe and responsive.

---

### Q2: How does the authentication system work?
> **Answer:** We use **stateless JWT (JSON Web Token)** authentication:
> 1. When a cadet logs in, Spring Boot verifies the BCrypt-hashed password.
> 2. If valid, a signed JWT containing the cadet's email/username is issued.
> 3. The frontend stores this token and attaches it to the `Authorization: Bearer <token>` header for all future requests.
> 4. The backend verifies the signature on each request without querying the database for session state.

---

### Q3: What database does the project use?
> **Answer:** We have dual-database support configured in `application.yml`:
> - For **development**, it uses an embedded file-based **H2 database** so anyone can clone and run the project immediately without installing PostgreSQL.
> - For **production/Docker**, it connects to a containerized **PostgreSQL 16** database for persistence and high performance.

---

### Q4: What happens if a user submits code with an infinite loop?
> **Answer:** The Execution Service uses Node.js child process timeouts set to **5000 milliseconds (5 seconds)**. If the program does not terminate within 5 seconds, the process receives a termination signal (`SIGTERM`), is killed immediately, and returns a clean `TIMEOUT` status to the user without crashing the server.

---

### Q5: What makes this better than standard online tutorials?
> **Answer:**
> 1. **Contextual Gamification:** Learning concepts is tied to space missions (e.g., fixing life support using conditional `if-else` statements).
> 2. **Active Coding over Passive Watching:** Students immediately apply theory in a real compiler.
> 3. **Non-punishing UX:** Hints exist to guide struggling beginners rather than failing them.
> 4. **Holographic Guide (B.Y.T.E.):** Provides encouragement and friendly error explanations.

---

## 7. Quick Demo Walkthrough Script (For 2-Minute Presentation)

1. **Login/Register:** Show cadet registration or login with JWT authentication.
2. **Galaxy Map:** Open Galaxy Map showing **Ignis Station** (World 1) unlocked and higher worlds locked.
3. **Mission Briefing:** Click on Mission 1 or 2; showcase the story context and B.Y.T.E. robot companion dialogue.
4. **Learning & Practice:** Show the interactive lesson and practice question.
5. **Monaco Code Editor:**
   - Write Java code intentionally with a syntax error (e.g., missing semicolon) &rarr; show the friendly diagnostic response.
   - Fix the code and hit **Submit** &rarr; show compilation, test case verification, XP gain, and Star celebration modal.
6. **Cadet Profile & Achievements:** Navigate to the `/achievements` and `/profile` tabs to display earned badges and real Java mastery statistics.
