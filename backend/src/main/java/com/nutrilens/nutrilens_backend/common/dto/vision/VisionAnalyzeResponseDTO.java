package com.nutrilens.nutrilens_backend.common.dto.vision;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisionAnalyzeResponseDTO {

    @JsonProperty("volume_predictions")
    private List<VolumePrediction> volumePredictions;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VolumePrediction {

        @JsonProperty("object_name")
        private String objectName;

        @JsonProperty("volume_m3")
        private Double volumeM3;

        @JsonProperty("weight_g")
        private Double weightG;

        @JsonProperty("density_g_per_cm3")
        private Double densityGPerCm3;

        @JsonProperty("score")
        private Double score;

        @JsonProperty("box")
        private List<Integer> box;
    }
}
