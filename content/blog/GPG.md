---
title: GPG
tags:
  - linux
draft: true
---
# GPG

## What is GPG?

GPG (GNU Privacy Guard) is a free and open-source implementation of the OpenPGP standard. It's used for encryption and digital signatures, providing a way to securely exchange messages and data over the internet[^1][^4].

## GPG Cheatsheet

- **Create a key**: `gpg --gen-key` (generally, you can select the defaults)
- **Export a public key to a file**: `gpg --export -a "User Name" > public.key`
- **Export a private key**: `gpg --export-secret-key -a "User Name" > private.key`
- **Import a public key**: `gpg --import public.key`
- **Import a private key**: `gpg --allow-secret-key-import --import private.key`
- **List the keys in your public/private key ring**: `gpg --list[-secret]-keys`
- **Delete a public/private key**: `gpg --delete[-secret]-key "User Name"`
- **Encrypt data**: `gpg -e -u "Sender User Name" -r "Receiver User Name" somefile`
- **Decrypt data**: `gpg -d mydata.tar.gpg`

For more details, you can refer to the full cheatsheet[^1].

Additionally, GPG can be used with Mutt, a popular text-based email client, to provide email encryption and decryption. There are two ways to integrate GPG with Mutt: using the classic way of connecting Mutt to GnuPG or using the gpgme library[3].

When using GPG for managing passwords, it's important to keep your keys safe and secure. You can export your public key and save it in a Yubikey or an encrypted USB drive. For managing GPG keys, there are various applications available for different platforms, such as OpenKeychain on Android, Kleopatra on Linux, GPG Suite on macOS, and Pass for iOS/iPadOS[4].

In summary, GPG is a powerful tool for encryption and digital signatures, and it can be used with various applications and tools for secure data exchange and password management.


REFERENCES:
 [^1]: [GPG Cheat Sheet](https://irtfweb.ifa.hawaii.edu/~lockhart/gpg/)
[^2]: [[PDF] Pentest command Tools (GPEN Based) Cheat Sheet by HeyMensh](https://cheatography.com/heymensh/cheat-sheets/pentest-command-tools-gpen-based/pdf/)
[^3]: [mutt: Use gpgme or classic gpg? - Unix & Linux Stack Exchange](https://unix.stackexchange.com/questions/84554/mutt-use-gpgme-or-classic-gpg)
[^4]: [I'd love to start using pass but I find managing gpg keys troubling ...](https://news.ycombinator.com/item?id=20909439)
[^5]: [Linux Commands Cheat Sheet {with Free Downloadable PDF}](https://phoenixnap.com/kb/linux-commands-cheat-sheet)
[^6]: [GPG CheatSheet](https://tomspirit.me/blog/posts/gpg-cheatsheet)



