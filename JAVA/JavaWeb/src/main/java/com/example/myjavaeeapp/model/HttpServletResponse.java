package com.example.myjavaeeapp.model;

import java.io.*;

public class HttpServletResponse {
    private final OutputStream output;
    private int statusCode = 200;
    private String statusMessage = "OK";
    private final ByteArrayOutputStream content = new ByteArrayOutputStream();

    public HttpServletResponse(OutputStream output) {
        this.output = output;
    }

    public void setStatus(int statusCode, String statusMessage) {
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }

    public void write(String content) throws IOException {
        this.content.write(content.getBytes());
    }

    public void flush() throws IOException {
        String response = "HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n";
        response += "Content-Length: " + content.size() + "\r\n";
        response += "\r\n";
        response += content.toString();
        output.write(response.getBytes());
        output.flush();
    }
}
