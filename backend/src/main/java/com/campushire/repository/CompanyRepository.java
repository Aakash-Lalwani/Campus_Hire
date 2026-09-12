package com.campushire.repository;

import com.campushire.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {

    Optional<Company> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT c FROM Company c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.industry) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.id DESC")
    List<Company> searchCompanies(@Param("search") String search);

    @Query("SELECT c.name AS company, COUNT(a.id) AS applications " +
           "FROM Company c " +
           "LEFT JOIN c.jobs j " +
           "LEFT JOIN j.applications a " +
           "GROUP BY c.id, c.name " +
           "ORDER BY applications DESC")
    List<CompanyApplicationProjection> countApplicationsByCompany();

    interface CompanyApplicationProjection {
        String getCompany();
        Long getApplications();
    }
}
