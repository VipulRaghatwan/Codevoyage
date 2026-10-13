# CODEVOYAGE — Game-Based Java 21 Learning Platform

CODEVOYAGE is an immersive space-adventure game designed to teach students **authentic Java programming**. Students pilot starships, calibrate reactors, and navigate celestial hazard fields by writing, compiling, and running real Java (JDK 21) code.

---

## Architecture Overview

```
DAV4/
├── .env.example             # Complete environment variables template
├── .env                     # Local environment configurations
├── docker-compose.yml       # Production multi-container orchestration
├── README.md                # Project setup & architecture documentation
│
├── frontend/                # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/      # Navbar, Glass cards, Progress bars, HUD elements
│   │   ├── pages/           # LandingPage, Dashboard, GalaxyMap, MissionExperience, Achievements, Profile
│   │   ├── game/            # RobotCompanion (B.Y.T.E.), GameCelebrationModal, Starfield
│   │   ├── editor/          # Monaco Editor with JDK 21 syntax, shortcuts & diagnostics
│   │   ├── services/        # Axios API clients with JWT authentication interceptors
│   │   ├── context/         # AuthContext & GameContext
│   │   └── assets/          # Sci-fi planet artworks & starship avatars
│   └── package.json
│
├── backend/                 # Spring Boot 3.2.5 (Java 21)
│   ├── src/main/java/com/codevoyage/
│   │   ├── auth/            # AuthController, AuthService, JWT Login/Register
│   │   ├── user/            # User entity, UserLevelSystem, DashboardSummary, Profile
│   │   ├── world/           # Galaxy Worlds (Ignis Station, Kryon Belt, Nova Sector, Function Nebula)
│   │   ├── mission/         # Missions 1-5 with rich lore, objectives, and concept models
│   │   ├── lesson/          # Java lessons with interactive code snippets
│   │   ├── practice/        # Interactive questions (MCQs, code prediction, debugging)
│   │   ├── challenge/       # Coding challenges, visible test cases, hidden test cases, hints
│   │   ├── submission/      # Code submission, test runner, server-side grading
│   │   ├── progress/        # Progress tracking, non-punishing star system, sequential unlocking
│   │   ├── achievement/     # Badges & commendations (First Steps, Variable Master, Console Hero, No Hints, Code Warrior)
│   │   ├── execution/       # Isolated sandbox client & error translator
│   │   └── security/        # JwtService, JwtAuthFilter, SecurityConfig
│   └── pom.xml
│
└── execution-service/       # Isolated Java Sandbox Compilation & Execution Service
    ├── src/
    │   └── index.ts         # Fast, isolated runner with cgroups, timeouts & RAM caps
    ├── Dockerfile           # Unprivileged sandbox container
    └── package.json
```

---

## Key Educational & Gaming Features

1. **Authentic Java 21 Learning Progression**:
   - **Mission 1**: Java Program Structure, class, main method, `System.out.print` vs `println`
   - **Mission 2**: Variables, `int`, `double`, `String`, `boolean`, memory allocation
   - **Mission 3**: Standard Input, `java.util.Scanner`, parsing tokens from `System.in`
   - **Mission 4**: Arithmetic operators (`+`, `-`, `*`, `/`, `%`), cycle calculations
   - **Mission 5**: Relational (`<`, `>`, `>=`) and logical (`&&`, `||`, `!`) operators with `if` / `else if` / `else`

2. **Real Java Execution Architecture**:
   - React Monaco Editor &rarr; Spring Boot (`/api/v1/missions/{id}/submit`) &rarr; Execution Service (`http://localhost:5050`) &rarr; Sandbox `javac` & `java` runner.
   - Arbitrary student code is **NEVER** executed inside Spring Boot.
   - Comprehensive error translation: Compilation errors with line numbers, runtime exceptions, and infinite-loop timeout protection.

