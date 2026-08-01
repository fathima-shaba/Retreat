const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace whole words, preserving case
    content = content.replace(/\bstudent\b/g, 'member');
    content = content.replace(/\bStudent\b/g, 'Member');
    content = content.replace(/\bstudents\b/g, 'members');
    content = content.replace(/\bStudents\b/g, 'Members');
    
    // Also handle student_id -> member_id
    content = content.replace(/student_id/g, 'member_id');
    content = content.replace(/student_name/g, 'member_name');
    
    fs.writeFileSync(filePath, content);
}

// Backend files
const backendFiles = [
    'backend/server.js',
    'backend/controllers/memberController.js',
    'backend/routes/memberRoutes.js',
    'backend/controllers/paymentController.js',
    'backend/controllers/dashboardController.js',
];

backendFiles.forEach(f => replaceInFile(path.join(__dirname, '..', f)));

// Frontend files
const frontendDir = path.join(__dirname, '..', 'frontend');
const frontendPages = path.join(frontendDir, 'src', 'pages');
const frontendComponents = path.join(frontendDir, 'src', 'components');

// Rename Students.jsx to Members.jsx
const studentsJsxPath = path.join(frontendPages, 'Students.jsx');
const membersJsxPath = path.join(frontendPages, 'Members.jsx');
if (fs.existsSync(studentsJsxPath)) {
    fs.renameSync(studentsJsxPath, membersJsxPath);
}

const frontendFiles = [
    path.join(frontendDir, 'src', 'App.jsx'),
    path.join(frontendComponents, 'Sidebar.jsx'),
    path.join(frontendComponents, 'Header.jsx'),
    membersJsxPath,
    path.join(frontendPages, 'Dashboard.jsx'),
    path.join(frontendPages, 'Payments.jsx'),
    path.join(frontendPages, 'Rooms.jsx'),
    path.join(frontendPages, 'Expenses.jsx'),
];

frontendFiles.forEach(f => replaceInFile(f));

console.log("Refactoring complete");
