package OOP;

public class EnglishBook extends Book {

    private String subject;

    public EnglishBook(String name, int page, String subject) {
        // 隐式调用父类的无参构造方法
        // super();

        this.name = name;
        this.page = page;
        // this.author = author;
        this.subject = subject;
    }

    public EnglishBook() {
        // 显式地调用父类的有参构造方法
        super("Hello");

        // 调用子类相同形参的构造方法
        // this("How To Learn", 339, "English");
    }

    public void methodB() {
        System.out.println("this is methodB");
    }

    public void methodC() {
        System.out.println("this is EnglishBook methodC");
    }

}