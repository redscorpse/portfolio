---
title: Maze
date: 2024.02.20 17:13
tags:
  - cybersecurity
  - ctf
  - writeup
  - HackTheBox
  - challenges
  - reversing
draft: false
---

> [!SUMMARY]  CHALLENGE DESCRIPTION
> https://app.hackthebox.com/challenges/Maze \
> I am stuck in a maze. Can you lend me a hand to find the way out?

We have three files:
```shell
┌──(kali  kalipi)-[~/maze]
└─$ ls rev_maze 
enc_maze.zip  maze.exe  maze.png
```

Since we are on linux, we can't execute `maze.exe`, and if we try to do an static analysis we won't find anything interesting. 
```shell
└─$ file maze.exe    
maze.exe: PE32+ executable (console) x86-64, for MS Windows, 7 sections
```

By running `strings` we can guess that the source code was written in python and then compiled into an executable. We can try to extract it with `pyinstxtractor` (PyInstaller Extractor):
```shell
└─$ strings maze.exe
<SNIP>
4python38.dll
```

```shell
curl -O https://raw.githubusercontent.com/extremecoders-re/pyinstxtractor/master/pyinstxtractor.py
python3 pyinstxtractor.py maze.exe
```

> [!warning] Python version must be 3.8
> ```
> [!] Please run this script in Python 3.8 to prevent extraction errors during unmarshalling
> ```

To make it easier, i just pulled a docker container to keep working from there, since I'm using a Raspberry Pi (ARM architecture):

```bash
┌──(kali  kalipi)-[~/maze/rev_maze]
└─$ docker run --privileged tonistiigi/binfmt:latest -install amd64 && docker run --platform=linux/amd64 --name=python -it -v $PWD:/root/ctf -w /root python:3.8.18-slim-bookworm
>>> import os; os.system("/bin/bash")
```
Now if we try to extract it again and there will be no warnings :)

```bash
root@569a79861a20:~/ctf# ls maze.exe_extracted/
PYZ-00.pyz            pyiboot01_bootstrap.pyc
PYZ-00.pyz_extracted  pyimod01_archive.pyc
VCRUNTIME140.dll      pyimod02_importers.pyc
_bz2.pyd              pyimod03_ctypes.pyc
_hashlib.pyd          pyimod04_pywin32.pyc
_lzma.pyd             python38.dll
_socket.pyd           select.pyd
base_library.zip      struct.pyc
libcrypto-1_1.dll     unicodedata.pyd
maze.pyc
```

From `pyinstxtractor` we also get this message:
```
You can now use a python decompiler on the pyc files within the extracted directory
```
so what we have to do next is to uncompile the `.pyc` files in order to get more information about the code. The tool that we will be using is `uncompyle6`
```bash
mkdir uncompiled
pip install uncompyle6
uncompyle6 maze.exe_extracted/maze.pyc > uncompiled/maze.py
```

> [!tip] Solving errors
> Maybe do you get this error:
>```shell
> File "/usr/local/lib/python3.8/site-packages/xdis/op_imports.py", line 187, in get_opcode_module
> return op_imports[canonic_python_version[vers_str]]
> KeyError: '3.8.18'
>```
> You just need to modify `op_impports.py`
>```diff file:"/usr/local/lib/python3.8/site-packages/xdis/op_imports.py"
>\- 187    return op_imports[canonic_python_version[vers_str]]
>\+ 187    return op_imports[canonic_python_version["3.8"]]
>```

```py file:"maze.py"
# uncompyle6 version 3.9.0
# Python bytecode version base 3.8.0 (3413)
# Decompiled from: Python 3.8.18 (default, Feb 13 2024, 11:06:24)
# [GCC 12.2.0]
# Embedded file name: maze.py
import sys, obf_path
ZIPFILE = 'enc_maze.zip'
print('Look who comes to me :)')
print()
inp = input('Now There are two paths from here. Which path will u choose? => ')
if inp == 'Y0u_St1ll_1N_4_M4z3':
    obf_path.obfuscate_route()
else:
    print('Unfortunately, this path leads to a dead end.')
    sys.exit(0)
import pyzipper
def decrypt(file_path, word):
    with pyzipper.AESZipFile(file_path, 'r', compression=(pyzipper.ZIP_LZMA), encryption=(pyzipper.WZ_AES)) as (extracted_zip):
        try:
            extracted_zip.extractall(pwd=word)
        except RuntimeError as ex:
            try:
                try:
                    print(ex)
                finally:
                    ex = None
                    del ex
            finally:
                ex = None
                del ex
decrypt(ZIPFILE, 'Y0u_Ar3_W4lkiNG_t0_Y0uR_D34TH'.encode())
with open('maze', 'rb') as (file):
    content = file.read()
data = bytearray(content)
data = [x for x in data]
key = [0] * len(data)
for i in range(0, len(data), 10):
    data[i] = (data[i] + 80) % 256
else:
    for i in range(0, len(data), 10):
        data[i] = (data[i] ^ key[i % len(key)]) % 256
    else:
        with open('dec_maze', 'wb') as (f):
            for b in data:
                f.write(bytes([b]))
# okay decompiling maze.exe_extracted/maze.pyc
```

