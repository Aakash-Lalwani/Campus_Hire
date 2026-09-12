package com.campushire.servlet;

import com.campushire.exception.CampusHireException;
import com.campushire.model.Student;
import com.campushire.service.StudentService;
import com.campushire.util.JsonUtil;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/api/students", "/api/students/*"})
public class StudentServlet extends HttpServlet {
    private final StudentService studentService = new StudentService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1 && !pathInfo.contains("/applications")) {
                Long id = Long.parseLong(pathInfo.substring(1));
                Student student = studentService.getStudentById(id);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, student);
            } else {
                String search = req.getParameter("search");
                String branch = req.getParameter("branch");
                String status = req.getParameter("status");
                List<Student> students = studentService.getAllStudents(search, branch, status);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, students, students.size());
            }
        } catch (CampusHireException e) {
            int code = e.getErrorCode().equals("RESOURCE_NOT_FOUND") ? 404 : 400;
            ResponseUtil.sendError(resp, code, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String body = readRequestBody(req);
            Student student = JsonUtil.fromJson(body, Student.class);
            Student created = studentService.createStudent(student);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, created);
        } catch (CampusHireException e) {
            int code = e.getErrorCode().equals("DUPLICATE_EMAIL") ? 409 : 400;
            ResponseUtil.sendError(resp, code, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                ResponseUtil.sendError(resp, 400, "Student ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            String body = readRequestBody(req);
            Student student = JsonUtil.fromJson(body, Student.class);
            Student updated = studentService.updateStudent(id, student);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, updated);
        } catch (CampusHireException e) {
            int code = e.getErrorCode().equals("RESOURCE_NOT_FOUND") ? 404 : 400;
            ResponseUtil.sendError(resp, code, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                ResponseUtil.sendError(resp, 400, "Student ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            studentService.deleteStudent(id);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Student deleted successfully");
        } catch (CampusHireException e) {
            int code = e.getErrorCode().equals("RESOURCE_NOT_FOUND") ? 404 : 400;
            ResponseUtil.sendError(resp, code, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private String readRequestBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}
