package com.campushire.dao;

import com.campushire.model.Company;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class CompanyDAO {

    public List<Company> findAll(String search) throws SQLException {
        List<Company> companies = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM companies WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(name) LIKE LOWER(?) OR LOWER(industry) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?)) ");
            String term = "%" + search.trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }
        sql.append("ORDER BY id DESC");

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    companies.add(mapResultSetToCompany(rs));
                }
            }
        }
        return companies;
    }

    public Optional<Company> findById(Long id) throws SQLException {
        String sql = "SELECT * FROM companies WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToCompany(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Company create(Company company) throws SQLException {
        String sql = "INSERT INTO companies (name, industry, location, website, contact_person, contact_email) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, company.getName());
            stmt.setString(2, company.getIndustry());
            stmt.setString(3, company.getLocation());
            stmt.setString(4, company.getWebsite());
            stmt.setString(5, company.getContactPerson());
            stmt.setString(6, company.getContactEmail());

            stmt.executeUpdate();

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    company.setId(generatedKeys.getLong(1));
                }
            }
        }
        return company;
    }

    public boolean update(Company company) throws SQLException {
        String sql = "UPDATE companies SET name=?, industry=?, location=?, website=?, contact_person=?, contact_email=? WHERE id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, company.getName());
            stmt.setString(2, company.getIndustry());
            stmt.setString(3, company.getLocation());
            stmt.setString(4, company.getWebsite());
            stmt.setString(5, company.getContactPerson());
            stmt.setString(6, company.getContactEmail());
            stmt.setLong(7, company.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(Long id) throws SQLException {
        String sql = "DELETE FROM companies WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Company mapResultSetToCompany(ResultSet rs) throws SQLException {
        Company c = new Company();
        c.setId(rs.getLong("id"));
        c.setName(rs.getString("name"));
        c.setIndustry(rs.getString("industry"));
        c.setLocation(rs.getString("location"));
        c.setWebsite(rs.getString("website"));
        c.setContactPerson(rs.getString("contact_person"));
        c.setContactEmail(rs.getString("contact_email"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        return c;
    }
}
