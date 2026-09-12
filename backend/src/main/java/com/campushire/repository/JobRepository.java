package com.campushire.repository;

import com.campushire.entity.Job;
import com.campushire.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByCompanyId(Long companyId);

    List<Job> findByJobStatus(JobStatus jobStatus);

    long countByJobStatus(JobStatus jobStatus);

    @Query("SELECT j FROM Job j JOIN FETCH j.company c WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(j.role) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(j.allowedBranches) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:companyId IS NULL OR c.id = :companyId) " +
           "AND (:status IS NULL OR j.jobStatus = :status) " +
           "ORDER BY j.id DESC")
    List<Job> searchJobs(@Param("search") String search,
                         @Param("companyId") Long companyId,
                         @Param("status") JobStatus status);

    @Query("SELECT " +
           "CASE " +
           "  WHEN j.packageLpa < 5.0 THEN '< 5 LPA' " +
           "  WHEN j.packageLpa >= 5.0 AND j.packageLpa <= 10.0 THEN '5-10 LPA' " +
           "  WHEN j.packageLpa > 10.0 AND j.packageLpa <= 20.0 THEN '10-20 LPA' " +
           "  ELSE '> 20 LPA' " +
           "END AS label, COUNT(j) AS count " +
           "FROM Job j GROUP BY " +
           "CASE " +
           "  WHEN j.packageLpa < 5.0 THEN '< 5 LPA' " +
           "  WHEN j.packageLpa >= 5.0 AND j.packageLpa <= 10.0 THEN '5-10 LPA' " +
           "  WHEN j.packageLpa > 10.0 AND j.packageLpa <= 20.0 THEN '10-20 LPA' " +
           "  ELSE '> 20 LPA' " +
           "END ORDER BY count DESC")
    List<PackageDistributionProjection> countPackageDistribution();

    interface PackageDistributionProjection {
        String getLabel();
        Long getCount();
    }
}
