package com.nutrilens.nutrilens_backend.common.dto.vision;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisionAnalyzeResponseDTO {

    private List<String> predictions;

    @JsonProperty("nutritional_info")
    private NutritionalInfo nutritionalInfo;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NutritionalInfo {
        private Integer calories;
        private Double protein;
        private Double carbs;
        private Double fat;
    }
}
