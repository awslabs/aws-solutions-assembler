

# <img src="docs/gopher.png" alt="Builders" width="80"/> AWS Solutions Assembler 

[English](README.md) | [中文](README_zh.md)

## 描述


AWS Solutions Assembler 的内部名称也叫 [麻将](./docs/All-Concept.md), 它内置的从用模型和抽象组件能够帮助快速的构建解决方案， 这些方案可以根据业务需要任意伸缩和调整。

解决方案的建设者可以利用 [麻将](./docs/All-Concept.md) 来分享符合业界标准和AWS最佳实践的方案。 客户可以快速使用和体验这些解决方，同时也可以利用抽象组件来构建符合业务求的个性化方案。


## 依赖环境

- 安装 [Docker](https://docs.docker.com/desktop/#download-and-install)
- 安装 [CDK](https://github.com/aws/aws-cdk)
- [配置AWS CLI 和 访问权限](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- 下载 [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)

## 快速安装

```bash

# 1. Run dice as coantainer
docker run -d -v ~/.aws:/root/.aws -p 9090:9090 docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest

# 2. Kick start browser for first trial (On Darwin)
open http://127.0.0.1:9090/toy

# 3. Paste the solution and send to provision, for example: https://github.com/mahjong-contributions/mahjong-constuct/blob/master/hu/eks-simple/0.1.0/eks-simple.yaml

```

## 用户指南

[English](https://awslabs.github.io/aws-solutions-assembler/en/getting-started/) | [中文](https://wchaws.github.io/aws-solutions-assembler/zh/getting-started/)

## 胡

- 基于容器的微服务解决方案
> Modernized microservices on EKS with built-in automated release pipeline, service mesh, log, metrics, tracing, secret management, and more, which's a one-stop solution for containerized microservices.


## 自定义开发

If you want to share your expertise or build your favorite things from scratch, following guide would be helpful.

- [How to build the Tile](./docs/How-to-Build-Tile.md)
- [How to build the Hu](./docs/How-to-Build-Hu.md) 
- [All available Hu and Tile](./repo/README.md)

## 即将发布

- [X] Data pipeline on EKS
- [X] Serverless on EKS
- [X] AI on EKS


## 引用
- [Mahjong contributions](https://github.com/mahjong-contributions)

## 安全

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.


