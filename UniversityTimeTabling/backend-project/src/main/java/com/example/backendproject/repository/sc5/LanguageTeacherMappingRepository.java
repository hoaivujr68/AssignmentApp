package com.example.backendproject.repository.sc5;

import com.example.backendproject.entity.sc5.LanguageTeacherMappingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LanguageTeacherMappingRepository extends JpaRepository<LanguageTeacherMappingEntity, Long> {
    List<LanguageTeacherMappingEntity> findByTeacherIdAndLanguageIdAndDataset(Long teacherId, Long languageId, Long dataset);
    List<LanguageTeacherMappingEntity> findByDataset(Long dataset);

}
