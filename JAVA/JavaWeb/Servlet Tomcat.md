# Servlet

## 1.Servlet介绍

```
Servlet(Server Applet) 是Java Servlet简称。是运行在 Web 服务器或应用服务器上的程序，它是作为来自 Web 浏览器或其他 HTTP 客户端的请求和 HTTP 服务器上的数据库或应用程序之间的中间层。
```

```
CGI(Common Gateway Interface) 是Web服务器提供信息服务的标准接口。通过CGI，服务器可以获取客户端提交的信息转交给服务器端的CGI程序处理，再将结果返回给客户端。
```

```
为什么使用Servlet而不是CGI？
1.Servlet工作在Web服务器中，相较于CGI不需要单独创建一个线程来处理客户端请求，性能更好。
2.Servlet可以在多个客户端请求间共享数据。
3.Java的安全模型为Servlet提供了内置的安全特性。
4.使用Servlet，开发者可以利用Java丰富的库和框架，简化了开发过程。
```

## 2.Tomcat介绍

```
tomcat是Java应用的web服务器之一 用于部署运行Servlet项目与JSP项目
除了tomcat之外 还有Jetty WildFly这样的Java web服务器
在Spring Boot项目中 Tomcat是嵌入在其中的 这样可以直接运行JAR包而无需部署在外部服务器上
```

```
tomcat部分目录：
/bin 存放管理tomcat的脚本文件 编译JSP的工具等
/conf 存放tomcat的配置文件
/lib 存放tomcat需要的JAR库文件 及Web程序共享的类库 此处存放的JAR文件会被加载到全局CLASSPATH中
/work 存放JSP编译器生成的Java源文件与类文件 内容自动生成
/webapps 部署web应用的地方 包含WEB—INF META-INF 静态文件等 将WAR包存放于此会自动解压部署
```

## 3.Servlet + HelloWorld

```java
// HelloWorld.java
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class HelloWorld extends HttpServlet {
 
  private String message;

  public void init() throws ServletException
  {
      message = "Hello World";
  }

  public void doGet(HttpServletRequest request,
                    HttpServletResponse response)
            throws ServletException, IOException
  {
      response.setContentType("text/html");
      PrintWriter out = response.getWriter();
      out.println("<h1>" + message + "</h1>");
  }
  
  public void destroy()
  {
  }
}
```

```bash
$javac HelloWorld.java
#将生成的.class文件置于\webapps\ROOT\WEB-INF\classes中
```

```xml
<!--web.xml 文件置于\webapps\ROOT\WEB-INF中-->
</web-app>
  <servlet>
      <!--servlet的名称 相当于id 在xml中唯一-->
        <servlet-name>HelloWorld</servlet-name>
      <!--文件路径-->
        <servlet-class>HelloWorld</servlet-class>
    </servlet>

    <servlet-mapping>
        <!--引用之前的servlet名称-->
        <servlet-name>HelloWorld</servlet-name>
        <!--url中的访问路径-->
        <url-pattern>/HelloWorld</url-pattern>
    </servlet-mapping>
</web-app>
<!--启动Tomcat.exe 浏览器中访问localhost/HelloWorld-->
```

## 4.WAR包构建

```
MyWebApp/
├── WEB-INF/
│   ├── classes/ (编译后的.class文件)
│   ├── lib/ (第三方库的jar文件)
│   └── web.xml (部署描述符)
├── META-INF/ (可选，包含额外的元数据)
└── *.jsp, *.html, *.css, *.js (Web资源文件)
```

```
WAR(Web Application Archive) 是用于部署JavaEE或Servlet/JSP应用到支持JavaEE的Web服务器上的归档文件
本质上是一种遵循特殊目录规范的ZIP文件
```

```bash
jar -cvf MyWebApp.war -C MyWebApp/ . #递归地将MyWebApp目录中的所有文件添加到名为MyWebApp.war的WAR文件中。
```

