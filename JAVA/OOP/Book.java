package OOP;

public class Book {

    public String name;

    protected Integer page;

    private String author;
    
    public Book () {
        System.out.println("Book's no-arg constructor");
    }

    public Book(String message) {
        System.out.println("Book's parameterized constructor: " + message);
    }

    public void methodA() {
        System.out.println("this is methodA");
    }

    public void methodC() {
        System.out.println("this is Book methodC");
    }

}
