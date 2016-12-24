# dh-node
Diffie-Hellman protocol in node. WIP

Run using `node interface.js`.

To communicate with a machine on your LAN, both machines must be running `interface.js` at the same time. Also, `DH_PORT` must be the same (default 62720) on each machine.

You must then input `init 127.0.0.1`, replacing `127.0.0.1` with the other machine's IP. You may then send data using `send SOME_TEXT` (no spaces allowed yet).

To communicate with a machine not on your LAN, both machines must have port forwarding enabled on `DH_PORT`. Once that is done, you may use the interface just as if the machine was on your LAN, using their public IP.
