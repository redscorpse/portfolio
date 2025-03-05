---
title: TPM
tags:
  - linux
draft: true
---
# TPM

## What is TPM?
A Trusted Platform Module (TPM) chip is a secure crypto-processor that is designed to carry out cryptographic operations[^1].

## How can you use TMP?
A TPM has many use cases, this post goes over a few of them[^2].
You need to check if it's activated on the BIOS. On Lenovo you find it at `Security > Security Chip`
### 1) Disk encryption
### 2) Authentication to SSH servers
### 3) Act as FIDO U2H security key
### 4) Store your GPG keys
A TPM can handle GPG keys, to do email encryption for example. For this, you need one of those:

-   use a recent version of GPG, >= 2.3, see [Using a TPM with GnuPG 2.3](https://gnupg.org/blog/20210315-using-tpm-with-gnupg-2.3.html)
-   use GPG via PKCS11, using [gnupg-pkcs11-scd](https://github.com/alonbl/gnupg-pkcs11-scd) and [tpm2-pkcs11](https://github.com/tpm2-software/tpm2-pkcs11).

Super short tutorial (YMMV) with GPG on :

```
tpm2daemon --daemon
gpg --quick-generate-key "<you@example.net>" rsa2048
gpg --edit-key you@example.net
> keytotpm
echo foo | gpg -s
```

### 5) Secure boot
### 6) Remote Attestation
### 7) Act as random number generator


[^1]: https://learn.microsoft.com/en-us/windows/security/hardware-security/tpm/trusted-platform-module-overview
[^2]: [7 cool things to do with your TPM on Linux by Martin Monperrus](https://www.monperrus.net/martin/7-things-to-do-with-your-TPM-on-Linux)