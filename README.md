# HomeCare Appointment Management System

Note: This mini project currently implements basic CRUD functionality without authentication or authorization. We can therefore choose client from dropdown when booking appointment, and same with personnel for availableDays. This will later be fixed so that the person logged in will be booking for themselves as well as general access control.

The access level when running the app can be considered as admin.

## What you need to run the app
- .NET 8.0 SDK

## How to Run the Application

1. Navigate to the project directory:
   ```bash
   cd HomecareApp

2. Restore dependencies:
   dotnet restore

3. dotnet build
4. dotnet run
5. 
Open your browser and go to: https://localhost:5001 or http://localhost:5000

## Features
Healthcare personnel can create/update/delete available days
Clients can book appointments with task descriptions (CRUD functionality)
Complete user management system
Real-time scheduling and booking

## Database
SQLite database created automatically on first run
No additional setup required

## Tech stack
.NET 8.0 MVC
Entity Framework Core
SQLite
Bootstrap



  
