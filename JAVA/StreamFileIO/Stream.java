package StreamFileIO;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class Stream {
    public static void main(String[] args) throws IOException {

        // 使用 System.in 创建 BufferedReader 并指定编码为 UTF-8
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        System.out.println("输入字符, 按下 'q' 键退出。");

        int c;

        do {
            c = br.read();
            if (c != -1) {  // 检查是否到达流的末尾
                char ch = (char)c;
                System.out.printf("字符: %c, Unicode 值(十进制): %d, Unicode 值(十六进制): 0x%04X\n", ch, c, c);
            }
        } while (c != 'q' && c != -1);  // 当用户输入 'q' 或到达流末尾时退出
    }
}