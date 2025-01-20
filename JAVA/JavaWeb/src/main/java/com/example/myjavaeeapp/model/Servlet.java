package com.example.myjavaeeapp.model;

import javax.servlet.ServletException;
import java.io.IOException;

public interface Servlet {

    // void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException;
    // void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException;

    public void init() throws ServletException;

    public void destroy();

    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException;

}
