package com.journey.backend.auth.dto;

import com.journey.backend.user.User;
import java.util.UUID;

public record UserResponse(UUID id, String fullName, String email) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail());
    }
}
