package com.campushire.enums;

public enum JobStatus {
    OPEN,
    CLOSED;

    public static JobStatus fromString(String text) {
        if (text == null) return OPEN;
        for (JobStatus status : JobStatus.values()) {
            if (status.name().equalsIgnoreCase(text.trim())) {
                return status;
            }
        }
        return OPEN;
    }
}
