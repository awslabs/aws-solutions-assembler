

# <img src="docs/gopher.png" alt="Builders" width="80"/> AWS Solutions Assembler 

[English](README.md) | [中文](README_zh.md)

## Description


AWS Solutions Assembler is also known as [Mahjong](./docs/All-Concept.md), which has built-in mechanism to leverage pattern based abstracts to build up any solution. 

Builders can use [Mahjong](./docs/All-Concept.md) to share solutions with the best industry practice. Customers can quickly experience those solutions or build their own.


## Prerequisite

- Install [Docker](https://docs.docker.com/desktop/#download-and-install)
- Install [CDK](https://github.com/aws/aws-cdk)
- [Setup AWS configuration and credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- Download [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)

## Quick Start

```bash

# 1. Run dice as coantainer
docker run -d -v ~/.aws:/root/.aws -p 9090:9090 docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest

# 2. Kick start browser for first trial (On Darwin)
open http://127.0.0.1:9090/

```

## User Guide

To learn more about AWS Solutions Assembler [go to the complete documentation](https://awslabs.github.io/aws-solutions-assembler/en/getting-started/).


## Hu

- Containerized microservices on EKS
> Modernized microservices on EKS with built-in automated release pipeline, service mesh, log, metrics, tracing, secret management, and more, which's a one-stop solution for containerized microservices.


## Develope your own

If you want to share your expertise or build your favorite things from scratch, following guides would be helpful.

- [How to build the Tile](./docs/How-to-Build-Tile.md)
- [How to build the Hu](./docs/How-to-Build-Hu.md) 
- [All available Hu and Tile](./repo/README.md)
- [Publish Hu or Tile](./repo/README.md)  

## What's coming

- [X] Data pipeline on EKS
- [X] Serverless on EKS
- [X] AI on EKS


## Referenes
- [Mahjong contributions](https://github.com/mahjong-contributions)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.


