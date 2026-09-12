package com.campushire.servlet;

import com.campushire.dto.DashboardStatsDTO;
import com.campushire.exception.CampusHireException;
import com.campushire.service.DashboardService;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet(urlPatterns = {"/api/dashboard", "/api/dashboard/*"})
public class DashboardServlet extends HttpServlet {
    private final DashboardService dashboardService = new DashboardService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            DashboardStatsDTO stats = dashboardService.getDashboardStats();

            if (pathInfo == null || pathInfo.equals("/") || pathInfo.equalsIgnoreCase("/stats")) {
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, stats);
            } else if (pathInfo.equalsIgnoreCase("/placements-by-branch")) {
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, stats.getPlacementsByBranch());
            } else if (pathInfo.equalsIgnoreCase("/applications-by-company")) {
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, stats.getApplicationsByCompany());
            } else if (pathInfo.equalsIgnoreCase("/package-distribution")) {
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, stats.getPackageDistribution());
            } else {
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, stats);
            }
        } catch (CampusHireException e) {
            ResponseUtil.sendError(resp, 400, e.getMessage(), e.getErrorCode());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, 500, "Internal server error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }
}
