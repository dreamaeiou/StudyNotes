package StreamFileIO;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class File {

    public static void main(String[] args) {
        String inputFilePath = "C:\\Users\\xionghongrui\\Desktop\\JAVA复习\\StreamFileIO\\test.txt";
        String outputFilePath = "C:\\Users\\xionghongrui\\Desktop\\JAVA复习\\StreamFileIO\\output.txt";

        try (InputStream in = new FileInputStream(inputFilePath);
             FileOutputStream out = new FileOutputStream(outputFilePath)) {

            int byteRead;
            while ((byteRead = in.read()) != -1) {
                // 将读取的字节转换为两位的十六进制字符串，并写入输出文件
                String hexString = String.format("%02X", byteRead);
                out.write(hexString.getBytes());
                out.write(" ".getBytes()); // 可选：添加空格分隔符
            }

            System.out.println("文件已成功转换并保存为十六进制格式。");

        } catch (FileNotFoundException e) {
            System.err.println("文件未找到: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("发生I/O错误: " + e.getMessage());
        }
    }
}