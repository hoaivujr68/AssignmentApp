package com.example.backendproject.model.sc5;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UploadStudentProjectRequest {
    private List<StudentProjectUpload> studentProjectCreateRequests;
    private Long dataset;
}
