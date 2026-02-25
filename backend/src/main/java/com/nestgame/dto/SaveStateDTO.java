package com.nestgame.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveStateDTO {
    private Long id;
    private Long gameId;
    private String gameName;
    private Integer slot;
    private boolean hasThumbnail;
    private long stateSize;
    private LocalDateTime updatedAt;
}
