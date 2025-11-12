
# EVSU QR Attendance System User Guide

🔗 **Website Link:** [Visit the EVSU QR Attendance System](https://evsu-qr-attendance-system.vercel.app/)

Welcome to the EVSU QR Attendance System! This guide will help you navigate and use the app step by step. The system is designed to make managing attendance for teachers and students simple and efficient.

## Overview of the App

The EVSU QR Attendance System has two main types of users:
- **Admins**: Manage the overall system (programs, subjects, teachers)
- **Teachers**: Take attendance for their classes

The app uses a web interface with a sidebar for navigation. You'll log in with your email and password, and the system will take you to the right dashboard based on your role.

## Understanding Each Page

### Login Page
- **What it does**: This is the first page you see when opening the app.
- **How to use it**: Enter your email address and password, then click "Sign in". If you forget your password, click "Forgot?" (though this feature may not be fully set up yet).
- **What happens next**: Based on your role, you'll be taken to either the Admin Dashboard or Teacher Dashboard.

### Admin Dashboard
- **What it does**: Gives you an overview of the entire system.
- **What you can see**:
  - Summary cards showing total programs, subjects, teachers, and students
  - Quick actions to jump to common tasks
  - Recent activity showing latest changes in the system
- **How to use it**: Use this as your starting point to see what's happening and quickly access other sections.

### Programs Page (Admin Only)
- **What it does**: Manage academic programs (like BSIT, BSCS, etc.).
- **What you can do**:
  - View all programs in a table
  - Search for programs by name
  - Add new programs (name, abbreviation, academic year)
  - Edit existing programs
  - Delete programs (only if they have no subjects or students)
- **How to use it**: Click "Add New Program" to create one, or use the search box to find specific programs.

### Subjects Page (Admin Only)
- **What it does**: Manage course subjects and assign them to programs and teachers.
- **What you can do**:
  - View all subjects in a table with details like course code, title, program, teacher, schedules, and enrolled students
  - Search by course code or title
  - Filter by program or teacher
  - Add new subjects (course code, title, program, teacher, schedules)
  - Edit subjects
  - Delete subjects
  - View detailed information about a subject
- **How to use it**: Use the filters and search to find subjects, then click the actions menu (three dots) for options.

### Teachers Page (Admin Only)
- **What it does**: Manage teacher accounts.
- **What you can do**:
  - View all teachers with their assigned subjects and total students
  - Search by name or email
  - Add new teachers (first name, last name, email, password)
  - Edit teacher information
  - Delete teachers
  - View detailed teacher information
- **How to use it**: Click "Add New Teacher" to create accounts, or search to find specific teachers.

### Teacher Dashboard
- **What it does**: Shows your personal overview as a teacher.
- **What you can see**:
  - Quick stats about your classes and attendance
  - Your assigned subjects
  - Today's classes
  - Recent attendance records
- **How to use it**: Check this daily to see your schedule and recent activity.

### Attendance Page (Teacher Only)
- **What it does**: Take attendance for your classes.
- **What you can do**:
  - Select a subject, date, and schedule
  - **Scan tab**: Use QR codes to mark attendance (students scan with their phones)
  - **List tab**: Manually mark attendance for each student
  - **Stats tab**: View attendance statistics for the subject
- **How to use it**: First select your subject and the date/schedule, then choose the tab that works best for your class.

### Students Page (Teacher Only)
- **What it does**: View students enrolled in your subjects.
- **What you can do**:
  - Select a subject to see enrolled students
  - Search students by name or ID
  - Filter by program
  - View detailed attendance history for individual students
- **How to use it**: Choose a subject, then use search/filter to find students, and click "View Details" for more info.

## Step-by-Step Workflow

### Setting Up the System (Admin Tasks)

1. **Log in as Admin**
   - Go to the login page
   - Enter your admin email and password
   - Click "Sign in"

2. **Create Programs**
   - From the sidebar, click "Programs"
   - Click "Add New Program"
   - Fill in: Program name (e.g., "Bachelor of Science in Information Technology"), Abbreviation (e.g., "BSIT"), Academic year (e.g., "2024-2025")
   - Click save

3. **Add Teachers**
   - From the sidebar, click "Teachers"
   - Click "Add New Teacher"
   - Fill in: First name, Last name, Email, Password
   - Click save
   - Note: Teachers will use their email and this password to log in

4. **Create Subjects**
   - From the sidebar, click "Subjects"
   - Click "Create New Subject"
   - Fill in: Course code (e.g., "IT101"), Title (e.g., "Introduction to Programming"), Program, Teacher
   - Add schedules (days and times for the class)
   - Click save

5. **Enroll Students** (Note: This may need to be done through an external system or API - check with your administrator for the process)

### Daily Teacher Workflow

1. **Log in as Teacher**
   - Go to the login page
   - Enter your teacher email and password
   - Click "Sign in"

2. **Check Your Dashboard**
   - View your stats and today's classes
   - See recent attendance activity

3. **Take Attendance**
   - From the sidebar, click "Attendance"
   - Select the subject you want to take attendance for
   - Choose the date (usually today)
   - Select the correct schedule/time slot
   - Choose how to take attendance:
     - **Scan**: Have students scan QR codes with their phones
     - **List**: Manually check off each student
   - Save the attendance

4. **View Student Information**
   - From the sidebar, click "Students"
   - Select a subject
   - Search or filter to find specific students
   - Click "View Details" to see their attendance history

### Student Experience (What Students Do)

- Students receive QR codes (possibly through an app or email)
- During class, they scan the QR code shown by the teacher
- Their attendance is automatically marked
- If manual attendance is used, the teacher marks them present/absent

## Tips for Using the App

- **Navigation**: Use the sidebar on the left to move between sections
- **Search**: Most pages have search boxes - use them to quickly find what you need
- **Filters**: Use filters on tables to narrow down results
- **Actions**: Look for buttons or three-dot menus for options like edit/delete
- **Dates**: Always check dates when taking attendance - make sure you're on the right day
- **Schedules**: Classes might have multiple schedules - select the correct one for attendance

If you encounter any issues or need help, contact your system administrator. The app is designed to be intuitive, but practice with test data before using it for real classes.
