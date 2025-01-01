# 学习通无法直接下载的ppt转pdf脚本
```
    使用说明：
        1、本脚本版本依赖于:
            python = 3.10.6及以上;
            requests = 2.32.3; 命令: pip install requests
            fpdf = 1.72; 命令: pip install fpdf
            pillow =  11.0.0; 命令: pip install pillow

        2、教程：
            参考配套说明文档 "README.md"。
            从浏览器的管理员面板获取下面的图片链接：
            https://s3.ananas.chaoxing.com/sv-w7/doc/51/18/e4/127ef24fab63d580372a890efd5dc250/thumb/1.png

            需要的是图片的根路径，此时的基础URL格式参考如下：
            base_url = "https://s3.ananas.chaoxing.com/sv-w7/doc/51/18/e4/127ef24fab63d580372a890efd5dc250/thumb/"
            
            输入相关链接请只保留到thumb之前的所有部分，之后跟随的1.png等请删去。
```

##### 本脚本会在当前路径下建立新的 images 和 out_pdf 文件，用于接收获取到的图片，并且输出最后成品pdf


### 暂时还未补充