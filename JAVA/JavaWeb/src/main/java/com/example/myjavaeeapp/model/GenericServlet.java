package com.example.myjavaeeapp.model;

import javax.servlet.ServletException;
import java.io.IOException;

public abstract class GenericServlet implements Servlet {
    private boolean initialized = false;

    @Override
    public void init() throws ServletException {
        // 初始化工作可以由子类覆盖
        if (!initialized) {
            System.out.println(this.getClass().getSimpleName() + " - Initializing...");
            initialized = true;
        }
    }

    @Override
    public void destroy() {
        // 销毁工作可以由子类覆盖
        System.out.println(this.getClass().getSimpleName() + " - Destroying...");
    }

    @Override
    public abstract void service(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
