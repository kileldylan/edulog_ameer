// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import AdminHome from './components/adminHome';
import StudentManagement from './components/studentsManagement';
import AttendanceRecords from './components/attendance';
import StudentHome from './components/studentHome';
import CalendarPage from './components/calendarPage';
import ProfilePage from './components/profilePage';
import StudentProfile from './components/studentProfile';
import ReportsPage from './components/reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminHome" element={<AdminHome/>} />
        <Route path="/register" element={<Register />} />
        <Route path= "/studentsManagement" element={<StudentManagement/>} />
        <Route path= "/attendance" element= {<AttendanceRecords/>} />
        <Route path= "/studentHome" element= {<StudentHome/>} />
        <Route path= "/calendarPage" element= {<CalendarPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path ="/studentProfile" element={<StudentProfile/>} />
        <Route path="/reports" element={<ReportsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
