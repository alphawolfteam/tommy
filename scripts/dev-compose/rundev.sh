#!/bin/bash
docker-compose up --build -d
docker logs client-builder -f