3. **Non-Punishing Star & XP System**:
   - **3 Stars**: Completed without hints and $\le 3$ attempts.
   - **2 Stars**: Completed with minor guidance ($\le 1$ hint).
   - **1 Star**: Challenge completed.
   - *Beginner friendly*: Hints reduce the maximum star rating, but **never** block progression.

4. **B.Y.T.E. Robot Companion**:
   - Contextual holographic robot providing real-time advice across Story, Learn, Practice, Code Challenge, Sandbox Run, and Flight Clearance stages.

5. **Starfleet Commendations & Cadet Profile**:
   - `/achievements`: Interactive medal deck with filtering, search, and detailed directive inspection modal.
   - `/profile`: Authentic dossier tracking genuine compiler milestones without fabricated data.

---

## How to Run Locally

### Prerequisites
- Node.js 20+ & npm
- Java JDK 21
- PostgreSQL (or use embedded H2 database provided by default in development mode)

---

### Step-by-Step Native Startup

Open 3 terminal windows:

#### 1. Start Execution Sandbox Service (Port 5050)
```powershell
cd execution-service
npm install
npm run dev
```
- Health Check: `http://localhost:5050/health`
- Endpoint: `POST http://localhost:5050/api/v1/execute`

#### 2. Start Spring Boot Backend (Port 8080)
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
- Health Check: `http://localhost:8080/api/v1/health`
- API Base: `http://localhost:8080/api/v1`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/codevoyagedb`, User: `sa`, Password: empty)

#### 3. Start React Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

### Running with PostgreSQL (Production / Docker Mode)

To run with a dedicated PostgreSQL database:
1. Ensure PostgreSQL is running on port `5432`.
2. Create the database:
   ```sql
   CREATE DATABASE codevoyage_db;
   ```
3. Set your environment variables in `.env` or `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/codevoyage_db
       username: postgres
       password: your_postgres_password
   ```
4. Run Spring Boot with the `docker` or custom profile:
   ```powershell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=docker
   ```

---

### Multi-Container Docker Compose

When Docker Desktop is installed:
```powershell
cp .env.example .env
docker compose up --build -d
```
All 4 containers (`postgres`, `execution-service`, `backend`, `frontend`) will automatically build, link, and launch.

---

## End-to-End Test & Verification Summary

| Test Area | Tested Scenario | Result |
|---|---|---|
| **Auth** | User Registration & BCrypt Password Hashing | **PASSED** |
| **Auth** | JWT Token Issuance & Stateless Authentication | **PASSED** |
| **Security** | Tamper Resistance: XP, Stars, and Unlocks validated server-side | **PASSED** |
| **Sandbox** | Real `javac` compilation & JVM execution | **PASSED** |
| **Error Handling** | Unclosed string literal &rarr; beginner-friendly diagnostic hint | **PASSED** |
| **Error Handling** | Division by zero &rarr; simplified runtime exception explanation | **PASSED** |
| **Error Handling** | Infinite `while(true)` loop &rarr; killed within 5000ms with TIMEOUT status | **PASSED** |
| **Test Engine** | Visible test case assertion with expected vs actual output diff | **PASSED** |
| **Test Engine** | Hidden test case evaluation without leaking inputs or expected outputs | **PASSED** |
| **Progression** | Sequential unlocking: Mission 1 &rarr; Mission 2 &rarr; 3 &rarr; 4 &rarr; 5 | **PASSED** |
| **Progression** | Ignis Station complete &rarr; Kryon Belt unlocked with COMING SOON modal | **PASSED** |
| **Gamification** | Level calculation: Level 1 (0 XP) up to Level 5 (900+ XP) | **PASSED** |
| **Gamification** | 10 Stars celebration & `FIRST_LAUNCH` badge awarded upon World 1 complete | **PASSED** |
| **Profile** | Granular Java concept mastery based strictly on genuine activity | **PASSED** |
| **Persistence** | Progress, XP, Stars, and Badges survive page refresh and logout/login | **PASSED** |
| **Frontend** | TypeScript strict compilation & Vite production build | **PASSED** |
