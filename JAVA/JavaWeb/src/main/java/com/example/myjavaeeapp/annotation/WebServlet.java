package com.example.myjavaeeapp.annotation;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)  // 作用在类上
public @interface WebServlet {
    String value();  // URL 映射路径
}