You can use this code to unzip the `enc_maze.zip` file, just comment the `if` statement to continue the code execution (and also i had to run `pip install pyzipper`).

But after running the python script, even two files are generated (`maze` and `dec_maze`) containing data, no of them are readable.

The code also imports `obf_path`, which corresponds to another file in the extracted code, so we can try to get the source code of this in order to find some hints.
```bash
uncompyle6 maze.exe_extracted/PYZ-00.pyz_extracted/obf_path.pyc > uncompiled/obf_path.py
```

```py file:"obf_path.py"
# uncompyle6 version 3.9.0
# Python bytecode version base 3.8.0 (3413)
# Decompiled from: Python 3.8.18 (default, Feb 13 2024, 11:06:24)
# [GCC 12.2.0]
# Embedded file name: obf_path.py
def obfuscate_route():
    from marshal import loads
exec(loads(b'\xe3\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x06\x00\x00\x00@\x00\x00\x00s(\x00\x00\x00d\x00d\x01l\x00Z\x00d\x00d\x01l\x01Z\x01e\x02e\x00\xa0\x03e\x01\xa0\x03d\x02\xa1\x01\xa1\x01\x83\x01\x01\x00d\x01S\x00)\x03\xe9\x00\x00\x00\x00Ns4\x03\x00\x00\xfd7zXZ\x00\x00\x04\xe6\xd6\xb4F\x02\x00!\x01\x16\x00\x00\x00t/\xe5\xa3\x01\x02\xf6x\x9c\xedV[o\xd30\x14\xfe+^_\xd6\x02+Kz\xdf\x18\x9a\xe0\x01\x8d\x07@\x82\xa7)R\xe5\xc4\'\xa9\xb7\xd4\x8elgk#~<\xc7\x8e=\xba\xb6\x13\x9ax\xe9C#\xc5\xf9\xce\xfd\xf8\xf3q\xd5\xf9\\A\x91J\xad\xe7\xf8\x1c*\xbc\xea\x1cB\x17\xff\x84\x9d\xcbC\xe8\xe2\xc8\xe6\x91\xcd}l\xc2\n\xb2n))\xd3\xdd\xb4\x93\xac`\x90\xac\xce\xcf\xff\xf3\x1do\xca\xd7\x9b\x82\xc6\n\xd3M\x05\x0bKTZt\xbb\xab\x8b\xac.z\xd2\xc5V\x17/q\x19X\x83m7\xb26\xb0\xe0\x0e\x97!ksG\xb3\x90p\x04\xad\x86\xfa\xdeh\x14,\x13\x16\xf2L-\x1aZ\xc7\xd1\xbd\xf5R\xbf 1V7JV\xd3P\xc4\x17r\xfa\xf1\xae\xde\x01,"|\x074\xda\xb6\x9f\xdf\xb5\x19]\'\xe9\x8e&\xb3\x9a\x89]\xa6>:\x0eY\xf4o_w\xf2\xfa\xba\n\xc2\x06\xa7>8\xf6\x05a\x93\x8c\xdc\xba\xe5,1\x81;/\x8b \xe3w\xb2\xa1\xc7\x1d\xbch\xc9\xb6-X j\xa9S/\x10\n\xfb66\xb0\x96|\x7f\x84\xcd\x87K\xb2\x9a\xa5~8"\xb4\xceX;\x15{#\xe2\xd7\x92\xe7\xa6\xf0\xa7E=\x0c\xc7P\x98m\xcf\xfb\xb7^\xeb\xcc\xa8=I]\x02T\x8d\xa5zI\x1b\xe8W\xa2\xb0\xc2\xa0_\xad\x9b\xb3\x9bBH\xc5EA\xcc\x02H\xa5dZ\xc2\x92<Jqj\xc8\x92\xde\x03\xe1\x860\xaeiU\x01U\x97\xcdU&E\xae\xa406\x82\nF(c\n\xb4\xb6"zr\xed\xd2\x18Uc.j\x16\xc4H\x82fY\xd6\x86K\xd1o\xbe~\xbfG\x07jN5)\xa4d$\xad\r\xb9!E\x8d\x19\x9c\x9e\xd4D/d]2"\xe4#F\x9aZ\t\x82\xf5\x96\xbe;x\xe0\xb2\xd6.\xb5\xdf[\xacR\x8e0jyl7\xcf\xaf\xedxx\xfcc\x03\xb7\x9c\x06\xb19C,\xbe \x9f\'\'d-k\x92\xb9\xca\xa03Z\x81+(\xd3\xbcF\xc9\x00s%\x91\xb4(5\x96\x14\xb3\xc0\x9dr\xcb\xd0\x9a,\xa0\xacl\xf8\x05\xf1\x07\x11o\x1eD\xe3n\xa5\xd0\x00\xac\xdb\xbc\xed%"\x97\x8ap\xc2\x05QT\x14\xd0\x1d\xe0!^$\x82\xe0\x83\n\xc6\x85\xe9\x0e\xe2wQ<B\xd7\xe6\xfd\' \x9f\xa9\x82\xbc.O\xf0q=)Y\x1bh9Y\x80\x02K\xb9\x90\x86h\x9aC\xbf\xd7N[K\x8c\xd4\x1e\r\xf4:\xc0\xa1\xe1KP\xdb=\x06#U\xc5C\xc0\x1b\x14\x8f\x0b0\xd9#\xb3\x97%\xcaj\xa5@\x989\xe3\n2#\xd5\xfa6\x11\\0X\xcds^B\x98\xb7\n\x07\xca\x84L\xb0\xe2\x01\x8f\x11k\xf3\xd4\xcc\x9d\xe4"`Y\xc1\x13V@YH\xe5\x92\x07\x83e\x11\xcf\xd0M\xbbjG\xff\xef.v\x14>j\x92I\x86\x94)/N?,Q.\xe1c\xb8M\xe1\xd5o\x9e\x07\xdbK\xec<2\xc7\x97\xf0\xd2\xd4\x7f\x87\x9e\xc5\xe9\x96\xbe\xfdz\xefh\xbcO\xdb^p\xb27\xf0y\x01\xffk\x9b\xe7.t\x14\xac\x9d^\xef\xf8\x87\xe3\xf8\xf7\xed@a\xe7\x0f\xdc9\x01G\x00\x00(\xe3\xdf}\x13\x01@\xad\x00\x01\x8f\x06\xf7\x05\x00\x00\x85k\x89\xbe\xb1\xc4g\xfb\x02\x00\x00\x00\x00\x04YZ)\x04\xda\x04zlib\xda\x04lzma\xda\x04exec\xda\ndecompress\xa9\x00r\x06\x00\x00\x00r\x06\x00\x00\x00\xda\x07coduter\xda\x08<module>\x01\x00\x00\x00s\x02\x00\x00\x00\x10\x01'))
# okay decompiling maze.exe_extracted/PYZ-00.pyz_extracted/obf_path.pyc
```

The code attempts to load and execute some binary data using the `marshal` module, which is used for serializing and deserializing Python objects. Here, the code is *deserializing* the binary data represented between `b''` (reconstructing the original Python object from the byte stream).

We can try to put this bytecode into a `.pyc` file and run `uncompyle6` again, but we also need to include its header:
```python file:"write_bytes.py"
header = b'\x55\x0d\x0d\x0a\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
data = b'' #COPY HERE THE LONG STRING
file = header + data
with open('bytes1.pyc', 'wb') as f:
    f.write(file)
```

```bash
uncompyle6 bytes1.pyc > bytes1.py
```

```py file:"bytes1.py"
# uncompyle6 version 3.9.0
# Python bytecode version base 3.8.0 (3413)
# Decompiled from: Python 3.8.18 (default, Feb 13 2024, 11:06:24)
# [GCC 12.2.0]
# Embedded file name: coduter
import zlib, lzma
exec(zlib.decompress(lzma.decompress(b'\xfd7zXZ\x00\x00\x04\xe6\xd6\xb4F\x02\x00!\x01\x16\x00\x00\x00t/\xe5\xa3\x01\x02\xf6x\x9c\xedV[o\xd30\x14\xfe+^_\xd6\x02+Kz\xdf\x18\x9a\xe0\x01\x8d\x07@\x82\xa7)R\xe5\xc4\'\xa9\xb7\xd4\x8elgk#~<\xc7\x8e=\xba\xb6\x13\x9ax\xe9C#\xc5\xf9\xce\xfd\xf8\xf3q\xd5\xf9\\A\x91J\xad\xe7\xf8\x1c*\xbc\xea\x1cB\x17\xff\x84\x9d\xcbC\xe8\xe2\xc8\xe6\x91\xcd}l\xc2\n\xb2n))\xd3\xdd\xb4\x93\xac`\x90\xac\xce\xcf\xff\xf3\x1do\xca\xd7\x9b\x82\xc6\n\xd3M\x05\x0bKTZt\xbb\xab\x8b\xac.z\xd2\xc5V\x17/q\x19X\x83m7\xb26\xb0\xe0\x0e\x97!ksG\xb3\x90p\x04\xad\x86\xfa\xdeh\x14,\x13\x16\xf2L-\x1aZ\xc7\xd1\xbd\xf5R\xbf 1V7JV\xd3P\xc4\x17r\xfa\xf1\xae\xde\x01,"|\x074\xda\xb6\x9f\xdf\xb5\x19]\'\xe9\x8e&\xb3\x9a\x89]\xa6>:\x0eY\xf4o_w\xf2\xfa\xba\n\xc2\x06\xa7>8\xf6\x05a\x93\x8c\xdc\xba\xe5,1\x81;/\x8b \xe3w\xb2\xa1\xc7\x1d\xbch\xc9\xb6-X j\xa9S/\x10\n\xfb66\xb0\x96|\x7f\x84\xcd\x87K\xb2\x9a\xa5~8"\xb4\xceX;\x15{#\xe2\xd7\x92\xe7\xa6\xf0\xa7E=\x0c\xc7P\x98m\xcf\xfb\xb7^\xeb\xcc\xa8=I]\x02T\x8d\xa5zI\x1b\xe8W\xa2\xb0\xc2\xa0_\xad\x9b\xb3\x9bBH\xc5EA\xcc\x02H\xa5dZ\xc2\x92<Jqj\xc8\x92\xde\x03\xe1\x860\xaeiU\x01U\x97\xcdU&E\xae\xa406\x82\nF(c\n\xb4\xb6"zr\xed\xd2\x18Uc.j\x16\xc4H\x82fY\xd6\x86K\xd1o\xbe~\xbfG\x07jN5)\xa4d$\xad\r\xb9!E\x8d\x19\x9c\x9e\xd4D/d]2"\xe4#F\x9aZ\t\x82\xf5\x96\xbe;x\xe0\xb2\xd6.\xb5\xdf[\xacR\x8e0jyl7\xcf\xaf\xedxx\xfcc\x03\xb7\x9c\x06\xb19C,\xbe \x9f\'\'d-k\x92\xb9\xca\xa03Z\x81+(\xd3\xbcF\xc9\x00s%\x91\xb4(5\x96\x14\xb3\xc0\x9dr\xcb\xd0\x9a,\xa0\xacl\xf8\x05\xf1\x07\x11o\x1eD\xe3n\xa5\xd0\x00\xac\xdb\xbc\xed%"\x97\x8ap\xc2\x05QT\x14\xd0\x1d\xe0!^$\x82\xe0\x83\n\xc6\x85\xe9\x0e\xe2wQ<B\xd7\xe6\xfd\' \x9f\xa9\x82\xbc.O\xf0q=)Y\x1bh9Y\x80\x02K\xb9\x90\x86h\x9aC\xbf\xd7N[K\x8c\xd4\x1e\r\xf4:\xc0\xa1\xe1KP\xdb=\x06#U\xc5C\xc0\x1b\x14\x8f\x0b0\xd9#\xb3\x97%\xcaj\xa5@\x989\xe3\n2#\xd5\xfa6\x11\\0X\xcds^B\x98\xb7\n\x07\xca\x84L\xb0\xe2\x01\x8f\x11k\xf3\xd4\xcc\x9d\xe4"`Y\xc1\x13V@YH\xe5\x92\x07\x83e\x11\xcf\xd0M\xbbjG\xff\xef.v\x14>j\x92I\x86\x94)/N?,Q.\xe1c\xb8M\xe1\xd5o\x9e\x07\xdbK\xec<2\xc7\x97\xf0\xd2\xd4\x7f\x87\x9e\xc5\xe9\x96\xbe\xfdz\xefh\xbcO\xdb^p\xb27\xf0y\x01\xffk\x9b\xe7.t\x14\xac\x9d^\xef\xf8\x87\xe3\xf8\xf7\xed@a\xe7\x0f\xdc9\x01G\x00\x00(\xe3\xdf}\x13\x01@\xad\x00\x01\x8f\x06\xf7\x05\x00\x00\x85k\x89\xbe\xb1\xc4g\xfb\x02\x00\x00\x00\x00\x04YZ')))
# okay decompiling bytes1.pyc
```

Now those bytes aren't a `.pyc` file but a file that has been compressed two times (first with `zlib` and then with `lzma`). Here's a python script to decompress the data:

```python
data = b'\xfd7zXZ\x00\x00\x04\xe6\xd6\xb4F\x02\x00!\x01\x16\x00\x00\x00t/\xe5\xa3\x01\x02\xf6x\x9c\xedV[o\xd30\x14\xfe+^_\xd6\x02+Kz\xdf\x18\x9a\xe0\x01\x8d\x07@\x82\xa7)R\xe5\xc4\'\xa9\xb7\xd4\x8elgk#~<\xc7\x8e=\xba\xb6\x13\x9ax\xe9C#\xc5\xf9\xce\xfd\xf8\xf3q\xd5\xf9\\A\x91J\xad\xe7\xf8\x1c*\xbc\xea\x1cB\x17\xff\x84\x9d\xcbC\xe8\xe2\xc8\xe6\x91\xcd}l\xc2\n\xb2n))\xd3\xdd\xb4\x93\xac`\x90\xac\xce\xcf\xff\xf3\x1do\xca\xd7\x9b\x82\xc6\n\xd3M\x05\x0bKTZt\xbb\xab\x8b\xac.z\xd2\xc5V\x17/q\x19X\x83m7\xb26\xb0\xe0\x0e\x97!ksG\xb3\x90p\x04\xad\x86\xfa\xdeh\x14,\x13\x16\xf2L-\x1aZ\xc7\xd1\xbd\xf5R\xbf 1V7JV\xd3P\xc4\x17r\xfa\xf1\xae\xde\x01,"|\x074\xda\xb6\x9f\xdf\xb5\x19]\'\xe9\x8e&\xb3\x9a\x89]\xa6>:\x0eY\xf4o_w\xf2\xfa\xba\n\xc2\x06\xa7>8\xf6\x05a\x93\x8c\xdc\xba\xe5,1\x81;/\x8b \xe3w\xb2\xa1\xc7\x1d\xbch\xc9\xb6-X j\xa9S/\x10\n\xfb66\xb0\x96|\x7f\x84\xcd\x87K\xb2\x9a\xa5~8"\xb4\xceX;\x15{#\xe2\xd7\x92\xe7\xa6\xf0\xa7E=\x0c\xc7P\x98m\xcf\xfb\xb7^\xeb\xcc\xa8=I]\x02T\x8d\xa5zI\x1b\xe8W\xa2\xb0\xc2\xa0_\xad\x9b\xb3\x9bBH\xc5EA\xcc\x02H\xa5dZ\xc2\x92<Jqj\xc8\x92\xde\x03\xe1\x860\xaeiU\x01U\x97\xcdU&E\xae\xa406\x82\nF(c\n\xb4\xb6"zr\xed\xd2\x18Uc.j\x16\xc4H\x82fY\xd6\x86K\xd1o\xbe~\xbfG\x07jN5)\xa4d$\xad\r\xb9!E\x8d\x19\x9c\x9e\xd4D/d]2"\xe4#F\x9aZ\t\x82\xf5\x96\xbe;x\xe0\xb2\xd6.\xb5\xdf[\xacR\x8e0jyl7\xcf\xaf\xedxx\xfcc\x03\xb7\x9c\x06\xb19C,\xbe \x9f\'\'d-k\x92\xb9\xca\xa03Z\x81+(\xd3\xbcF\xc9\x00s%\x91\xb4(5\x96\x14\xb3\xc0\x9dr\xcb\xd0\x9a,\xa0\xacl\xf8\x05\xf1\x07\x11o\x1eD\xe3n\xa5\xd0\x00\xac\xdb\xbc\xed%"\x97\x8ap\xc2\x05QT\x14\xd0\x1d\xe0!^$\x82\xe0\x83\n\xc6\x85\xe9\x0e\xe2wQ<B\xd7\xe6\xfd\' \x9f\xa9\x82\xbc.O\xf0q=)Y\x1bh9Y\x80\x02K\xb9\x90\x86h\x9aC\xbf\xd7N[K\x8c\xd4\x1e\r\xf4:\xc0\xa1\xe1KP\xdb=\x06#U\xc5C\xc0\x1b\x14\x8f\x0b0\xd9#\xb3\x97%\xcaj\xa5@\x989\xe3\n2#\xd5\xfa6\x11\\0X\xcds^B\x98\xb7\n\x07\xca\x84L\xb0\xe2\x01\x8f\x11k\xf3\xd4\xcc\x9d\xe4"`Y\xc1\x13V@YH\xe5\x92\x07\x83e\x11\xcf\xd0M\xbbjG\xff\xef.v\x14>j\x92I\x86\x94)/N?,Q.\xe1c\xb8M\xe1\xd5o\x9e\x07\xdbK\xec<2\xc7\x97\xf0\xd2\xd4\x7f\x87\x9e\xc5\xe9\x96\xbe\xfdz\xefh\xbcO\xdb^p\xb27\xf0y\x01\xffk\x9b\xe7.t\x14\xac\x9d^\xef\xf8\x87\xe3\xf8\xf7\xed@a\xe7\x0f\xdc9\x01G\x00\x00(\xe3\xdf}\x13\x01@\xad\x00\x01\x8f\x06\xf7\x05\x00\x00\x85k\x89\xbe\xb1\xc4g\xfb\x02\x00\x00\x00\x00\x04YZ'

import zlib, lzma

file = zlib.decompress(lzma.decompress(data))
with open('decompressed_file', 'wb') as f:
    f.write(file)
```

```file:"decompressed_data"
__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__="__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__";__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__="__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__";__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__="__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__";exec(loads(b"\xe3\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x06\x00\x00\x00@\x00\x00\x00s\xe8\x00\x00\x00d\x00d\x01l\x00Z\x00d\x00d\x01l\x01Z\x01d\x00d\x02l\x02m\x03Z\x03\x01\x00e\x01j\x04d\x00\x19\x00Z\x05e\x00\xa0\x06\xa1\x00Z\x07d\x03Z\x08d\x04e\x05k\x06rTe\td\x05\x83\x01\x01\x00e\td\x06\x83\x01\x01\x00e\x01\xa0\nd\x00\xa1\x01\x01\x00e\x00j\x05\xa0\x0be\x00j\x05\xa0\x0ce\x07e\x08\xa1\x02\xa1\x01s|e\td\x07\x83\x01\x01\x00e\x01\xa0\nd\x00\xa1\x01\x01\x00e\re\x08d\x08\x83\x02\xa0\x0e\xa1\x00Z\x0fe\x0fd\t\x19\x00e\x0fd\n\x19\x00\x17\x00e\x0fd\x0b\x19\x00\x17\x00e\x0fd\x0c\x19\x00\x17\x00Z\x10e\td\r\x83\x01\x01\x00e\td\x0e\x83\x01\x01\x00e\x03d\x0f\x83\x01\x01\x00e\td\x10e\x10\x9b\x00d\x11\x9d\x03\x83\x01\x01\x00e\td\x12\x83\x01\x01\x00e\x01\xa0\nd\x00\xa1\x01\x01\x00d\x01S\x00)\x13\xe9\x00\x00\x00\x00N)\x01\xda\x05sleepz\x08maze.pngz\x03.pyz-Ignoring the problem won't make it disappear;z=confronting and addressing it is the true path to resolution.zJOk that's good but I guess that u should now return from the previous path\xda\x02rbi\xd1\x12\x00\x00i@\n\x00\x00iP\n\x00\x00i\xa0\n\x00\x00z-\n\nG00d!! you could escape the obfuscated pathz\x1btake this it may help you: \xe9\x02\x00\x00\x00z\x06\nseed(z+)\nfor i in range(300):\n    randint(32,125)\nz/Be Careful!!!! the route from here is not safe.)\x11\xda\x02os\xda\x03sys\xda\x04timer\x02\x00\x00\x00\xda\x04argv\xda\x04path\xda\x06getcwdZ\x11current_directoryZ\nindex_file\xda\x05print\xda\x04exit\xda\x06exists\xda\x04join\xda\x04open\xda\x04read\xda\x05index\xda\x04seed\xa9\x00r\x13\x00\x00\x00r\x13\x00\x00\x00\xda\x07coduter\xda\x08<module>\x01\x00\x00\x00s*\x00\x00\x00\x10\x01\x0c\x02\n\x01\x08\x01\x04\x02\x08\x01\x08\x01\x08\x01\n\x01\x16\x01\x08\x01\n\x01\x0e\x01 \x01\x08\x01\x08\x01\x08\x01\x04\x01\x02\xff\n\x05\x08\x01"));__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__="__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__";__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__="__regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss____regboss__"
```

Once again, you have to write that string into a `.pyc` file and get the source with `uncompyle6`.

```python file:"bytes2.py"
# uncompyle6 version 3.9.0
# Python bytecode version base 3.8.0 (3413)
# Decompiled from: Python 3.8.18 (default, Feb 13 2024, 11:06:24) 
# [GCC 12.2.0]
# Embedded file name: coduter
import os, sys
from time import sleep
path = sys.argv[0]
current_directory = os.getcwd()
index_file = 'maze.png'
if '.py' in path:
    print("Ignoring the problem won't make it disappear;")
    print('confronting and addressing it is the true path to resolution.')
    sys.exit(0)
if not os.path.exists(os.path.join(current_directory, index_file)):
    print("Ok that's good but I guess that u should now return from the previous path")
    sys.exit(0)
index = open(index_file, 'rb').read()
seed = index[4817] + index[2624] + index[2640] + index[2720]
print('\n\nG00d!! you could escape the obfuscated path')
print('take this it may help you: ')
sleep(2)
print(f"\nseed({seed})\nfor i in range(300):\n    randint(32,125)\n")
print('Be Careful!!!! the route from here is not safe.')
sys.exit(0)
# okay decompiling bytes2.pyc
```

Comment both `if` statements and execute the code (you will need to move `maze.png` to your working directory):
```out
G00d!! you could escape the obfuscated path
take this it may help you: 

seed(493)
for i in range(300):
    randint(32,125)

Be Careful!!!! the route from here is not safe.
```

If we go back to the `maze.py` code, the previous code snippet is what we will have to use in order to get the `key` that will allow us to decrypt the zip file.

```py file:"maze_final.py" hl:2,23,24
import pyzipper
from random import seed, randint
ZIPFILE = 'enc_maze.zip'
def decrypt(file_path, word):
    with pyzipper.AESZipFile(file_path, 'r', compression=(pyzipper.ZIP_LZMA), encryption=(pyzipper.WZ_AES)) as (extracted_zip):
        try:
            extracted_zip.extractall(pwd=word)
        except RuntimeError as ex:
            try:
                try:
                    print(ex)
                finally:
                    ex = None
                    del ex
            finally:
                ex = None
                del ex
decrypt(ZIPFILE, 'Y0u_Ar3_W4lkiNG_t0_Y0uR_D34TH'.encode())
with open('maze', 'rb') as (file):
    content = file.read()
data = bytearray(content)
data = [x for x in data]
seed(493)
key = [randint(32, 125) for _ in range(300)]
for i in range(0, len(data), 10):
    data[i] = (data[i] + 80) % 256
else:
    for i in range(0, len(data), 10):
        data[i] = (data[i] ^ key[i % len(key)]) % 256
    else:
        with open('dec_maze', 'wb') as (f):
            for b in data:
                f.write(bytes([b]))
```

Now from `enc_maze.zip` we have two files, `maze` and `dec_maze`. This last one is an ELF executable, which seems that it's function is reading the user input and checking if it is the flag or not.

```shell
root@340716e14cd3:~/ctf# ./dec_maze 
something
You're going deeper into the maze...
root@340716e14cd3:~/ctf# ./dec_maze 
HTB
Well done for escaping the maze...
```

So the final flag is there, we just have to inspect one last binary.

![[assets/maze/maze_data_flag.png | dec_maze disassembled with radare2 |600]]

```c
while (pcVar4 = pcVar5 + 1, pcVar4 != puVar7 + iVar3 + -1) {
		bVar2 = bVar2 & *pcVar5 + *pcVar4 + pcVar5[2] == *piVar6;
		piVar6 = piVar6 + 1;
		pcVar5 = pcVar4;
}
```

This part of the code is comparing the user input with some data stored at the address `0x2060`, which might be our flag. 
The program is adding three values for each iteration. Three values of the input string (stored as bytes) are being added and the result is compared with eight bytes from the DATA, and then moves one value forward and repeats the process until the end of the stored data.
We know that the tree first values of the flags always are `HTB` because we know that the flag would be something like `HTB{random_string}`, and also we can find this first three letters on the program.

$$
DATA[0] = flag[0] + flag[1] + flag[2]
$$

> [!warning] Initially I wrote this script that is kinda a bruteforce, because I am still not very familiarized with reversing and the tools, and I've get some help. One of the hints was that I had to use the `pwn.p32()` function, so my first idea was just try the calculation with each char and compare if the result equals to DATA. Even this is the worst way to do this I think it is good to leave it here for in a future see how I've been improving my skills.

```py file:"finalFlag_bruteforce.py"
#!/usr/bin/env python3

from pwn import p32, sleep
 
flag = "HTB"
chars = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
 
hidden = 'de000000110100003401000022010000fe000000e60000000f010000e8000000fe0000000401000017010000d2000000e800000011010000450100002f01000008010000d9000000dd000000cc00000007010000d700000002010000e60000001b010000ed0000000c010000030100001f010000e0000000db000000c1000000c00000008700000075000000bf000000011b033b2c0000000400000030efffff1400000000000000017a5200017810011b0c070890010710140000001c0000001400000000000000017a520001781001b0eeffff50000000000e10460e184a0f0b770880003f1a3b2a332422000000001400000044000000d8eeffff080000000000000000000000280000005c000000b9efffff0501000000410e108602410e188303440e6002ee0a0e18410e10410e08410b0000000000'
 
def split_string(string, split_string):
    return [string[i:i+split_string] for i in range(0, len(string), split_string)]
hidden_flag = split_string(hidden,8)
 
# print(len(hidden_flag)); exit()
 
print(flag, end='')
for l in range(1,len(hidden_flag)-1):
    for c in chars:
        data = p32(ord(flag[l]) + ord(flag[l+1]) + ord(c)).hex()
        if data==hidden_flag[l]:
            flag += c
            print(f'{c}', end="")
            sleep(0.05)
```

The easiest way is just make a subtraction and isolate the value of the next character:

```py file:"finalFlag.py"
#!/usr/bin/env python3
 
from pwn import p32, sleep
import struct
 
flag = "HTB"
hidden = 'de000000110100003401000022010000fe000000e60000000f010000e8000000fe0000000401000017010000d2000000e800000011010000450100002f01000008010000d9000000dd000000cc00000007010000d700000002010000e60000001b010000ed0000000c010000030100001f010000e0000000db000000c1000000c00000008700000075000000bf000000011b033b'
 
def split_string(string, split_string):
    return [string[i:i+split_string] for i in range(0, len(string), split_string)]
hidden_flag = split_string(hidden,8)
 
print(flag, end="")
for l in range(1,len(hidden_flag)-1):
    #hidden_flag[l] = p32(ord(flag[l]) + ord(flag[l+1]) + ord(c)).hex()
    data = int(hidden_flag[l],16)
    data = struct.pack('<I', data) #little_endian
    values = p32(ord(flag[l]) + ord(flag[l+1]))
    resta_decoded = (int.from_bytes(data, byteorder='big') - int.from_bytes(values, byteorder='little')).to_bytes(4, byteorder='little').decode('ascii').replace('\x00', '')
    print(resta_decoded, end="")
    sleep(0.05)
    flag += resta_decoded
print("")
```


![[assets/maze/maze.png | Y0u_C0uld_E5c4p3 | 300]]