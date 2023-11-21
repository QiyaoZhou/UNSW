#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
for i,line in enumerate(sys.stdin):
    line = line.strip()
    print("number:",i + 1,"\tcontent:",line)
