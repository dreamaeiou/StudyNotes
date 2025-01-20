# README

本项目记录搭建Servlet容器过程



## 1.搭建基础servlet容器

```
HttpServletRequest HttpServletResponse 作为Service或doGet doPost参数
Servlet	接口
SimpleServletContainer 接受HTTP请求并将请求转发给相应的Servlet
HelloServlet 实现Servlet接口
SimpleServletServer 程序入口
```

```java
import java.io.*;
import java.util.*;

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

```

```java
public interface Servlet {
    void service(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
```

```java
import java.io.*;
import java.net.*;
import java.util.*;

public class SimpleServletContainer {
    private final int port;
    private final Map<String, Servlet> servlets = new HashMap<>();

    public SimpleServletContainer(int port) {
        this.port = port;
    }

    public void addServlet(String path, Servlet servlet) {
        servlets.put(path, servlet);
    }

    public void start() throws IOException {
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Server started on port " + port);
        
        while (true) {
            Socket socket = serverSocket.accept();
            new Thread(new RequestHandler(socket)).start();
        }
    }

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
                    servlet.service(request, response);
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
}

```

```java
public class HelloServlet implements Servlet {
    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, world!</h1>");
    }
}
```

```java
public class SimpleServletServer {
    public static void main(String[] args) throws IOException {
        SimpleServletContainer container = new SimpleServletContainer(8080);
        
        // 注册 Servlet
        container.addServlet("/hello", new HelloServlet());
        
        // 启动服务器
        container.start();
    }
}
```



## 2.实现doGet doPost方法

```
Servlet 扩展doGet doPost方法
HelloServlet 重写Servlet接口中方法
RequestHandler 根据不同methods响应不同结果
```

```java
public interface Servlet {
    void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException;
    void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
```

```java
public class HelloServlet implements Servlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, GET Request!</h1>");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, POST Request!</h1>");
    }
}
```

```java
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
                    servlet.doGet(request, response);
                } else if ("POST".equalsIgnoreCase(method)) {
                    servlet.doPost(request, response);
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

```



## 3.通过AOP与注解将Servlet映射到请求路径

```
WebServlet 自定义注解 指定Servlet类的URL映射路径
ClassScanner 创建类扫描工具
SimpleServletContainer 通过扫描工具支持注解自动映射
Servlet 添加注解
SimpleServletServer 暴露扫描入口
```

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)  // 作用在类上
public @interface WebServlet {
    String value();  // URL 映射路径
}
```

```java
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.lang.reflect.*;
import java.net.*;

public class ClassScanner {
    public static List<Class<?>> scanPackage(String packageName) throws IOException, ClassNotFoundException {
        List<Class<?>> classes = new ArrayList<>();
        String path = packageName.replace('.', '/');
        URL resource = ClassLoader.getSystemClassLoader().getResource(path);
        if (resource == null) {
            return classes;
        }
        File directory = new File(resource.getFile());
        if (directory.exists()) {
            for (File file : directory.listFiles()) {
                if (file.isDirectory()) {
                    classes.addAll(scanPackage(packageName + "." + file.getName()));
                } else if (file.getName().endsWith(".class")) {
                    String className = packageName + "." + file.getName().substring(0, file.getName().length() - 6);
                    classes.add(Class.forName(className));
                }
            }
        }
        return classes;
    }
}
```

```java
import java.io.*;
import java.lang.annotation.Annotation;
import java.net.*;
import java.util.*;
import java.lang.reflect.*;

class SimpleServletContainer {
    private final int port;
    private final Map<String, Servlet> servlets = new HashMap<>();

    public SimpleServletContainer(int port) {
        this.port = port;
    }

    // 扫描类路径并注册所有带有 @WebServlet 注解的 Servlet
    public void registerServlets(String basePackage) {
        // 这里假设扫描的是指定包中的类，可以用更复杂的类扫描工具来代替
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
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void start() throws IOException {
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Server started on port " + port);
        
        while (true) {
            Socket socket = serverSocket.accept();
            new Thread(new RequestHandler(socket)).start();
        }
    }

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
                        servlet.doGet(request, response);
                    } else if ("POST".equalsIgnoreCase(method)) {
                        servlet.doPost(request, response);
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
}
```

```java
@WebServlet("/hello")
public class HelloServlet implements Servlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, GET Request with AOP!</h1>");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.write("<h1>Hello, POST Request with AOP!</h1>");
    }
}
```

```java
public class SimpleServletServer {
    public static void main(String[] args) throws IOException {
        SimpleServletContainer container = new SimpleServletContainer(8080);
        
        // 扫描并自动注册带有 @WebServlet 注解的 Servlet
        container.registerServlets("your.package.name");

        // 启动服务器
        container.start();
    }
}
```



## 4.完善Servlet生命周期

```
GenericServlet 设计抽象类实现Servlet接口并提供init() destroy()默认实现 简化生命周期管理
SimpleServletContainer 为每一个Servlet的创建添加init() destroy()方法
SimpleServletServer 修改启动停止逻辑
HelloServlet 自定义初始化销毁逻辑
```

```java
// Servlet接口作出同步更改 再次不赘述
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
```

```java
import java.io.*;
import java.net.*;
import java.util.*;
import java.lang.reflect.*;

class SimpleServletContainer {
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
```

```java
public class SimpleServletServer {
    public static void main(String[] args) throws IOException {
        SimpleServletContainer container = new SimpleServletContainer(8080);
        
        // 注册并初始化所有带有 @WebServlet 注解的 Servlet
        container.registerServlets("your.package.name");

        // 启动服务器
        container.start();

        // 假设我们捕获关闭信号（这里模拟关闭），可以调用销毁方法
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Server shutting down...");
            container.destroy();  // 销毁所有 Servlet
        }));
    }
}
```

```java
@WebServlet("/hello")
class HelloServlet extends GenericServlet {
    @Override
    public void init() {
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
```

