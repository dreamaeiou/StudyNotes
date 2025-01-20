package com.example.myjavaeeapp.scanner;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.lang.reflect.*;
import java.net.*;

public class ClassScanner {
    /**
     * 扫描指定包名下的所有类
     *
     * @param packageName 包名，例如"com.example"
     * @return 包含指定包下所有类的列表
     * @throws IOException 当无法访问资源时抛出
     * @throws ClassNotFoundException 当类名无效时抛出
     */
    public static List<Class<?>> scanPackage(String packageName) throws IOException, ClassNotFoundException {
        List<Class<?>> classes = new ArrayList<>();
        // 将包名转换为路径名
        String path = packageName.replace('.', '/');
        // 获取资源路径
        URL resource = ClassLoader.getSystemClassLoader().getResource(path);
        if (resource == null) {
            // 如果资源路径为空，则直接返回空列表
            return classes;
        }
        File directory = new File(resource.getFile());
        if (directory.exists()) {
            // 遍历路径下的所有文件和文件夹
            for (File file : directory.listFiles()) {
                if (file.isDirectory()) {
                    // 如果是文件夹，则递归调用scanPackage方法
                    classes.addAll(scanPackage(packageName + "." + file.getName()));
                } else if (file.getName().endsWith(".class")) {
                    // 如果是.class文件，则将其名称转换为类名，并加载该类
                    String className = packageName + "." + file.getName().substring(0, file.getName().length() - 6);
                    classes.add(Class.forName(className));
                }
            }
        }
        return classes;
    }
}
