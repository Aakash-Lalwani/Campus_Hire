package com.campushire.exception;

public class ValidationException extends CampusHireException {
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR");
    }
}
