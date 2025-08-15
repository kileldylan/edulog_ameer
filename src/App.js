import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import AdminHome from './components/adminHome';
import StudentManagement from './components/studentsManagement';
import AttendanceRecords from './components/attendance';
import CalendarPage from './components/calendarPage';
import ProfilePage from './components/profilePage';
import StudentProfile from './components/studentProfile';
import ReportsPage from './components/reports';
import SessionManagement from './components/sessionManagement';
import TeacherManagement from './components/teacherManagement';
import CourseManagement from './components/courseManagement';
import StudentDashboard from './components/studentDashboard';
import StudentSessions from './components/studentsSessions';
import AttendanceHistory from './components/attendanceHistory';
import CourseList from './components/courseList';
import CourseEnrollmentPage from './components/courseEnrollmentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminHome" element={<AdminHome/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/sessionManagement" element={<SessionManagement/>} />
        <Route path="/studentsManagement" element={<StudentManagement/>} />
        <Route path="/attendance" element={<AttendanceRecords/>} />
        <Route path="/teachers" element={<TeacherManagement/>} />
        <Route path="/courses" element={<CourseManagement/>} />
        <Route path="/calendarPage" element={<CalendarPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/studentProfile" element={<StudentProfile/>} />
        
        {/* Updated student routes with student_id parameter */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/sessions" element={<StudentSessions />} />
        <Route path="/student/attendance" element={<AttendanceHistory />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/course/list" element={<CourseList />} />
        <Route path="/student/course/enroll" element={<CourseEnrollmentPage />} />

        <Route path="/reports" element={<ReportsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;