package com.example.backend.util;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    // Phone number pattern (Romanian format)
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^(\\+40|0)?[0-9]{9}$");
    
    // Serial number pattern (alphanumeric)
    private static final Pattern SERIAL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9-_]{3,50}$");
    
    // Hostname pattern
    private static final Pattern HOSTNAME_PATTERN = 
        Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?$");

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    public static boolean isValidSerial(String serial) {
        return serial != null && SERIAL_PATTERN.matcher(serial).matches();
    }

    public static boolean isValidHostname(String hostname) {
        return hostname != null && HOSTNAME_PATTERN.matcher(hostname).matches();
    }

    public static String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        // Remove potentially dangerous characters
        return input.replaceAll("[<>\"';]", "").trim();
    }

    public static void validateEmail(String email) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    public static void validatePhone(String phone) {
        if (!isValidPhone(phone)) {
            throw new IllegalArgumentException("Invalid phone number format");
        }
    }

    public static void validateSerial(String serial) {
        if (!isValidSerial(serial)) {
            throw new IllegalArgumentException("Invalid serial number format");
        }
    }

    public static void validateHostname(String hostname) {
        if (!isValidHostname(hostname)) {
            throw new IllegalArgumentException("Invalid hostname format");
        }
    }
}
