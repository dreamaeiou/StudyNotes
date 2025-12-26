package OOP;

public class Man extends Human implements Read {

    // 类变量(静态变量)
    final static String nickName = "Dream";

    // 成员变量(实例变量)
    private String age;

    @Override
    public void read(String name) {
        System.out.println("I'm reading " + "《" + name + "》");
    }

    @Override
    public void read(String name, String nickName) {
        System.out.print("My nickName is " + nickName + ",");
        System.out.println(" I'm reading " + "《" + name + "》");
    }

    public static void main(String[] args) {

        // 多态 条件(继承 重写 父类引用子类）
        EnglishBook englishBook = new EnglishBook();
        Book book = new EnglishBook("ENGLISH", 440, "English");

//         englishBook.methodA();
//         englishBook.methodB();
//         book.methodA();
//         book.methodB(); // 无法调用EnglishBook方法

//        englishBook.methodC();
//        book.methodC(); // this is EnglishBook methodC 多态

        Man man = new Man();

//        man.read(englishBook.name, nickName);
        man.read(book.name);
//        man.defaultMethod();
    }
}