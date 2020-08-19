---
title: Installation
date: 2020-07-27T13:46:14+08:00
weight: 10
---

## Prerequisites

- Install [Docker Desktop](https://docs.docker.com/desktop/#download-and-install)
- Install [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install)
- [AWS Configuration and Credential](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) Setup

## Config aws cli credential

Make sure aws cli is well configured by running the following command to check

```shell
    $ aws configure list
        Name                    Value             Type    Location
        ----                    -----             ----    --------
    profile                <not set>             None    None
    access_key     ****************XAWA shared-credentials-file
    secret_key     ****************qEK5 shared-credentials-file
        region                us-east-2      config-file    ~/.aws/config
```

## Excute aws cdk bootstrap for your first time
Run `cdk bootstrap aws://<your aws account>/<aws region>` to bootstrap cdk：

```shell
    cdk bootstrap aws://638198787577/us-east-2
```

{{% notice note %}}This step only needs to be run once
{{% /notice %}}

## Run a docker image
To setup your local environment you need

1. Setup a workspace

```shell
    $ mkdir -p $HOME/ws/local-tiles-repo
```
2. Run Dice daemon under Dev mode, and mount your local workspace into a docker container

```shell
    $ docker run -it -d -v $HOME/ws/local-tiles-repo:/workspace/tiles-repo \
    -v ~/.aws:/root/.aws \
    -e M_MODE=dev \
    -p 9090:9090 \
    docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest
```

Open [http://127.0.0.1:9090/toy](http://127.0.0.1:9090/toy) to get started

We strongly suggest you to install a cli tool to interact with Dice daemon.
Install [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)
