package com.campushire.service;

import com.campushire.dao.CompanyDAO;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.model.Company;

import java.sql.SQLException;
import java.util.List;

public class CompanyService {
    private final CompanyDAO companyDAO = new CompanyDAO();

    public List<Company> getAllCompanies(String search) throws SQLException {
        return companyDAO.findAll(search);
    }

    public Company getCompanyById(Long id) throws SQLException {
        return companyDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company with ID " + id + " not found"));
    }

    public Company createCompany(Company company) throws SQLException {
        validateCompany(company);
        return companyDAO.create(company);
    }

    public Company updateCompany(Long id, Company company) throws SQLException {
        getCompanyById(id);
        company.setId(id);
        validateCompany(company);
        companyDAO.update(company);
        return company;
    }

    public void deleteCompany(Long id) throws SQLException {
        getCompanyById(id);
        companyDAO.delete(id);
    }

    private void validateCompany(Company c) {
        if (c.getName() == null || c.getName().isBlank()) {
            throw new ValidationException("Company name is required");
        }
        if (c.getContactEmail() != null && !c.getContactEmail().isBlank() && !c.getContactEmail().contains("@")) {
            throw new ValidationException("Contact email must be valid");
        }
    }
}
