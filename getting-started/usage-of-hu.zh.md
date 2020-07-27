---
title: 构建你的“胡”
date: 2020-07-27T14:22:16+08:00
weight: 40
---

使用麻将，我们可以将多个牌进行组合编排，形成一个完整解决方案的交付架构，在麻将中，我们将它称为“胡”，我们可以使用自己开发的牌配合社区中已有的牌进行自己想要的完整环境组合，重要的是，除了提供您自主实现的灵活度，他们同样拥有最佳实践和快速加速的关键因素。

## 构思您自己的微服务组合

### 了解社区现有资源

#### “胡”

当您构思自己的胡，您可以查看社区的贡献列表，他们均是通过检验的最佳实践。以上是部分流行的组件列表

|        Hu    | Version | Description      |
|-----------------|---------|------------------|
| Simple EKS| [v0.1.0](./templates/eks-simple.yaml)| Quick launch with few lines of yaml.|
| EKS with Spot instance| [v0.1.0](./templates/eks-spot-simple.yaml)| Quick launch EKS cluster with mixed spot and on-demand instances, as well as handling spot termination, cluster auto scaler and HPA. |
| Simple ArgoCD | [v0.1.0](./templates/argocd-simple.yaml) | Setup ArgoCD on EKS with simple configuration.|
| Basic CD with ArgoCD | [v0.1.0](./templates/argocd-with-app.yaml) | Building a modern CD with example applicaiton on GitHub, all you need is a GitHub token.|
| Perfect Microservice on EKS | [v0.1.0]() |  Implement a handy containerized Microsercices architecture on EKS with all major componnets and demo applications. |

#### “牌”

|        Tiles    | Version | Description      |
|-----------------|---------|------------------|
| Basic Network | [v0.0.1](./tiles-repo/network0/0.0.1)  | The classic network pattern cross multiple availibilty zone with public and private subnets, NAT, etc. |
| Simple EKS| [v0.0.1](./tiles-repo/eks0/0.0.1)| The basic EKS cluster, which uses EKS 1.15 as default version and depends on Network0. |
| | [v0.0.5](./tiles-repo/eks0/0.0.5)| Update EKS default version to 1.16 and expose more options. |
| EKS on Spot | [v0.5.0](./tiles-repo/eks-with-spot/0.5.0)| Provison EKS 1.16 as default and using auto scaling group with mixed spot and normal (4:1) instances. Also has Cluster Autoscaler, Horizontal Pod Autoscaler and Spot Instance Handler setup. |
|EFS | [v0.1.0](./tiles-repo/efs/0.1.0)|The basic EFS conpoment and based on Network0. EFS is a perfect choice as storage option for Kubernetes. |
|ArgoCD | [v1.5.2](./tiles-repo/argocd0/1.5.2)|The Argocd0 is basic component to help build up GitOps based CI/CD capability, which depends on Tile - Eks0 & Network0.|
|Go-Bumblebee-ONLY| [v0.0.1](./tiles-repo/go-bumblebee-only/0.0.1) | This is demo application, which can be deploy to Kubernetes cluster to demostrate rich capabilities.|
|Istio | [v1.5.4](./tiles-repo/istio0/1.5.4) | Setup Istio 1.6 on EKS with all necessary features. Managed by Istio operator and Egress Gateway was off by default. |
|AWS KMS | [v0.1.0](./tiles-repo/aws-kms-keygenerator/0.1.0) | Generate both symmetric key and asymmetric key for down stream applications or services |
|AWS ElastiCache Redis | [v5.0.6](./tiles-repo/aws-elasticache-redis/5.0.6) | Setup a redis cluster with replcation group with flexiable options. |
|AWS Aurora Mtsql | [v2.07.2](./tiles-repo/aws-aurora-mysql/2.07.2) | Provision a Aurora MySQL cluster and integrated with Secret Manager to automate secret ratation. |
| Go-BumbleBee-Jazz | [v0.7.1](./tiles-repo/go-bumblebee-jazz/0.7.1) | Modern cloud native application with tipycal features to try out how great your Kubernetes cluster are.|

### 设计您的微服务组合

