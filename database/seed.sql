-- CampusHire Placement Management System
-- Seed Data for Realistic Demo & Interview Presentation

USE campushire;

-- Clear existing data
DELETE FROM interviews;
DELETE FROM applications;
DELETE FROM jobs;
DELETE FROM companies;
DELETE FROM students;

-- Reset Auto Increment IDs
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE jobs AUTO_INCREMENT = 1;
ALTER TABLE applications AUTO_INCREMENT = 1;
ALTER TABLE interviews AUTO_INCREMENT = 1;

-- Insert Students (15 students)
INSERT INTO students (name, email, phone, branch, cgpa, graduation_year, backlogs, skills, placement_status) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '9876543210', 'CSE', 8.75, 2026, 0, 'Java, Spring Boot, React, MySQL', 'PLACED'),
('Ananya Verma', 'ananya.verma@example.com', '9876543211', 'CSE', 9.10, 2026, 0, 'Java, Data Structures, Python, AWS', 'PLACED'),
('Rohan Patel', 'rohan.patel@example.com', '9876543212', 'IT', 7.80, 2026, 0, 'JavaScript, React, Node.js, MongoDB', 'NOT_PLACED'),
('Priya Nair', 'priya.nair@example.com', '9876543213', 'AI-ML', 8.95, 2026, 0, 'Python, TensorFlow, Java, SQL', 'NOT_PLACED'),
('Rahul Gupta', 'rahul.gupta@example.com', '9876543214', 'ECE', 7.20, 2026, 1, 'C++, Embedded Systems, Python', 'NOT_PLACED'),
('Sneha Reddy', 'sneha.reddy@example.com', '9876543215', 'CSE', 8.40, 2026, 0, 'Java, SQL, HTML/CSS, Git', 'NOT_PLACED'),
('Vikram Singh', 'vikram.singh@example.com', '9876543216', 'IT', 6.90, 2026, 2, 'Java, MySQL, HTML', 'NOT_PLACED'),
('Kavya Joshi', 'kavya.joshi@example.com', '9876543217', 'AI-ML', 9.45, 2026, 0, 'Python, PyTorch, Java, Machine Learning', 'PLACED'),
('Aditya Kumar', 'aditya.kumar@example.com', '9876543218', 'ECE', 8.10, 2026, 0, 'Java, C, IoT, Microcontrollers', 'NOT_PLACED'),
('Diya Mehra', 'diya.mehra@example.com', '9876543219', 'CSE', 7.95, 2026, 0, 'Java, JavaScript, React, SQL', 'NOT_PLACED'),
('Karan Malhotra', 'karan.malhotra@example.com', '9876543220', 'IT', 8.60, 2026, 0, 'Java, System Design, React, PostgreSQL', 'HIGHER_STUDIES'),
('Isha Choudhury', 'isha.choudhury@example.com', '9876543221', 'AI-ML', 7.50, 2026, 1, 'Python, Data Analytics, SQL', 'NOT_PLACED'),
('Siddharth Rao', 'siddharth.rao@example.com', '9876543222', 'CSE', 6.40, 2026, 0, 'HTML, CSS, JavaScript, Basics of Java', 'NOT_PLACED'),
('Meera Deshmukh', 'meera.deshmukh@example.com', '9876543223', 'ECE', 8.80, 2026, 0, 'Java, VLSI, Python, SQL', 'NOT_PLACED'),
('Varun Bhat', 'varun.bhat@example.com', '9876543224', 'IT', 7.65, 2026, 0, 'Java, React, SQL, DevOps basics', 'NOT_PLACED');

-- Insert Companies (6 companies)
INSERT INTO companies (name, industry, location, website, contact_person, contact_email) VALUES
('Cognizant Technology Solutions', 'IT Services & Consulting', 'Chennai / Hyderabad / Bangalore', 'https://www.cognizant.com', 'Rajesh Menon', 'campus.hiring@cognizant.com'),
('Tata Consultancy Services', 'IT Services', 'Mumbai / Pune', 'https://www.tcs.com', 'Pooja Sharma', 'campus@tcs.com'),
('Infosys Technologies', 'Software Services', 'Bangalore / Mysore', 'https://www.infosys.com', 'Sunil Kulkarni', 'talent@infosys.com'),
('Wipro Limited', 'IT Consulting', 'Bangalore / Hyderabad', 'https://www.wipro.com', 'Anita Roy', 'earlycareers@wipro.com'),
('Amazon Web Services', 'Cloud & Product Tech', 'Bangalore / Hyderabad', 'https://aws.amazon.com', 'David Miller', 'aws-campus-india@amazon.com'),
('Microsoft Corporation', 'Product & Software Engineering', 'Hyderabad / Noida', 'https://www.microsoft.com', 'Sarah Jenkins', 'msft-campus@microsoft.com');

