package com.example.backendproject.model.sc5;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TeacherSearchResponse {
    private Integer page;
    private Integer pageSize;
    private List<Teacher> data;
}
