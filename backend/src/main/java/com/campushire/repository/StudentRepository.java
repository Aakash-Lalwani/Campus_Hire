package com.campushire.repository;

import com.campushire.entity.Student;
import com.campushire.enums.PlacementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByPlacementStatus(PlacementStatus status);

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.skills) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:branch IS NULL OR :branch = '' OR :branch = 'ALL' OR s.branch = :branch) " +
           "AND (:status IS NULL OR s.placementStatus = :status) " +
           "ORDER BY s.id DESC")
    List<Student> searchStudents(@Param("search") String search,
                                 @Param("branch") String branch,
                                 @Param("status") PlacementStatus status);

    @Query("SELECT s.branch AS branch, COUNT(s) AS total, " +
           "SUM(CASE WHEN s.placementStatus = com.campushire.enums.PlacementStatus.PLACED THEN 1L ELSE 0L END) AS placed " +
           "FROM Student s GROUP BY s.branch")
    List<BranchPlacementProjection> countPlacementsByBranch();

    interface BranchPlacementProjection {
        String getBranch();
        Long getTotal();
        Long getPlaced();
    }
}
