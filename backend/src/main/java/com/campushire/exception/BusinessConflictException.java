package com.campushire.exception;

public class BusinessConflictException extends CampusHireException {
    public BusinessConflictException(String message) {
        super(message, "DUPLICATE_APPLICATION");
    }

    public BusinessConflictException(String message, String errorCode) {
        super(message, errorCode);
    }
}