-- Insert Jobs (10 jobs)
INSERT INTO jobs (company_id, role, description, package_lpa, min_cgpa, allowed_branches, max_backlogs, application_deadline, job_status) VALUES
(1, 'Programmer Analyst Trainee (PAT)', 'Develop and maintain enterprise Java web applications.', 4.50, 6.50, 'CSE,IT,AI-ML,ECE', 0, '2026-11-30', 'OPEN'),
(1, 'GenC Next Developer', 'High-performance role focusing on full-stack Java/React architecture.', 6.75, 7.50, 'CSE,IT,AI-ML', 0, '2026-11-15', 'OPEN'),
(2, 'Ninja Developer', 'Entry level software engineering across digital technologies.', 4.00, 6.00, 'CSE,IT,AI-ML,ECE', 1, '2026-12-01', 'OPEN'),
(2, 'Digital Software Engineer', 'Advanced algorithm design, cloud integration, and database optimization.', 7.00, 7.50, 'CSE,IT,AI-ML', 0, '2026-10-31', 'OPEN'),
(3, 'Specialist Programmer', 'Complex problem solving, full-stack architecture, microservices.', 9.50, 8.00, 'CSE,IT,AI-ML', 0, '2026-11-20', 'OPEN'),
(3, 'System Engineer', 'Enterprise application maintenance, Java backend services.', 3.60, 6.00, 'CSE,IT,AI-ML,ECE', 2, '2026-12-15', 'OPEN'),
(4, 'Project Engineer', 'Software development and client integration projects.', 3.50, 6.00, 'CSE,IT,ECE', 1, '2026-12-10', 'OPEN'),
(5, 'Software Development Engineer I (SDE-1)', 'High-scale distributed cloud backend systems at AWS.', 28.00, 8.50, 'CSE,IT,AI-ML', 0, '2026-10-15', 'OPEN'),
(6, 'Software Engineer - Campus', 'Build core Windows, Azure and Developer Tools products.', 32.00, 8.75, 'CSE,AI-ML', 0, '2026-10-10', 'OPEN'),
(1, 'Quality Assurance Analyst', 'Test automation using Selenium, Java and API testing tools.', 4.20, 6.50, 'CSE,IT,ECE', 0, '2026-09-01', 'CLOSED');

-- Insert Applications (20 applications)
INSERT INTO applications (student_id, job_id, status, applied_at) VALUES
(1, 1, 'SELECTED', '2026-08-01 10:00:00'),
(1, 2, 'SHORTLISTED', '2026-08-02 11:30:00'),
(2, 8, 'SELECTED', '2026-08-01 09:15:00'),
(2, 9, 'TECHNICAL', '2026-08-03 14:00:00'),
(3, 1, 'APTITUDE', '2026-08-02 16:45:00'),
(3, 3, 'APPLIED', '2026-08-04 12:00:00'),
(4, 5, 'HR', '2026-08-03 10:30:00'),
(4, 8, 'TECHNICAL', '2026-08-04 15:20:00'),
(5, 3, 'APPLIED', '2026-08-05 11:00:00'),
(6, 1, 'SHORTLISTED', '2026-08-02 09:00:00'),
(6, 2, 'APPLIED', '2026-08-04 10:00:00'),
(7, 3, 'REJECTED', '2026-08-01 13:00:00'),
(8, 9, 'SELECTED', '2026-08-01 15:00:00'),
(9, 1, 'APPLIED', '2026-08-05 17:00:00'),
(10, 1, 'TECHNICAL', '2026-08-03 11:00:00'),
(10, 5, 'APPLIED', '2026-08-04 14:30:00'),
(11, 2, 'SHORTLISTED', '2026-08-02 10:15:00'),
(12, 3, 'APPLIED', '2026-08-05 09:30:00'),
(14, 1, 'APPLIED', '2026-08-05 16:00:00'),
(15, 1, 'APPLIED', '2026-08-05 18:00:00');

-- Insert Interviews (10 interviews)
INSERT INTO interviews (application_id, round, scheduled_at, mode, interviewer, result, remarks) VALUES
(1, 'HR', '2026-08-05 11:00:00', 'OFFLINE', 'Rajesh Menon', 'PASSED', 'Excellent communication skills and strong technical domain knowledge.'),
(2, 'TECHNICAL', '2026-08-12 14:00:00', 'ONLINE', 'Anand Verma', 'PENDING', 'Scheduled technical coding round on Microsoft Teams.'),
(3, 'HR', '2026-08-06 15:00:00', 'ONLINE', 'David Miller', 'PASSED', 'Great problem solving mindset and team orientation.'),
(4, 'TECHNICAL', '2026-08-11 16:00:00', 'ONLINE', 'Sarah Jenkins', 'PENDING', 'System design and algorithms assessment.'),
(5, 'APTITUDE', '2026-08-10 10:00:00', 'ONLINE', 'Pooja Sharma', 'PENDING', 'Online aptitude assessment on TCS iON portal.'),
(7, 'HR', '2026-08-10 11:30:00', 'ONLINE', 'Sunil Kulkarni', 'PENDING', 'Final HR round for Specialist Programmer position.'),
(8, 'TECHNICAL', '2026-08-11 11:00:00', 'ONLINE', 'Alex Johnson', 'PENDING', 'AWS Cloud architecture & coding round.'),
(10, 'TECHNICAL', '2026-08-12 10:00:00', 'ONLINE', 'Vikram Patel', 'PENDING', 'Java full stack coding interview.'),
(12, 'APTITUDE', '2026-08-02 10:00:00', 'ONLINE', 'Pooja Sharma', 'FAILED', 'Did not clear minimum percentile threshold in quant.'),
(13, 'HR', '2026-08-05 16:00:00', 'OFFLINE', 'Sarah Jenkins', 'PASSED', 'Outstanding coding score and project demo.');
