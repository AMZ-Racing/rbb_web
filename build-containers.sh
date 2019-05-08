#!/bin/sh

yarn build-staging
docker build . -t amzracing/rbb-web:latest
