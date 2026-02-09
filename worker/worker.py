#!/usr/bin/env python3
"""Minimal worker - hello world placeholder."""

import time

from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    print("Hello, World! Worker started.")
    while True:
        time.sleep(60)
        print("Worker heartbeat.")
