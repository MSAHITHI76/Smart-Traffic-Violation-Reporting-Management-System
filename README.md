
# 🚦 Smart Traffic Violation Reporting & Management System

A full-stack web application for reporting, reviewing, and managing traffic violations through a centralized digital platform.

The system enables citizens to submit traffic violation reports with relevant details and evidence, while administrators can review reports, verify submitted information, update case status, and manage resolutions through an administrative dashboard.

## ✨ Features

### 👤 Citizen Module

* Register and log in securely
* Submit traffic violation reports
* Add violation location and description
* Upload supporting photos or videos
* Track the status of submitted reports

### 🛡️ Admin Module

* Admin dashboard for managing reports
* View submitted violation cases
* Review submitted evidence
* Verify and process reports
* Update report status
* Manage case resolution

### 🔗 System Features

* REST API-based communication
* MySQL database integration
* Responsive web interface
* Centralized violation management
* Docker support for deployment

## 🏗️ Technology Stack

| Layer           | Technologies         |
| --------------- | -------------------- |
| Frontend        | React.js, JavaScript |
| Backend         | Python, Flask        |
| API             | REST APIs            |
| Database        | MySQL                |
| Deployment      | Docker               |
| Version Control | Git, GitHub          |

## 📂 Project Structure

```text
Smart-Traffic-Violation-Reporting-Management-System/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   └── requirements.txt
│
├── uploads/
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

> The exact folder structure may vary depending on the current implementation.

## 🔄 System Workflow

```text
Citizen
   │
   ▼
Submit Violation Report
   │
   ├── Location
   ├── Description
   └── Photo / Video Evidence
   │
   ▼
Flask REST API
   │
   ▼
MySQL Database
   │
   ▼
Admin Dashboard
   │
   ├── Review Report
   ├── Verify Evidence
   ├── Update Status
   └── Resolve Case
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MSAHITHI76/Smart-Traffic-Violation-Reporting-Management-System.git
```

```bash
cd Smart-Traffic-Violation-Reporting-Management-System
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file inside the backend directory and configure the database connection:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=traffic
```

Do not commit `.env` files or database credentials to GitHub.

### 4. Start the Backend

```bash
python app.py
```

The Flask API will run on the configured local port.

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will be available at the URL shown in the terminal, typically:

```text
http://localhost:5173
```

## 🐳 Docker

The project includes Docker support for containerized deployment.

To build and start the application:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

## 🗄️ Database

The application uses **MySQL** to store information such as:

* User accounts
* Traffic violation reports
* Violation locations
* Report descriptions
* Evidence references
* Report status
* Case resolution details

## 🔐 Security Considerations

* Database credentials are stored using environment variables.
* Sensitive configuration files should not be committed to the repository.
* Uploaded evidence should be validated before processing.
* Authentication and authorization should be enforced for protected admin operations.

## 📌 Use Cases

* Citizen-based traffic violation reporting
* Digital traffic incident management
* Centralized evidence management
* Administrative review of reported violations
* Traffic case status tracking
* Smart-city traffic management applications

## 🎯 Future Enhancements

* AI-based traffic violation detection
* Automatic number plate recognition (ANPR)
* GPS-based location verification
* Duplicate report detection
* Real-time notifications
* Advanced analytics dashboard
* Role-based access control
* Cloud deployment
* Automated report prioritization

## 👩‍💻 Author

**M. Sahithi Priya**

B.Tech — Electronics and Communication Engineering

GitHub: [MSAHITHI76](https://github.com/MSAHITHI76)

LinkedIn: [M. Sahithi Priya](https://linkedin.com/in/msahithi-priya)

## 📄 License

This project is developed for educational and project purposes.
