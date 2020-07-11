
#
GIT_COMMIT_ID ?= ${GIT_COMMIT}
VERSION ?= ${GIT_TAG}
BUILT ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
GOX ?= $(shell go env GOPATH)/bin/gox
#

all: package

test: fmt vet tidy
	go test ./... -v -cover

# Build manager binary
manager: fmt vet tidy
	echo "Buiding binary files ..."
	@GO111MODULE=off go get github.com/mitchellh/gox
	${GOX} -osarch=linux/amd64 \
		  -osarch=darwin/amd64 \
		  -osarch=windows/amd64 \
		  -output=dist/mctl_{{.OS}}_{{.Arch}} \
		  -ldflags="-X 'mctl/cmd/version.ClientVersion=${VERSION}' -X 'mctl/cmd/version.GitCommit=${GIT_COMMIT_ID}' -X 'mctl/cmd/version.Built=${BUILT}'"

package: manager
	echo "Packaging binary files ..."
	
	@cd dist && for t in $(shell ls dist); do \
		echo $$t; \
		echo tar -czf $$t.tar.gz $$t; \
		tar -czf $$t.tar.gz $$t; \
		rm $$t; \
	done

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
