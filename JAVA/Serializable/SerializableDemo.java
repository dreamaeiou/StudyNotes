package Serializable;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;

public class SerializableDemo {

    public static void main(String[] args) throws Exception {
        MyTest myTest = new MyTest();
        myTest.name = "MyTest";
        myTest.age = 18;
        myTest.sex = "man";

        // 创建一个文件输出流，指向名为"myTest.txt"的文件
        FileOutputStream fileOut = new FileOutputStream("myTest.txt");
        // 在文件输出流之上创建一个对象输出流，用于将对象序列化到文件中
        ObjectOutputStream objectOut = new ObjectOutputStream(fileOut);
        objectOut.writeObject(myTest);
        objectOut.close();
        fileOut.close();
        System.out.println("序列化完成");

    }

}
