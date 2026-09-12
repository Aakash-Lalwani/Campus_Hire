package com.campushire.dao;

import com.campushire.dto.DashboardStatsDTO;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.*;

public class DashboardDAO {

    public DashboardStatsDTO getStats() throws SQLException {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        try (Connection conn = DBUtil.getConnection()) {

            // 1. Total Students
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM students");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) stats.setTotalStudents(rs.getLong(1));
            }

            // 2. Total Companies
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM companies");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) stats.setTotalCompanies(rs.getLong(1));
            }

            // 3. Open Jobs
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM jobs WHERE job_status = 'OPEN'");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) stats.setOpenJobs(rs.getLong(1));
            }

            // 4. Total Applications
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM applications");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) stats.setTotalApplications(rs.getLong(1));
            }

            // 5. Students Placed
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COUNT(*) FROM students WHERE placement_status = 'PLACED'");
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) stats.setStudentsPlaced(rs.getLong(1));
            }

            // Placement percentage calculation
            if (stats.getTotalStudents() > 0) {
                double pct = ((double) stats.getStudentsPlaced() / stats.getTotalStudents()) * 100.0;
                stats.setPlacementPercentage(Math.round(pct * 100.0) / 100.0);
            } else {
                stats.setPlacementPercentage(0.0);
            }

            // 6. Placements by branch
            stats.setPlacementsByBranch(getPlacementsByBranch(conn));

            // 7. Applications by company
            stats.setApplicationsByCompany(getApplicationsByCompany(conn));

            // 8. Package distribution
            stats.setPackageDistribution(getPackageDistribution(conn));
        }

        return stats;
    }

    public List<Map<String, Object>> getPlacementsByBranch(Connection conn) throws SQLException {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT branch, COUNT(*) AS total, SUM(CASE WHEN placement_status = 'PLACED' THEN 1 ELSE 0 END) AS placed FROM students GROUP BY branch";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("branch", rs.getString("branch"));
                row.put("total", rs.getLong("total"));
                row.put("placed", rs.getLong("placed"));
                result.add(row);
            }
        }
        return result;
    }

    public List<Map<String, Object>> getApplicationsByCompany(Connection conn) throws SQLException {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT c.name AS company, COUNT(a.id) AS count " +
                     "FROM companies c " +
                     "LEFT JOIN jobs j ON c.id = j.company_id " +
                     "LEFT JOIN applications a ON j.id = a.job_id " +
                     "GROUP BY c.id, c.name ORDER BY count DESC";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("company", rs.getString("company"));
                row.put("applications", rs.getLong("count"));
                result.add(row);
            }
        }
        return result;
    }

    public List<Map<String, Object>> getPackageDistribution(Connection conn) throws SQLException {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT " +
                     "CASE " +
                     "  WHEN package_lpa < 5.0 THEN '< 5 LPA' " +
                     "  WHEN package_lpa BETWEEN 5.0 AND 10.0 THEN '5-10 LPA' " +
                     "  WHEN package_lpa BETWEEN 10.0 AND 20.0 THEN '10-20 LPA' " +
                     "  ELSE '> 20 LPA' " +
                     "END AS label, COUNT(*) AS count " +
                     "FROM jobs GROUP BY label ORDER BY count DESC";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("label", rs.getString("label"));
                row.put("count", rs.getLong("count"));
                result.add(row);
            }
        }
        return result;
    }
}
