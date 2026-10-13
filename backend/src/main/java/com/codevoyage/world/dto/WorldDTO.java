package com.codevoyage.world.dto;

import com.codevoyage.mission.dto.MissionSummaryDTO;

import java.util.List;

public class WorldDTO {
    private Long id;
    private Integer worldOrder;
    private String slug;
    private String name;
    private String theme;
    private String lore;
    private Boolean unlockedByDefault;
    private List<MissionSummaryDTO> missions;

    public WorldDTO() {}

    public WorldDTO(Long id, Integer worldOrder, String slug, String name, String theme, String lore, Boolean unlockedByDefault, List<MissionSummaryDTO> missions) {
        this.id = id;
        this.worldOrder = worldOrder;
        this.slug = slug;
        this.name = name;
        this.theme = theme;
        this.lore = lore;
        this.unlockedByDefault = unlockedByDefault;
        this.missions = missions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getWorldOrder() { return worldOrder; }
    public void setWorldOrder(Integer worldOrder) { this.worldOrder = worldOrder; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getLore() { return lore; }
    public void setLore(String lore) { this.lore = lore; }

    public Boolean getUnlockedByDefault() { return unlockedByDefault; }
    public void setUnlockedByDefault(Boolean unlockedByDefault) { this.unlockedByDefault = unlockedByDefault; }

    public List<MissionSummaryDTO> getMissions() { return missions; }
    public void setMissions(List<MissionSummaryDTO> missions) { this.missions = missions; }
}
