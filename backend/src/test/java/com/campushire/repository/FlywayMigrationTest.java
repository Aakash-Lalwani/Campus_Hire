package com.campushire.repository;

import com.campushire.entity.Application;
import com.campushire.entity.Job;
import com.campushire.entity.Student;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.PlacementStatus;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FlywayMigrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Test
    @DisplayName("Should verify Flyway migration state and versions")
    void testFlywayMigrationState() {
        MigrationInfo current = flyway.info().current();
        assertNotNull(current, "Current Flyway migration should not be null");
        assertEquals("2", current.getVersion().getVersion(), "Flyway migration should be at version 2");
        assertEquals("seed demo data", current.getDescription());

        MigrationInfo[] applied = flyway.info().applied();
        assertEquals(2, applied.length, "Exactly 2 migrations (V1 schema, V2 seed) should be applied");
        assertEquals("1", applied[0].getVersion().getVersion());
        assertEquals("init schema", applied[0].getDescription());
    }

    @Test
    @DisplayName("Should verify V2 seed data count and entity mapping")
    void testSeedDataCounts() {
        assertEquals(15, studentRepository.count(), "Should have exactly 15 seeded students");
        assertEquals(6, companyRepository.count(), "Should have exactly 6 seeded companies");
        assertEquals(10, jobRepository.count(), "Should have exactly 10 seeded jobs");
        assertEquals(20, applicationRepository.count(), "Should have exactly 20 seeded applications");
        assertEquals(10, interviewRepository.count(), "Should have exactly 10 seeded interviews");

        // Verify placed students count from seed data
        long placedCount = studentRepository.countByPlacementStatus(PlacementStatus.PLACED);
        assertEquals(3, placedCount, "Seeded data should contain exactly 3 PLACED students initially");
    }

    @Test
    @DisplayName("Should enforce UNIQUE(student_id, job_id) constraint at database level")
    void testUniqueApplicationConstraint() {
        // Find existing application in seed data (student 1, job 1)
        assertTrue(applicationRepository.existsByStudentIdAndJobId(1L, 1L));

        Student student1 = studentRepository.findById(1L).orElseThrow();
        Job job1 = jobRepository.findById(1L).orElseThrow();

        // Attempt to insert duplicate application directly into repository
        Application duplicate = new Application(student1, job1, ApplicationStatus.APPLIED);

        assertThrows(DataIntegrityViolationException.class, () -> {
            applicationRepository.saveAndFlush(duplicate);
        }, "Database unique constraint uq_student_job must prevent duplicate applications");
    }
}
