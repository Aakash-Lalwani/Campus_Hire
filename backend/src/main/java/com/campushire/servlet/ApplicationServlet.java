package com.campushire.servlet;

import com.campushire.dto.ApplicationRequestDTO;
import com.campushire.enums.ApplicationStatus;
import com.campushire.exception.CampusHireException;
import com.campushire.model.Application;
import com.campushire.service.ApplicationService;
import com.campushire.util.JsonUtil;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/applications", "/api/applications/*"})
public class ApplicationServlet extends HttpServlet {
    private final ApplicationService applicationService = new ApplicationService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1 && !pathInfo.endsWith("/status")) {
                Long id = Long.parseLong(pathInfo.substring(1));
                Application app = applicationService.getApplicationById(id);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, app);
            } else {
                String studentIdStr = req.getParameter("studentId");
                Long studentId = (studentIdStr != null && !studentIdStr.isBlank()) ? Long.parseLong(studentIdStr) : null;
                
                String jobIdStr = req.getParameter("jobId");
                Long jobId = (jobIdStr != null && !jobIdStr.isBlank()) ? Long.parseLong(jobIdStr) : null;

                String status = req.getParameter("status");

                List<Application> apps = applicationService.getAllApplications(studentId, jobId, status);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, apps, apps.size());
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
            ApplicationRequestDTO dto = JsonUtil.fromJson(body, ApplicationRequestDTO.class);
            if (dto == null || dto.getStudentId() == null || dto.getJobId() == null) {
                ResponseUtil.sendError(resp, 400, "Both studentId and jobId are required", "MISSING_REQUIRED_FIELDS");
                return;
            }
            Application created = applicationService.applyForJob(dto.getStudentId(), dto.getJobId());
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, created);
        } catch (CampusHireException e) {
            int code = e.getErrorCode().equals("DUPLICATE_APPLICATION") ? 409 : 400;
            ResponseUtil.sendError(resp, code, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            // Path structure: /{id}/status or /{id}
            if (pathInfo == null || pathInfo.length() <= 1) {
                ResponseUtil.sendError(resp, 400, "Application ID is required in path", "MISSING_ID");
                return;
            }

            String[] parts = pathInfo.split("/");
            Long id = Long.parseLong(parts[1]);

            String body = readRequestBody(req);
            Map<String, String> bodyMap = JsonUtil.fromJson(body, Map.class);
            String statusStr = bodyMap != null ? bodyMap.get("status") : null;

            if (statusStr == null || statusStr.isBlank()) {
                ResponseUtil.sendError(resp, 400, "New status is required", "MISSING_STATUS");
                return;
            }

            ApplicationStatus newStatus = ApplicationStatus.fromString(statusStr);
            Application updated = applicationService.updateStatus(id, newStatus);
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
                ResponseUtil.sendError(resp, 400, "Application ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            applicationService.deleteApplication(id);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Application deleted successfully");
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
