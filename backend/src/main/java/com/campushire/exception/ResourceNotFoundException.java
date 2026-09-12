package com.campushire.exception;

public class ResourceNotFoundException extends CampusHireException {
    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}
