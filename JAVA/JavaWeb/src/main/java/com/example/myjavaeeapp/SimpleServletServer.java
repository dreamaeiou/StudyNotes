package com.example.myjavaeeapp;

import com.example.myjavaeeapp.handler.SimpleServletContainer;

import java.io.IOException;

public class SimpleServletServer {
    public static void main(String[] args) throws IOException {
        SimpleServletContainer container = new SimpleServletContainer(8080);

        // 扫描并自动注册带有 @WebServlet 注解的 Servlet
        container.registerServlets("com.example.myjavaeeapp.servlet");

        // 启动服务器
        container.start();

//        // 假设我们捕获关闭信号（这里模拟关闭），可以调用销毁方法
//        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
//            System.out.println("Server shutting down...");
//            container.destroy();  // 销毁所有 Servlet
//        }));

    }
}
