package OOP;

/* 
 * 接口中可以包含抽象方法 默认方法 静态方法
 */
public interface Read {

    // 两种抽象方法
    void read(String name);

    abstract void read(String name, String nickName);

    // 默认方法
    default void defaultMethod() {
        System.out.println("This is a default method.");
    }

    // 静态方法
    static void staticMethod() {
        System.out.println("This is a static method.");
    }

    public static void main(String[] args) {
        staticMethod();
    }

}