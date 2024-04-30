---
title: Raspberry Pi
date: 2023-08-20
tags:
  - raspberry-pi
  - linux
draft: false
---
# Raspberry Pi
![[assets/Raspberry Pi/RaspberryPi-img1.png| Raspberry Pi 4 | 350]]

Raspberry Pi is awesome. I've been studying without a computer, only with an iPad and a Raspberry Pi and with this setup I have been able to do almost everything. I will share here some of the most useful things that I've learned so far.

> [!info] I haven't squeezed all its potential at the hardware level, so I will mainly explain how did I use the Raspberry Pi as a remote server.

## Installing an OS
Raspberry Pi is a series of small single-board computers (SBCs) with an integrated ARM-compatible central processing unit (CPU)[^rpi-wikipedia]. This is a great feature because this architecture has low power consumption compared to a normal computer or a miniPC, however it can make a difference for running some specific software that is only available for x86_64 architectures.

When you buy a Raspberry Pi (by itself, without any pack) you only get a motherboard. It is true that it is a very powerful device that you can get under 100$, however you may need to buy additional components such as a case or a fan.
The most important thing you need in addition with the rpi is some kind of ROM. The device has an slot for an microSD card, but I really recommend to boot it from an SSD if you want to use it as a server (which you can attach via USB3.0).
There are many tutorials on how to install an Operating System (OS), but the easiest one is using [Raspberry Pi Imager](https://www.raspberrypi.com/software/) (which allows you to flash the microSD card or USB/SSD setting basic stuff for remote control such as enabling SSH, connecting to WiFi, etc.). Also you can download a compatible image[^rpi-images] and use the `dd` command:
```bash
dd if=/path/to/yourImage.iso of=/dev/sdx
```

## Remote Access
I have been accessing the raspi through an iPad and also with my phone. One of the first things I did was configuring the "Pi4 USB-C Gadget" as it's explained at [*Ben's Place*](https://www.hardill.me.uk/wordpress/2019/11/02/pi4-usb-c-gadget/). This was great, but the main problem that it has is that you have to carry it with you anywhere, and also you can't let it powered for hours as a server. 
The most convenient would be to access it through SSH, but I don't want to open the ports of my home router to the internet for security reasons, so configuring a VPN is a good alternative for this. 

### ZeroTier
ZeroTier is the best solution (secure and free) that I know for accessing to your devices from anywhere out of your network. It's a private virtual network (VPN) that connects all your devices. Here's a quick installation guide:

```bash file:"zerotier setup"
# make sure to pick the latest version
curl -o zerotier.deb http://download.zerotier.com/debian/buster/pool/main/z/zerotier-one/zerotier-one_1.12.1_arm64.deb
sudo dpkg -i ./zerotier.deb
```

Then you have to create an account at [[https://my.zerotier.com/]], create a network and copy the network ID.

```bash file:"zerotier setup"
sudo zerotier-cli join $network_ID
# daemon setup
sudo zerotier-one -d
# activate / deactivate
sudo systemctl start/stop zerotier-one.service
```
Finally you just have to authorize the new device on your network from the website.

> [!tip] You can really use any SSH client, but if you have an IOS device I really recommend you to try [ShellFish](https://secureshellfish.app/), I've tried many apps and definitely I love this one.


## ARM vs AMD
One of the most annoying things about trying to use the raspberry pi as a computer is in fact that it is not a computer. The CPU of this device is build on an ARM architecture, which means that it will not be able to run binaries that have been compiled for a normal computer, well in principle it couldn't.

> [!todo]TODO: post explaining some tips about virtualization with qemu and docker/podman.

Basically, the raspberry pi being used without graphic interface is enough powerful fol letting you run docker containers, and here's how you can emulate an x86_64 architecture inside a container:

```bash file:"AMD virtualization with Docker"
docker run --privileged tonistiigi/binfmt:latest -install amd64 && \
docker run --platform=linux/amd64 --name=debian-amd -it debian
```

## Other projects
I really recommend a Raspberry Pi to everyone. It is not only a great low-cost device, but a versatile tool that gives you the opportunity to learn and be creative.
It has a great community and you can check many websites with a huge variety of projects to try such as [Raspberry Pi Projects from PiMyLifeUp](https://pimylifeup.com/category/projects/).

## References
[^rpi-wikipedia]: Raspberry_Pi – Series and generations (Wikipedia): https://en.wikipedia.org/wiki/Raspberry_Pi#Series_and_generations
[^rpi-images]: Raspberry Pi Images with download links: https://raspberrytips.com/raspberry-pi-images-list/
