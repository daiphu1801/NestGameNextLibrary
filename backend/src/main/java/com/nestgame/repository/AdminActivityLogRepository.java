package com.nestgame.repository;

import com.nestgame.entity.AdminActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {

    Page<AdminActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AdminActivityLog> findByTargetTypeOrderByCreatedAtDesc(String targetType, Pageable pageable);

    List<AdminActivityLog> findTop20ByOrderByCreatedAtDesc();
}
