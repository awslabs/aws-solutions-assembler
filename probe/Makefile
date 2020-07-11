
#

all: manager

test: fmt vet tidy
	go test ./... -v -cover

# Build manager binary
manager: fmt vet tidy
	go build -a -installsuffix cgo -o probe

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
