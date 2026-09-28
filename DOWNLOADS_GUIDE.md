# MODWAI downloads

Downloads point directly to stable asset names in the public GitHub release:

| Platform | Asset | Description |
| --- | --- | --- |
| macOS | `MODWAI-Installer.dmg` | Desktop installer; do not claim a universal binary without checking it |
| Windows | `MODWAI-Setup.exe` | 64-bit installer |
| Linux | `MODWAI-Linux.tar.gz` | x86-64 application archive |

Base URL: `https://github.com/xname3/modwai_downloads/releases/latest/download/`.

Verified on 2026-09-28 against release `v2026.09.28-1611`. The Linux archive was
inspected: `MODWAI/MODWAI` is an executable ELF64 x86-64 file. The release does not
contain DEB or RPM packages. Do not restore the old commented-out package links.
No universal Linux distribution compatibility is claimed.

## Linux

```sh
tar -xzf MODWAI-Linux.tar.gz
./MODWAI/MODWAI
```

Keep the extracted directory structure. A graphical desktop and compatible
system libraries are required. The release body at the time of review said
`./MODWAI`, but the archive contains a directory at that path. The website uses
the verified executable path above. Runtime operation on Linux was not tested
on the macOS development machine.

## Platform suggestion

`app.js` adds `.is-recommended` to one `.download-card` using `data-os="mac"`,
`data-os="windows"` or `data-os="linux"`. The hint identifies only the desktop OS,
not architecture or compatibility. Mobile browsers, including iPads using a Mac
user agent, receive no suggestion. Downloads are always visible for all platforms.
No automatic download, scrolling, or Linux distribution guess is performed.

## Updating a release

Keep the three asset names stable or update the links in `index.html`. Check the
actual release assets, not just README instructions. If architecture or minimum
OS requirements change, verify the binaries and update the download cards.
