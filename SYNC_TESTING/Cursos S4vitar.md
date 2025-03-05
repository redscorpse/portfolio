# Cursos S4vitar

## Introducción al Hacking

```bash
❯ ls -l
total 0
drwxr-xr-x    2 reds     reds            64 May 27 14:52 mydir
-rw-r--r--    1 reds     reds             0 May 27 14:53 myfile.txt
```

```
- rwx rwx rwx    user  group
| |   |   ↳ (others)
| |   ↳ rwx (group)
| ↳ read,write,execute (user)
↳ file type (-=regular file, d=directory)
```

```bash

```

```bash
chattr +i -V notes.txt
lsattr notes.txt
# Ni siquiera root puede borrar la nota
```
