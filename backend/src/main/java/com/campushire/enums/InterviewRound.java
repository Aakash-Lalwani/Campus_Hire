package com.campushire.enums;

public enum InterviewRound {
    APTITUDE,
    TECHNICAL,
    HR;

    public static InterviewRound fromString(String text) {
        if (text == null) return TECHNICAL;
        for (InterviewRound round : InterviewRound.values()) {
            if (round.name().equalsIgnoreCase(text.trim())) {
                return round;
            }
        }
        return TECHNICAL;
    }
}
