package Serializable;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.ObjectInputStream;

public class DeserializeDemo {

    public static void main(String[] args) {
        MyTest myTest = null;

        try {
            FileInputStream fileIn = new FileInputStream("myTest.txt");
            ObjectInputStream objectIn = new ObjectInputStream(fileIn);
            myTest = (MyTest) objectIn.readObject();
            objectIn.close();
            fileIn.close();
            System.out.println("反序列化完成");
            System.out.println(myTest.name);
            System.out.println(myTest.age);
            System.out.println(myTest.sex);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

}
