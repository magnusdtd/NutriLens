package com.nutrilens.nutrilens_backend.common.dto.vision;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class VisionAnalyzeResponseDTO {
    private List<String> predictions;
    private NutritionalInfo nutritionalInfo;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    public static class NutritionalInfo {
        private Integer calories;
        private Double protein;
        private Double carbs;
        private Double fat;
    }
}
