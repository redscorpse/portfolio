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

Raspberry Pi is awesome. I've been without having a computer for a while and with this I have been able to do almost everything, so I will share here some of the best tricks that you can be doing with that tiny computer if you aren't doing them already.

> [!info] I haven't squeezed all its potential at the hardware level, here I will explain how did I use the Raspberry Pi as a remote computer.

## Remote Access
I have been accessing the raspi through an iPad and also with my phone. One of the first things I did was configuring the "Pi4 USB-C Gadget" as it's explained [here](https://www.hardill.me.uk/wordpress/2019/11/02/pi4-usb-c-gadget/). This was great, but the main problem that it has is that you have to carry it with you anywhere, and also you can't let it powered for hours, which considering the low power consumption of this device it's one of it's great advantages. The most convenient thing should be accessing it through SSH, but unless you don't open your router ports, there will be no way of accessing it from the outside.

### ZeroTier
ZeroTier is the best solution (secure and free) that I know for accessing to your devices from anywhere. It's a private virtual network (VPN) that connects all your devices. Here's a quick installation guide:

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
