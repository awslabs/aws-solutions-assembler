

#
CURRENT_DIR=$(shell pwd)
HOST_OS:=$(shell go env GOOS)
HOST_ARCH:=$(shell go env GOARCH)
CLI_NAME=mctl
CLI_DIST_DIR=${CURRENT_DIR}/mctl/dist

DOCKER_IMAGE_TAG=local
VERSION=local
GIT_COMMIT_ID=$(shell git rev-parse HEAD)
GIT_TAG=$(shell if [ -z "`git status --porcelain`" ]; then git describe --exact-match --tags HEAD 2>/dev/null; fi)
M_S3_BUCKET_REGION ?= ${S3_BUCKET_REGION}
M_S3_BUCKET ?= ${S3_BUCKET}
BUILD_DATE=$(shell date -u +'%Y-%m-%dT%H:%M:%SZ')

GOPATH?=$(shell if test -x `which go`; then go env GOPATH; else echo "$(HOME)/go"; fi)

all:

cli:
	@cd mctl && make all
test:
	@cd dice && make test
	@cd probe && make test
	@cd mctl && make test

docker-build:
	@cd dice && make docker-build

pre-commit:
	@cd dice && make pre-commit
	@cd probe && make pre-commit
	@cd mctl && make pre-commit
