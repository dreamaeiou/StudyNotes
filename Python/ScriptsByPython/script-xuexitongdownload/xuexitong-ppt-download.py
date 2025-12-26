import os
import requests
from fpdf import FPDF
from PIL import Image

"""
    使用说明：
        1、本脚本版本依赖于:
            python = 3.10.6及以上;
            requests = 2.32.3; 命令: pip install requests
            fpdf = 1.72; 命令: pip install fpdf
            pillow =  11.0.0; 命令: pip install pillow

        2、教程：
            参考配套说明文档 "README.md"。
            图片路径基础URL格式参考如下：
            base_url = "https://s3.ananas.chaoxing.com/sv-w7/doc/51/18/e4/127ef24fab63d580372a890efd5dc250/thumb/"
            输入相关链接请只保留到thumb之前的所有部分，之后跟随的1.png等请删去。
"""

def download_picture(start, end, path_img, base_url):
    # 循环下载图片
    for i in range (start, end + 1):
        # 构造完整的图片URL
        url = f"{base_url}{i}.png"
        # 发起请求下载图片
        try:
            response = requests.get (url)
            response.raise_for_status ()  # 如果请求失败，将抛出异常

            # 保存图片到本地
            with open (f'{path_img}/{i}.png', 'wb') as f:
                f.write (response.content)
            print (f"{i}.png 已经成功下载")
        except requests.RequestException as e:
            print (f"错误下载 {i}.png: {e}")

def convert_images_to_pdf(img_folder, output_pdf, path_pdf, start, end):
    # 整合成pdf
    print("请等待，正在生成中……")
    # 获取指定范围内的图片文件名列表
    image_files = [f"{img_folder}/{i}.png" for i in range(start, end + 1)]

    # 检查图片文件是否存在
    for img_file in image_files:
        if not os.path.exists(img_file):
            print(f"Warning: {img_file} does not exist.")
            return

    # 打开第一张图片以获取尺寸
    first_img = Image.open(image_files[0])
    width, height = first_img.size

    # 创建PDF对象，使用第一张图片的尺寸
    pdf = FPDF(unit="pt", format=[width, height])

    # 遍历图片文件列表
    for img_file in image_files:
        # 打开图片
        img = Image.open(img_file)
        # 为每张图片添加新页面
        pdf.add_page()
        # 获取图片尺寸
        img_width, img_height = img.size

        # 将图片添加到PDF页面，居中显示
        # 计算图片在页面中的x和y坐标
        x = (width - img_width) / 2
        y = (height - img_height) / 2
        pdf.image(img_file, x, y, img_width, img_height)
    # 输出PDF文件
    pdf.output(path_pdf + '/' + output_pdf, "F")
    print (f"{output_pdf}生成完成")


if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # 检查目录是否存在，不存在则创建
    path_img = os.path.join(current_dir, 'images') # 默认存放路径
    path_pdf = os.path.join(current_dir, 'out_pdf') # pdf默认存放路径
    if not os.path.exists(path_img):
        os.makedirs(path_img)
    if not os.path.exists(path_pdf):
        os.makedirs(path_pdf)

    # 图片存储的基础URL
    base_url = str(input("请输入相关链接："))
    # ppt的始末位置
    start, end = int(input("请输入初始位置：")), int(input("请输入结束位置："))
    # pdf命名
    image_folder = path_img
    file_name = str(input("请输入你的pdf名字(例如test)：")) or 'test'
    output_pdf = file_name + '.pdf'  # 输出PDF文件名

    # 开始下载图片
    download_picture(start, end, image_folder, base_url)
    # 开始生成pdf
    convert_images_to_pdf(image_folder, output_pdf, path_pdf, start, end)