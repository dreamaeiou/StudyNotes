package com.example.myjavaeeapp.model;

import java.util.Map;

public class HttpServletRequest {
    private final String method;
    private final String path;
    private final Map<String, String> headers;

    public HttpServletRequest(String method, String path, Map<String, String> headers) {
        this.method = method;
        this.path = path;
        this.headers = headers;
    }

    public String getMethod() {
        return method;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }
}
