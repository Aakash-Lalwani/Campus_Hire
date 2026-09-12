package com.campushire.service;

import com.campushire.dao.DashboardDAO;
import com.campushire.dto.DashboardStatsDTO;

import java.sql.SQLException;

public class DashboardService {
    private final DashboardDAO dashboardDAO = new DashboardDAO();

    public DashboardStatsDTO getDashboardStats() throws SQLException {
        return dashboardDAO.getStats();
    }
}
