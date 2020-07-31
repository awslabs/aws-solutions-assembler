---
title: 简单用例
date: 2020-07-27T13:58:26+08:00
weight: 20
---

如您所知，麻将作为蓬勃发展中的生态项目已经拥有了诸多优先的贡献者，他们已经构建了广泛的优良架构微服务模块，在麻将中我们称之为“牌”。

在这里，我们将理解麻将中的牌的定义，使用已有的牌为您交付一套基于优良架构，由您自主定义的AWS EKS环境。

您只需要定义集群的名称，节点数量和实例类型，K8S版本。麻将将为您快速构建一套已有最小权限原则，跨AZ高可用，数据高可靠等最佳实践元素的环境，当然您也可以不做输入，它将在默认的情况下为您完成最佳实践交付。

## 定义 & 构建服务组件

### 了解如何使用麻将

麻将中的一切编排组件均通过yaml进行编排和定义，这些组件包括

#### 牌

代表一个云组件或多个云组件或资源的组合。 Tile按网络，容器提供者，存储，数据库，应用程序，容器应用程序，分析，ML进行分类。 Application和ContainerApplication通过命令和文件表示，其余类别通过Construct :: CDK表示

#### 部署

部署单元，以及在 牌 范围内定义的所有资源。

#### 胡

高级别的部署单元集合，代表了完整的解决方案，并且包括多个具有特定定义的牌。

![high-level-arch]({{< param "rootUrl" >}}/high-level-arch.png)

### 定义您的服务组件

现在，我们通过编写一个部署yaml调用已有的牌部署一个eks服务组件。

创建一个YAML配置文件并将其命名为`simple-eks.yaml`
```yaml
    apiVersion: mahjong.io/v1alpha1
    kind: Deployment
    metadata:
    name: simple-eks
    version: 0.1.0
    spec:
    template:
        tiles:
        tileEks0005:
            tileReference: Eks0
            tileVersion: 0.0.5
            inputs:
            - name: clusterName
                inputValue: mahjong-cluster101
            - name: capacity
                inputValue: 3
            - name: capacityInstance
                inputValue: m5.large
            - name: version
                inputValue: 1.16
    summary:
        description:
        outputs:
        - name: EKS Cluster Name
            value: $(tileEks0005.outputs.clusterName)
        - name: Master role arn for EKS Cluster
            value: $(tileEks0005.outputs.masterRoleARN)
        - name: The API endpoint EKS Cluster
            value: $(tileEks0005.outputs.clusterEndpoint)
        - name: Instance type of worker node
            value: $(tileEks0005.outputs.capacityInstance)
        - name: Default capacity of worker node
            value: $(tileEks0005.outputs.capacity)

        notes: []
```

### 部署到AWS

使用`mctl deploy -f ./simple-eks.yaml`命令将您定义的服务组件部署到aws。
```shell
    $ mctl deploy -f ./simple-eks.yaml
```

如果您正确完成了缓解的安装，你将会的得到以下结果:

```shell

    [ℹ]  EKS Cluster Name = mahjong-cluster101
    [ℹ]  Master role arn for EKS Cluster = arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    [ℹ]  The API endpoint EKS Cluster = https://8F4AEE06CDA95AA5B9B82016B406F53B.gr7.us-east-2.eks.amazonaws.com
    [ℹ]  Instance type of worker node = m5.large
    [ℹ]  Default capacity of worker node = 3
```
### 麻将已完成部署

以上，您通过麻将部署了aws eks集群，他享有aws最佳实践，包括安全性，稳定性，可靠性等优良设计

![eks]({{< param "rootUrl" >}}/simple-eks.svg)

## 验证 & 使用服务组件

### 验证EKS

一旦完成以上步骤后便可以检查您部署好的集群`mahjong-cluster101`

- 从部署日志中找到EKS集群的Master role

    例如：

    ```shell
    arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    ```

- 用以下命令创建保存k8s的登陆配置`aws --region <region-code> eks update-kubeconfig --name <cluster_name> --role-arn arn:aws:iam::<aws_account_id>:role/<role_name>`

    例如：

    ```
    aws --region us-east-2 eks update-kubeconfig--name mahjong-cluster101 --role-arn arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    ```

- 安装eksctl

    ```shell
    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    sudo mv /tmp/eksctl /usr/local/bin
    ```

- 安装kubectl

    ```shell
    curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl"
    chmod +x ./kubectl
    sudo mv ./kubectl /usr/local/bin/kubectl
    kubectl version --client
    ```

- 检查您的集群

    ```shell
    $ kubectl get svc
    NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
    kubernetes   ClusterIP   172.20.0.1   <none>        443/TCP   4h41m
    ```

以上，您通过麻将部署了aws eks集群，他享有aws最佳实践，包括安全性，稳定性，可靠性等优良设计

### 使用EKS

部署eks应用

- 编辑文件 2048.k8s.yaml

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
    name: my2048-service
    spec:
    ports:
        - port: 80
        targetPort: 80
    selector:
        app: my2048-k8s
    type: LoadBalancer
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: my2048-deployment
    spec:
    replicas: 2
    selector:
        matchLabels:
        app: my2048-k8s
    template:
        metadata:
        labels:
            app: my2048-k8s
        spec:
        containers:
            - image: alexwhen/docker-2048
            name: "my2048"
            ports:
                - containerPort: 80
    ```

- 运行部署命令

    ```shell
    kubectl apply -f 2048.k8s.yaml
    ```

- 查看服务信息

    ```shell
    kubectl get service/my2048-service
    ```

    我们将看到如下输出

    ```shell
    NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
    my2048-service LoadBalancer 172.20.88.7 a6ba48df2f1774376a8e065336c8bd44-1753238188.us-east-1.elb.amazonaws.com 80:31276/TCP 4d20h
    ```

- 访问服务

    在浏览器打开应用的endpoint地址，你可以看到2048的游戏页面。enjoy~

    ![2048]({{< param "rootUrl" >}}/2048.png)
