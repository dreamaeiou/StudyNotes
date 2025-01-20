package Thread;

public class SimpleThreadExample {

    public static void main(String[] args) {
        // 创建并启动第一个线程，通过继承Thread类
        Thread thread1 = new MyThread("Thread 1");

        // 创建并启动第二个线程，通过实现Runnable接口
        Thread thread2 = new Thread(new MyRunnable(), "Thread 2");

        // 启动线程
        thread1.start();
        thread2.start();

        // 主线程等待thread1和thread2执行完毕
        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("All threads have finished execution.");
    }
}

// 继承Thread类的方式
class MyThread extends Thread {
    private String threadName;

    MyThread(String name) {
        this.threadName = name;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(this.threadName + ": " + i);
            try {
                // 让线程暂停一下，模拟耗时操作
                Thread.sleep(1000); // 睡眠1秒
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// 实现Runnable接口的方式
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (char c = 'A'; c <= 'E'; c++) {
            System.out.println(Thread.currentThread().getName() + ": " + c);
            try {
                // 让线程暂停一下，模拟耗时操作
                Thread.sleep(1000); // 睡眠1秒
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}