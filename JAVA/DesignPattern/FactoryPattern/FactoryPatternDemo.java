package DesignPattern.FactoryPattern;

public class FactoryPatternDemo {

    /*
    * 模式：工厂模式
    * 应用：加载数据库驱动 通过名称创建 无需了解实现
    * */
    public static void main(String[] args) {
        ShapeFactory shapeFactory = new ShapeFactory();
        Shape shape1 = shapeFactory.getShape("CIRCLE");
        shape1.draw();
        Shape shape2 = shapeFactory.getShape("RECTANGLE");
        shape2.draw();
        Shape shape3 = shapeFactory.getShape("SQUARE");
        shape3.draw();
    }
}
