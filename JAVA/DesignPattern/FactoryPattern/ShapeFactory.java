package DesignPattern.FactoryPattern;

public class ShapeFactory {

    public Shape getShape(String shapeType) {
        if(shapeType == null) {
            return null;
        }
        // equalsIgnoreCase不会精确匹配大小写
        if (shapeType.equalsIgnoreCase("CIRCLE")) {
            return new Circle();
        } else if (shapeType.equalsIgnoreCase("RECTANGLE")) {
            return new Rectangle();
        } else if (shapeType.equalsIgnoreCase("SQUARE")) {
            return new Square();
        }
        return null;
    }

}
