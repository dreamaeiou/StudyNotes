package Serializable;

import java.io.Serializable;

public class MyTest implements Serializable{

    // 默认序列化版本ID 用于 序列化版本控制
    private static final long serialVersionUID = 1L;

    public String name;

    public int age;

    public transient String sex;

    public MyTest(String name, int age, String sex) {
        this.name = name;
        this.age = age;
        this.sex = sex;
    }

    public MyTest() {

    }

}
