package com.codevoyage.analytics;

import com.codevoyage.analytics.dto.UserAnalyticsDTO;
import com.codevoyage.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/analytics", "/api/v1/analytics"})
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get learning analytics for authenticated cadet.
     * Security: Authenticated session only. Does NOT expose sensitive analytics to other users.
     */
    @GetMapping("/me")
    public ResponseEntity<UserAnalyticsDTO> getMyAnalytics(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated cadet found");
        }

        String username = authentication.getName();
        UserAnalyticsDTO analytics = analyticsService.getUserAnalytics(username);
        return ResponseEntity.ok(analytics);
    }
}
