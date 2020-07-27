---
title: 环境安装
date: 2020-07-27T13:46:14+08:00
weight: 10
---

## 预装软件

- 安装 [Docker Desktop](https://docs.docker.com/desktop/#download-and-install)
- 安装 [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install)
- 配置 [AWS Configuration and Credential](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) setting

## 配置aws cli凭证

确保aws cli工具配置正确，你可以通过以下命令检查

```shell
    $ aws configure list
        Name                    Value             Type    Location
        ----                    -----             ----    --------
    profile                <not set>             None    None
    access_key     ****************XAWA shared-credentials-file
    secret_key     ****************qEK5 shared-credentials-file
        region                us-east-2      config-file    ~/.aws/config
```

## 执行AWS CDK引导程序

通过命令`cdk bootstrap aws://<your aws account>/<aws region>`初始化您的CDK组件，例如：

```shell
    cdk bootstrap aws://638198787577/us-east-2
```

{{% notice note %}}该步骤只需要执行一次，以后无需再执行
{{% /notice %}}

## 运行麻将docker

现在我们以下两步将麻将运行在您的本地环境

1. 为你的微服务组件创建一个工作目录

```shell
    $ mkdir -p $HOME/ws/local-tiles-repo
```
2. 启动Dev模式的Dice后台进程并将本地的工作目录挂载至麻将Docker容器内

```shell
    $ docker run -it -d -v $HOME/ws/local-tiles-repo:/workspace/tiles-repo \
    -v ~/.aws:/root/.aws \
    -e M_MODE=dev \
    -p 9090:9090 \
    docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest
```

现在您可以打开 [http://127.0.0.1:9090/toy](http://127.0.0.1:9090/toy) 开始使用麻将

同时，麻将提供了命令行工具。从入门环节开始，我们推荐您使用麻将的命令行工具使用麻将，请在这里下载安装 [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)
