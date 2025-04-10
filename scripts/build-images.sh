#!/bin/bash

# Create docker directory if it doesn't exist
mkdir -p docker/{python,node,java,cpp,c,ruby,rust,php,bash,perl}

# Create Dockerfiles for each language
cat > docker/python/Dockerfile << 'EOF'
FROM python:3.10-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/node/Dockerfile << 'EOF'
FROM node:20-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/java/Dockerfile << 'EOF'
FROM openjdk:20-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/cpp/Dockerfile << 'EOF'
FROM gcc:latest
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/c/Dockerfile << 'EOF'
FROM gcc:latest
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/ruby/Dockerfile << 'EOF'
FROM ruby:3-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/rust/Dockerfile << 'EOF'
FROM rust:1.70-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/php/Dockerfile << 'EOF'
FROM php:8.2-cli
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/bash/Dockerfile << 'EOF'
FROM bash:5.2
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

cat > docker/perl/Dockerfile << 'EOF'
FROM perl:5.36-slim
WORKDIR /code
RUN mkdir -p /code && chmod 777 /code
USER nobody
EOF

# Build all images
for lang in python node java cpp c ruby rust php bash perl; do
    echo "Building $lang image..."
    docker build -t "scriptorium-$lang" "./docker/$lang"
    
    # Check if build was successful
    if ! docker image inspect "scriptorium-$lang" >/dev/null 2>&1; then
        echo "Failed to build $lang image"
        exit 1
    fi
    echo "$lang image built successfully"
done

echo "All images built successfully"