---
layout: default
title: "BrowserTerminal.js - Documentations"
---

# Documentation

Incoming, need some spare time to write it.

## Placeholder

There are two bundle builded on the main Shell Class, _use only one_.

`browser-shell.js`: Main class, init and build the shell with default value or custom value passed

`browser-terminal.js`: Simple Wrapper around the Shell Class, to build a DOM emulation of the shell. You can write your own and call directly the main shell class

__NB__ Don't load both, the wrapper is build around the first one and include it.
