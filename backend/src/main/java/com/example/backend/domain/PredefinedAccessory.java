package com.example.backend.domain;

public enum PredefinedAccessory {
    CHARGER("Încărcător"),
    BAG("Geantă"),
    MOUSE("Mouse"),
    KEYBOARD("Tastatură"),
    DOCK_STATION("Dock Station"),
    CABLES("Cabluri"),
    CASE("Husă"),
    POWER_SUPPLY("Alimentator"),
    HEADPHONES("Căști"),
    EXTERNAL_HDD("HDD extern");
    
    private final String displayName;
    
    PredefinedAccessory(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static PredefinedAccessory fromDisplayName(String displayName) {
        for (PredefinedAccessory accessory : PredefinedAccessory.values()) {
            if (accessory.getDisplayName().equalsIgnoreCase(displayName)) {
                return accessory;
            }
        }
        return null;
    }
}