package com.example.backendproject.model.sc5;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UploadLanguageTeacherRequest {
    private List<LanguageTeacherMappingUpload> languageTeacherCreateRequests;
    private Long dataset;
}
