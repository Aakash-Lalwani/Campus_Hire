package com.campushire.servlet;

import com.campushire.exception.CampusHireException;
import com.campushire.model.Interview;
import com.campushire.service.InterviewService;
import com.campushire.util.JsonUtil;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/api/interviews", "/api/interviews/*"})
public class InterviewServlet extends HttpServlet {
    private final InterviewService interviewService = new InterviewService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1) {
                Long id = Long.parseLong(pathInfo.substring(1));
                Interview interview = interviewService.getInterviewById(id);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, interview);
            } else {
                String appIdStr = req.getParameter("applicationId");
                Long applicationId = (appIdStr != null && !appIdStr.isBlank()) ? Long.parseLong(appIdStr) : null;
                String result = req.getParameter("result");

                List<Interview> interviews = interviewService.getAllInterviews(applicationId, result);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, interviews, interviews.size());
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
            Interview interview = JsonUtil.fromJson(body, Interview.class);
            Interview created = interviewService.scheduleInterview(interview);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, created);
        } catch (CampusHireException e) {
            ResponseUtil.sendError(resp, 400, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                ResponseUtil.sendError(resp, 400, "Interview ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            String body = readRequestBody(req);
            Interview interview = JsonUtil.fromJson(body, Interview.class);
            Interview updated = interviewService.updateInterview(id, interview);
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
                ResponseUtil.sendError(resp, 400, "Interview ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            interviewService.deleteInterview(id);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Interview deleted successfully");
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
