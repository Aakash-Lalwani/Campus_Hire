package com.campushire.enums;

public enum PlacementStatus {
    NOT_PLACED,
    PLACED,
    HIGHER_STUDIES;

    public static PlacementStatus fromString(String text) {
        if (text == null) return NOT_PLACED;
        for (PlacementStatus status : PlacementStatus.values()) {
            if (status.name().equalsIgnoreCase(text.trim())) {
                return status;
            }
        }
        return NOT_PLACED;
    }
}
