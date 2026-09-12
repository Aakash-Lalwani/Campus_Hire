package com.campushire.service;

import com.campushire.dto.CompanyRequestDTO;
import com.campushire.dto.CompanyResponseDTO;
import com.campushire.entity.Company;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Autowired
    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<CompanyResponseDTO> getAllCompanies(String search) {
        List<Company> companies = companyRepository.searchCompanies(search);
        return companies.stream()
                .map(CompanyResponseDTO::new)
                .toList();
    }

    public CompanyResponseDTO getCompanyById(Long id) {
        Company company = findEntityById(id);
        return new CompanyResponseDTO(company);
    }

    public Company findEntityById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company with ID " + id + " not found"));
    }

    @Transactional
    public CompanyResponseDTO createCompany(CompanyRequestDTO dto) {
        Company company = new Company(
                null,
                dto.getName(),
                dto.getIndustry(),
                dto.getLocation(),
                dto.getWebsite(),
                dto.getContactPerson(),
                dto.getContactEmail()
        );

        Company saved = companyRepository.save(company);
        return new CompanyResponseDTO(saved);
    }

    @Transactional
    public CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO dto) {
        Company company = findEntityById(id);

        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setLocation(dto.getLocation());
        company.setWebsite(dto.getWebsite());
        company.setContactPerson(dto.getContactPerson());
        company.setContactEmail(dto.getContactEmail());

        Company updated = companyRepository.save(company);
        return new CompanyResponseDTO(updated);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = findEntityById(id);
        companyRepository.delete(company);
    }
}
