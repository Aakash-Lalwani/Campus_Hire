package com.campushire.repository;

import com.campushire.entity.Interview;
import com.campushire.enums.InterviewResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long>, JpaSpecificationExecutor<Interview> {

    List<Interview> findByApplicationId(Long applicationId);

    @Query("SELECT i FROM Interview i " +
           "JOIN FETCH i.application a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH j.company c " +
           "WHERE (:applicationId IS NULL OR a.id = :applicationId) " +
           "AND (:result IS NULL OR i.result = :result) " +
           "ORDER BY i.scheduledAt DESC")
    List<Interview> searchInterviews(@Param("applicationId") Long applicationId,
                                     @Param("result") InterviewResult result);

    @Query("SELECT i FROM Interview i " +
           "JOIN FETCH i.application a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH j.company c " +
           "WHERE i.id = :id")
    Optional<Interview> findByIdWithDetails(@Param("id") Long id);
}
