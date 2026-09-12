package com.campushire.repository;

import com.campushire.entity.Application;
import com.campushire.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    Optional<Application> findByStudentIdAndJobId(Long studentId, Long jobId);

    List<Application> findByStudentId(Long studentId);

    List<Application> findByJobId(Long jobId);

    List<Application> findByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH j.company c " +
           "WHERE (:studentId IS NULL OR s.id = :studentId) " +
           "AND (:jobId IS NULL OR j.id = :jobId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "ORDER BY a.id DESC")
    List<Application> searchApplications(@Param("studentId") Long studentId,
                                         @Param("jobId") Long jobId,
                                         @Param("status") ApplicationStatus status);

    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH j.company c " +
           "WHERE a.id = :id")
    Optional<Application> findByIdWithDetails(@Param("id") Long id);
}
