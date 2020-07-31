
# Image URL to use all building/pushing
DOCKER_IMAGE ?= dice
DOCKER_IMAGE_TAG ?= ${GIT_TAG}
VERSION ?= ${GIT_TAG}
GIT_COMMIT_ID ?= ${GIT_COMMIT}
BUILT ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
M_S3_BUCKET_REGION ?= ${M_S3_BUCKET_REGION}
M_S3_BUCKET ?= ${M_S3_BUCKET}
GOX ?= $(shell go env GOPATH)/bin/gox
#

# Docker Hub username / password
DOCKER_PASS =
DOCKER_USER =
#

all: manager

test: fmt vet tidy
	echo DOCKER_IMAGE=${DOCKER_IMAGE}
	echo DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG}
	echo VERSION=${VERSION}
	echo GIT_COMMIT_ID=${GIT_COMMIT_ID}
	echo BUILT=${BUILT}

	M_WORK_HOME=./ M_MODE=dev M_LOCAL_TILE_REPO=./repo go test ./... -v -cover

# Build manager binary
manager: fmt vet tidy
	@GO111MODULE=off go get github.com/mitchellh/gox
	${GOX} -osarch=linux/amd64 \
		  -osarch=darwin/amd64 \
		  -osarch=windows/amd64 \
		  -output=dist/mctl_{{.OS}}_{{.Arch}} \
		  -ldflags="-X 'dice/utils.ServerVersion=${VERSION}' -X 'dice/utils.GitCommit=${GIT_COMMIT_ID}' -X 'dice/utils.Built=${BUILT}'"
	cd dist/ && gzip *

run: fmt vet
	go run ./main.go

# Run go fmt against code
fmt:
	go fmt ./...

# Run go vet against code
vet:
	go vet ./...

tidy:
	go mod tidy

lint-local:
	golangci-lint --version
	GOMAXPROCS=2 golangci-lint run --fix --verbose --timeout 300s

pre-commit: lint-local test

# Build the docker image
docker-build:
	cp -r ../probe .
	cp -r ../ui .
	docker build \
		--build-arg VERSION=${VERSION} \
		--build-arg GIT_COMMIT_ID=${GIT_COMMIT_ID} \
		--build-arg BUILT=${BUILT} \
		--build-arg M_S3_BUCKET_REGION=${M_S3_BUCKET_REGION} \
		--build-arg M_S3_BUCKET=${M_S3_BUCKET} \
		-t ${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG} .
	rm -rf probe



# Push the docker image
docker-push:
	#echo $DOCKER_PASS | docker login --username $DOCKER_USER --password-stdin
	docker push ${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG}
	echo "Tag image with latest label"
	docker tag ${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE}:latest
	docker push ${DOCKER_IMAGE}:latest

# Push the docker image
docker-push-github:
	#echo $DOCKER_PASS | docker login --username $DOCKER_USER --password-stdin
	docker tag ${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG} docker.pkg.github.com/awslabs/aws-solutions-assembler/${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG}
	docker push docker.pkg.github.com/awslabs/aws-solutions-assembler/${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG}
	echo "Push image with latest label"
	docker tag ${DOCKER_IMAGE}:${DOCKER_IMAGE_TAG} docker.pkg.github.com/awslabs/aws-solutions-assembler/${DOCKER_IMAGE}:latest
	docker push docker.pkg.github.com/awslabs/aws-solutions-assembler/${DOCKER_IMAGE}:latest

