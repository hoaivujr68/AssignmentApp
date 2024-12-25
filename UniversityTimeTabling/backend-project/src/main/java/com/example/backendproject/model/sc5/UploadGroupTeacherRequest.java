package com.example.backendproject.model.sc5;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UploadGroupTeacherRequest {
    private List<GroupTeacherUpload> groupTeacherCreateRequests;
    private Long dataset;
}
