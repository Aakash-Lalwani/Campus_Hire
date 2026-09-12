# CampusHire — Complete Environment & System Setup Guide

This guide provides exact step-by-step instructions to set up, compile, run, and demonstrate the CampusHire system on a Windows development environment.

---

## 1. System Requirements & Prerequisites

Ensure the following tools are installed and configured on your system:

| Software | Required Version | Verification Command |
| :--- | :--- | :--- |
| **Java JDK** | Java 17 LTS or higher | `java -version` |
| **Apache Maven** | 3.8.0+ | `mvn -version` |
| **Node.js & npm** | Node 18+ / npm 9+ | `node -v` && `npm -v` |
| **MySQL Server** | 8.0+ | `mysql --version` |
| **Apache Tomcat** | Tomcat 10.1+ (or embedded maven runner) | `catalina.bat version` |

---

## 2. Database Setup

1. **Start MySQL Service**:
   Open Windows Services (`services.msc`) or run in Administrator CMD:
   ```cmd
   net start MySQL80
   ```

2. **Execute Database Scripts**:
   Navigate to the project root in Command Prompt and run:
   ```cmd
   mysql -u root -p < database\schema.sql
   mysql -u root -p < database\seed.sql
   ```
   *(Or open `database/schema.sql` followed by `database/seed.sql` in MySQL Workbench or DBeaver and execute).*

3. **Verify Database Configuration**:
   The backend connects using standard parameters defined in `backend/src/main/resources/db.properties.example`.
   If your MySQL credentials differ, set environment variables or create `backend/src/main/resources/db.properties`:
   ```properties
   db.url=jdbc:mysql://localhost:3306/campushire?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   db.username=root
   db.password=root
   ```

---

## 3. Backend Setup & Compilation

1. Navigate to the `backend/` directory:
   ```cmd
   cd backend
   ```

2. Compile and package the Java WAR artifact using Maven:
   ```cmd
   mvn clean package
   ```
   This generates `target/api.war`.

3. Deploy to Tomcat:
   - Copy `target/api.war` to Tomcat's `webapps/` directory (`C:\Program Files\Apache Software Foundation\Tomcat 10.1\webapps\`).
   - Start Tomcat via `bin\startup.bat`.
   - The REST API will be live at `http://localhost:8080/api`.

---

## 4. Frontend Setup & Execution

1. Navigate to the `frontend/` directory:
   ```cmd
   cd frontend
   ```

2. Install Node dependencies:
   ```cmd
   npm install
   ```

3. Launch Vite development server:
   ```cmd
   npm run dev
   ```
   Access the web interface at `http://localhost:5173`.

4. Build production bundle (optional):
   ```cmd
   npm run build
   ```

---

## 5. System Verification Smoke Test

1. **Verify Backend Health**:
   Open browser or curl:
   ```cmd
   curl http://localhost:8080/api/dashboard/stats
   ```
   Expected output: JSON containing `{ "success": true, "data": { ... } }`.

2. **Verify Frontend**:
   Open `http://localhost:5173` to view the Placement Officer Dashboard, charts, student registry, eligibility engine, and application pipeline.
