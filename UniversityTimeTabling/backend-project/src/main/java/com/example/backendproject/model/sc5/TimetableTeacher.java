package com.example.backendproject.model.sc5;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TimetableTeacher {
    private List<Class> data;
    private Teacher teacher;
    private Long dataset;
}
