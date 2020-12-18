package com.getcapacitor;

public enum PermissionState {
    GRANTED("granted"),
    DENIED("denied"),
    PROMPT("prompt"),
    PROMPT_WITH_RATIONALE("prompt-with-rationale");

    private String state;

    PermissionState(String state) {
        this.state = state;
    }

    @Override
    public String toString() {
        return state;
    }
}
