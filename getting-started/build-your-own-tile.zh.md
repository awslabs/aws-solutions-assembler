---
title: 构建你的“牌”
date: 2020-07-27T14:14:06+08:00
weight: 30
---

在使用微服务块“牌”的环节或许您已经发现，我们通过两个操作（定义部署和执行部署）就交付了AWS的VPC，IAM，EKS等多个资源环境，并且他们享有最佳实践。而我们通过10个左右的步骤完成EKS上2048游戏的部署。

如果我们将2048这样的应用考虑为不同于EKS的另外一个“牌”进行定义.通常这也仅需要几个简单的步骤即可完成。届时我们的团队，包括麻将的生态均可复用您的牌。

现在，我们构建自己的牌，在入门示例中我们的牌将在EKS上运行NGINX

## 构建自己的微服务块

### 构思牌的架构

通常，您可以需要构思您的牌属于哪种负载，他在您微服务架构中的作用是什么。
作为麻将的最基本单元，Tile的构建有两种方法。一种方法基于CDK，它是[CDK Construct](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html)和Tile规范的组合。另一种方法是使用各种工件和Tile规范进行构建，这将让您操纵绝大多数资源。
牌通常由以下组件构成：
- AWS CDK
- CMD 命令
- K8S Deployment
- K8S Heml
- K8S Kustomize
您可能是调用已有的，或是您原创的yaml文件按照麻将框架定义的文件夹结构进行牌的定义

一个好的牌关键因素在于
- 考虑处理重复部署
- 考虑可以同时部署多个Tile
- 管理各种潜在的错误

以下是NGINX示例下的架构图：

![nginx-on-eks](/nginx-on-eks.svg)

### 创建一个Nginx的“牌”文件夹
创建一个本地文件夹作为Tile Repo，以便您可以立即开发和测试Tile。如果无法从此本地存储库加载Tile，Dice将尝试从公共Tile存储库加载Tile。

```shell
$ cd $HOME/ws/local-tiles-repo
$ mkdir nginx/0.0.1
```

### 创建牌定义文件
创建以下文件`nginx/0.0.1/tile-spec.yaml`

```yaml
    # API version
    apiVersion: mahjong.io/v1alpha1
    # Kind of entity
    kind: Tile
    # Metadata
    metadata:
        # Name of entity
        name: nginx
        # Category of entity
        category: ContainerApplication
        # Version of entity
        version: 0.0.1
    # Specification
    spec:
      # Dependencies represent dependency with other Tile
      dependencies:
        - name: eks
          # Tile name
          tileReference: Eks0
          # Tile version
          tileVersion: 0.0.5

      inputs:
        - name: clusterName
          inputType: String
          require: true
          override:
            name: eks
            field: clusterName
        - name: capacity
          inputType: Number
          require: false
          override:
            name: eks
            field: capacity
          defaultValue: 2
        - name: capacityInstance
          inputType: String
          require: false
          override:
            name: eks
            field: capacityInstance
          defaultValue: c5.xlarge
        - name: version
          inputType: String
          require: false
          override:
            name: eks
            field: version
          defaultValue: 1.15

      #aws eks --region <region> update-kubeconfig --name <cluster> --role-arn <master role arn> --kubeconfig <config>
      manifests:
        # Type of manifest
        manifestType: K8s
        namespace: default
        # manifest list
        files:
          - nginx-on-k8s.yml

      # Ouptputs represnt output value after launched, for 'ContainerApplication' might need leverage specific command to retrive output.
      outputs:
        # String
        - name: nginxEndpoint
          outputType: String
          defaultValueCommand: kubectl get svc nginx-service -o jsonpath='{.status..hostname}'
          description: Custom::String

      notes: []
```
### 创建应用部署文件
编写k8s的Nginx部署文件`nginx/0.0.1/lib/nginx-on-k8s.yml`他已经在牌yaml文件中被定义，麻将在部署过程中自动生成命令脚本，运行这个Nginx部署脚本

```yaml
    apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
    kind: Deployment
    metadata:
      name: mahjong-nginx-deployment
    spec:
      selector:
        matchLabels:
          app: nginx
      replicas: 2 # tells deployment to run 2 pods matching the template
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: nginx:1.14.2
            ports:
            - containerPort: 80
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: nginx-service
    spec:
      selector:
        app: nginx
      ports:
        - port: 80
          targetPort: 80
      type: LoadBalancer
```