在入门环节，我们将通过自己开发的NGINX牌，组合已有的两张牌：aws redis牌，aws Aurora牌组合在一起构建典型的三层架构环境。我们可以通过下图了解麻将的工作机制：

![](/dice-mctl.png)

以下是NGINX+redis+mysql三层架构示例下的架构图：


![nginx+redis+mysql architecture](/images/xxx.svg)


### 创建一个胡repo
NGINX+redis+mysql的“胡”文件夹

```shell
$ cd $HOME/ws/local-hu-repo
$ mkdir nginx+redis+mysql/0.1.0
```


### 创建胡部署文件
胡部署文件可以定义一个或多个牌，麻将会按照我们的部署文件编排进行交付
创建以下文件`nginx-redis-mysql.yaml`

```yaml
apiVersion: mahjong.io/v1alpha1
kind: Deployment
metadata:
  name: nginx-redis-mysql
  version: 0.1.0
spec:
  template:
    tiles:
      tileNginx:
        tileReference: nginx
        tileVersion: 0.0.1
        inputs:
          - name: clusterName
            inputValue: nginx-redis-mysql
          - name: capacity
            inputValue: 3
          - name: capacityInstance
            inputValue: m5.large
          - name: version
            inputValue: 1.16
      tileAWS-ElastiCache-Redis:
        tileReference: AWS-ElastiCache-Redis
        tileVersion: 5.0.6
        dependsOn:
          - tileNginx
        inputs:
          - name: vpc
            # tileInstance.tileName.field
            inputValue: $cdk(tileNginx.Network0.baseVpc)
          - name: subnetIds
            inputValues:
              - $cdk(tileNginx.Network0.privateSubnetId1)
              - $cdk(tileNginx.Network0.privateSubnetId2)
          - name: redisClusterName
            inputValue: mahjong-redis
      tileAWS-Aurora-Mysql:
        tileReference: AWS-Aurora-Mysql
        tileVersion: 2.07.2
        dependsOn:
          - tileNginx
        inputs:
          - name: vpc
            # tileInstance.tileName.field
            inputValue: $cdk(tileNginx.Network0.baseVpc)
          - name: clusterIdentifier
            inputValue: mahjong-mysql
          - name: masterUser
            inputValue: admin
          - name: defaultDatabaseName
            inputValue: testDb

  summary:
    description:
    outputs:
      - name: Nginx Endpoint
        value: $(tileNginx.outputs.nginxEndpoint)
      - name: Redis Endpoint
        value: $(tileAWS-ElastiCache-Redis.outputs.redisEndpoint)
      - name: RDS DatabaseName
        value: $(tileAWS-Aurora-Mysql.outputs.defaultDatabaseName)
      - name: RDS Endpoint
        value: $(tileAWS-Aurora-Mysql.outputs.clusterEndpoint)
    notes: []
```

### 完成胡的开发
以上，您已经完成了您自己的胡的开发，胡可以被复用，可以被您定义为您的最佳实践环境。他可以调用任意的牌，组成一个您满意的完整的解决方案架构（例如这个nginx的胡，他调用了您自己创建的nginx的牌，调用了已有的redis和Aurora的牌），麻将的调度层将自动为您调用依赖的牌，并生成CMD命令完成构建，您在胡开发的过程中往往只需要关心您需要什么牌，组成一个什么样的架构...

## 使用您自定义的胡

### 执行麻将部署yaml文件

部署到AWS`mctl deploy -f ./nginx-redis-mysql.yaml`。如果一切顺利你讲会的得到一下结果:

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
### 检查你的redis部署结果

### 检查你的Aurora部署结果

好了，现在您可以快速的使用您的架构进行业务的开发，您还可以把您的胡分享给您的小伙伴，让我们一起使用麻将在最佳实践的环境中专注业务的构建自己的系统。

当然，作为入门级别的实例远不能体现微服务的优势和麻将的强大。请您观看这个例子[microservice-all-in-one](https://github.com/mahjong-contributions/mahjong-constuct/tree/master/hu/microservice-all-in-one/0.2.0)来体会更强大的麻将的使用。

