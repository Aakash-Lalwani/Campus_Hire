package com.campushire.enums;

public enum ApplicationStatus {
    APPLIED(1),
    SHORTLISTED(2),
    APTITUDE(3),
    TECHNICAL(4),
    HR(5),
    SELECTED(6),
    REJECTED(0);

    private final int rank;

    ApplicationStatus(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }

    public static ApplicationStatus fromString(String text) {
        if (text == null) return APPLIED;
        for (ApplicationStatus status : ApplicationStatus.values()) {
            if (status.name().equalsIgnoreCase(text.trim())) {
                return status;
            }
        }
        return APPLIED;
    }

    public boolean isValidTransitionTo(ApplicationStatus next) {
        if (this == REJECTED || this == SELECTED) {
            return false; // Terminal states
        }
        if (next == REJECTED) {
            return true; // Can be rejected from any active stage
        }
        if (next == SELECTED) {
            return this == HR || this == TECHNICAL; // Can only become selected after HR or Tech
        }
        // General progression allows advancing or staying at same round
        return next.rank >= this.rank;
    }
}