### 检查您的牌定义结构
麻将为牌定义了规范的框架，以下是牌规范的定义
```bash
# Make foder as your local Tiles repo, see following example folders.
#
# + local-tiles-repo
#    |
#    +- <tile name (lower case)>
#        |
#        +- <version of tile (eg: 0.1.0)>
#            |
#            +- <all content here>
```

映射上面的规范定义，您需要按照框架的规范放置您的文件，按照我们的操作步骤，现在您的工作目录应符合麻将的规范，目录结构如下

```bash
nginx
└── 0.0.1
    ├── lib
    │   └── nginx-on-k8s.yml
    └── tile-spec.yaml
```

### 完成牌的开发

以上，您已经完成了一张您自己的牌的开发，牌可以被复用，可以被您定义为您的最佳实践环节。也可以依赖于其他的牌，组成一个功能更丰富的牌（例如这个nginx的牌，他依赖于已有的VPC和EKS牌），麻将的调度层将自动为您调用依赖的牌，并生成CMD命令完成构建，您在牌开发的过程中往往只需要关心您在什么牌之上构建一个什么模块...

## 使用您自定义的牌

### 编写麻将部署yaml文件

和使用已有的牌一样，我们进行定义部署和执行部署两个动作。现在我们创建一个YAML配置文件并将其命名为`nginx-on-eks.yaml`

```yaml
    apiVersion: mahjong.io/v1alpha1
    kind: Deployment
    metadata:
      name: nginx
      version: 0.1.0
    spec:
      template:
        tiles:
          tileNginx:
            tileReference: nginx
            tileVersion: 0.0.1
            inputs:
              - name: clusterName
                inputValue: nginx-on-eks
              - name: capacity
                inputValue: 3
              - name: capacityInstance
                inputValue: m5.large
              - name: version
                inputValue: 1.16

      summary:
        description:
        outputs:
          - name: Nginx Endpoint
            value: $(tileNginx.outputs.nginxEndpoint)

        notes: []
```

### 执行麻将部署yaml文件

部署到AWS`mctl deploy -f ./nginx-on-eks.yaml`。如果一切顺利你讲会的得到一下结果:

```shell
$ mctl deploy -f ./nginx-on-eks.yaml

...

[ℹ]  + export KUBECONFIG=/workspace/nginx/lib/nginx/kube.config
[ℹ]  + KUBECONFIG=/workspace/nginx/lib/nginx/kube.config
[ℹ]  + export WORK_HOME=/workspace/nginx
[ℹ]  + WORK_HOME=/workspace/nginx
[ℹ]  + export TILE_HOME=/workspace/nginx/lib/nginx
[ℹ]  + TILE_HOME=/workspace/nginx/lib/nginx
[ℹ]  + export NAMESPACE=default
[ℹ]  + NAMESPACE=default
[ℹ]  + cd /workspace/nginx
[ℹ]  + kubectl apply -f /workspace/nginx/lib/nginx/lib/nginx-on-k8s.yml -n default
[ℹ]  deployment.apps/mahjong-nginx-deployment unchanged
[ℹ]  service/nginx-service unchanged
[ℹ]  + sleep 10
[ℹ]  ++ kubectl get svc nginx-service -o 'jsonpath={.status..hostname}'
[ℹ]  + echo '{"nginxEndpoint=a3d984b0d065e46feafcc5d9b944b0e7-1722932499.us-east-2.elb.amazonaws.com"}'
[ℹ]  Extract outputs: [nginxEndpoint] = [a3d984b0d065e46feafcc5d9b944b0e7-1722932499.us-east-2.elb.amazonaws.com]
[ℹ]
[ℹ]
[ℹ]
[ℹ]  Nginx Endpoint = a3d984b0d065e46feafcc5d9b944b0e7-1722932499.us-east-2.elb.amazonaws.com
[ℹ]
[ℹ]
```

### 检查你的Niginx部署结果

```shell
$ curl a3d984b0d065e46feafcc5d9b944b0e7-1722932499.us-east-2.elb.amazonaws.com
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

