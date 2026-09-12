package com.campushire.exception;

public class CampusHireException extends RuntimeException {
    private final String errorCode;

    public CampusHireException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public CampusHireException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
