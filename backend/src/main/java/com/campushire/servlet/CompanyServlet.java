package com.campushire.servlet;

import com.campushire.exception.CampusHireException;
import com.campushire.model.Company;
import com.campushire.service.CompanyService;
import com.campushire.util.JsonUtil;
import com.campushire.util.ResponseUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

@WebServlet(urlPatterns = {"/api/companies", "/api/companies/*"})
public class CompanyServlet extends HttpServlet {
    private final CompanyService companyService = new CompanyService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1) {
                Long id = Long.parseLong(pathInfo.substring(1));
                Company company = companyService.getCompanyById(id);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, company);
            } else {
                String search = req.getParameter("search");
                List<Company> companies = companyService.getAllCompanies(search);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, companies, companies.size());
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
            Company company = JsonUtil.fromJson(body, Company.class);
            Company created = companyService.createCompany(company);
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
                ResponseUtil.sendError(resp, 400, "Company ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            String body = readRequestBody(req);
            Company company = JsonUtil.fromJson(body, Company.class);
            Company updated = companyService.updateCompany(id, company);
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
                ResponseUtil.sendError(resp, 400, "Company ID is required in URL path", "MISSING_ID");
                return;
            }
            Long id = Long.parseLong(pathInfo.substring(1));
            companyService.deleteCompany(id);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, "Company deleted successfully");
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
