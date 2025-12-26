package com.example.myjavaeeapp.servlet;

import com.example.myjavaeeapp.annotation.WebServlet;
import com.example.myjavaeeapp.model.HttpServletRequest;
import com.example.myjavaeeapp.model.HttpServletResponse;
import com.example.myjavaeeapp.model.Servlet;

import com.example.myjavaeeapp.model.GenericServlet;

import javax.servlet.ServletException;
import java.io.IOException;

@WebServlet("/hello")
public class HelloServlet extends GenericServlet {

    /*@Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, GET Request with AOP!</h1>");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, POST Request with AOP!</h1>");
    }*/

    @Override
    public void init() throws ServletException {
        super.init();
        System.out.println("HelloServlet initialized.");
    }

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello from HelloServlet!</h1>");
    }

    @Override
    public void destroy() {
        super.destroy();
        System.out.println("HelloServlet destroyed.");
    }
}
