package com.campushire.servlet;

import com.campushire.dto.EligibilityResultDTO;
import com.campushire.exception.CampusHireException;
import com.campushire.model.Job;
import com.campushire.service.EligibilityService;
import com.campushire.service.JobService;
import com.campushire.util.JsonUtil;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/api/jobs", "/api/jobs/*"})
public class JobServlet extends HttpServlet {
    private final JobService jobService = new JobService();
    private final EligibilityService eligibilityService = new EligibilityService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            
            // Check for /api/jobs/{jobId}/eligibility/{studentId}
            if (pathInfo != null && pathInfo.contains("/eligibility/")) {
                String[] parts = pathInfo.split("/");
                // parts: ["", "{jobId}", "eligibility", "{studentId}"]
                if (parts.length >= 4) {
                    Long jobId = Long.parseLong(parts[1]);
                    Long studentId = Long.parseLong(parts[3]);
                    EligibilityResultDTO eligibility = eligibilityService.checkEligibility(jobId, studentId);
                    ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, eligibility);
                    return;
                }
            }

            if (pathInfo != null && pathInfo.length() > 1) {
                Long id = Long.parseLong(pathInfo.substring(1));
                Job job = jobService.getJobById(id);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, job);
            } else {
                String search = req.getParameter("search");
                String companyIdStr = req.getParameter("companyId");
                Long companyId = (companyIdStr != null && !companyIdStr.isBlank()) ? Long.parseLong(companyIdStr) : null;
                String status = req.getParameter("status");

                List<Job> jobs = jobService.getAllJobs(search, companyId, status);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, jobs, jobs.size());
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
            Job job = JsonUtil.fromJson(body, Job.class);
            Job created = jobService.createJob(job);
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
                ResponseUtil.sendError(resp, 400, "Job ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            String body = readRequestBody(req);
            Job job = JsonUtil.fromJson(body, Job.class);
            Job updated = jobService.updateJob(id, job);
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
                ResponseUtil.sendError(resp, 400, "Job ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            jobService.deleteJob(id);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Job opening deleted successfully");
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
