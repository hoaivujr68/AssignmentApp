package com.example.backendproject.model.sc5;

import com.example.backendproject.model.BaseFilterRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProjectSearchRequest extends BaseFilterRequest {
    private Long id;

    private Long dataset;
}
