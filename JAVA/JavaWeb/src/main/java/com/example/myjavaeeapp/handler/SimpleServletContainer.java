package com.example.myjavaeeapp.handler;

import com.example.myjavaeeapp.annotation.WebServlet;
import com.example.myjavaeeapp.model.HttpServletRequest;
import com.example.myjavaeeapp.model.HttpServletResponse;
import com.example.myjavaeeapp.model.Servlet;
import com.example.myjavaeeapp.scanner.ClassScanner;
import com.example.myjavaeeapp.model.GenericServlet;
import java.io.*;
import java.net.*;
import java.util.*;
import java.lang.reflect.*;

public class SimpleServletContainer {
    private final int port;
    private final Map<String, Servlet> servlets = new HashMap<>();

    public SimpleServletContainer(int port) {
        this.port = port;
    }

    // 注册 Servlet
    public void registerServlets(String basePackage) {
        try {
            List<Class<?>> classes = ClassScanner.scanPackage(basePackage);
            for (Class<?> clazz : classes) {
                WebServlet annotation = clazz.getAnnotation(WebServlet.class);
                if (annotation != null) {
                    String path = annotation.value();
                    // 使用反射实例化 servlet 类
                    Servlet servlet = (Servlet) clazz.getDeclaredConstructor().newInstance();
                    servlets.put(path, servlet);
                    System.out.println("Registered Servlet: " + path + " -> " + clazz.getName());

                    // 初始化 Servlet
                    if (servlet instanceof GenericServlet) {
                        ((GenericServlet) servlet).init();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 启动服务器
    public void start() throws IOException {
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Server started on port " + port);

        // 监听并处理客户端请求
        while (true) {
            Socket socket = serverSocket.accept();
            new Thread(new RequestHandler(socket)).start();
        }
    }

    // 处理请求
    private class RequestHandler implements Runnable {
        private final Socket socket;

        public RequestHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            try {
                InputStream inputStream = socket.getInputStream();
                OutputStream outputStream = socket.getOutputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));

                // 读取请求的第一行
                String requestLine = reader.readLine();
                if (requestLine == null) return;
                String[] requestParts = requestLine.split(" ");
                String method = requestParts[0];
                String path = requestParts[1];

                // 读取请求头部
                Map<String, String> headers = new HashMap<>();
                String line;
                while ((line = reader.readLine()) != null && !line.isEmpty()) {
                    String[] headerParts = line.split(": ");
                    if (headerParts.length == 2) {
                        headers.put(headerParts[0], headerParts[1]);
                    }
                }

                // 构建请求对象
                HttpServletRequest request = new HttpServletRequest(method, path, headers);
                HttpServletResponse response = new HttpServletResponse(outputStream);

                // 根据路径找到对应的 Servlet
                Servlet servlet = servlets.get(path);
                if (servlet != null) {
                    // 根据请求的方法，调用不同的 doGet 或 doPost
                    if ("GET".equalsIgnoreCase(method)) {
                        servlet.service(request, response);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        servlet.service(request, response);
                    } else {
                        response.setStatus(405, "Method Not Allowed");
                        response.write("405 - Method Not Allowed");
                    }
                } else {
                    response.setStatus(404, "Not Found");
                    response.write("404 - Not Found");
                }

                // 输出响应
                response.flush();
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // 销毁所有的 Servlets
    public void destroy() {
        for (Servlet servlet : servlets.values()) {
            if (servlet instanceof GenericServlet) {
                ((GenericServlet) servlet).destroy();
            }
        }
    }
}
