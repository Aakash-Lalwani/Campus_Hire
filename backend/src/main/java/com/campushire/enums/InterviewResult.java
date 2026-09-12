package com.campushire.enums;

public enum InterviewResult {
    PENDING,
    PASSED,
    FAILED;

    public static InterviewResult fromString(String text) {
        if (text == null) return PENDING;
        for (InterviewResult result : InterviewResult.values()) {
            if (result.name().equalsIgnoreCase(text.trim())) {
                return result;
            }
        }
        return PENDING;
    }
}
