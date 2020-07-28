---
title: EKS集群上部署Nginx
weight: 2
---

本例子会首先部署一个EKS集群，并在集群部署好之后在该集群上部署一个Nginx实例

以下是架构图：

![simple eks architecture]({{< param "rootUrl" >}}/nginx-on-eks.svg)

## 预装软件

- [docker](https://docs.docker.com/desktop/#download-and-install)
- [cdk](https://github.com/aws/aws-cdk)
- [aws cli v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [setup aws configuration and credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)

## 步骤

1. 确保aws cli工具配置正确，你可以通过以下命令检查

    ```shell
    $ aws configure list
        Name                    Value             Type    Location
        ----                    -----             ----    --------
    profile                <not set>             None    None
    access_key     ****************ABCD  shared-credentials-file
    secret_key     ****************ABCD  shared-credentials-file
        region                us-west-2             env    AWS_DEFAULT_REGION
    ```

2. 为你的自定义的“牌”（组建）创建一个工作目录

    ```shell
    $ mkdir -p $HOME/ws/local-tiles-repo
    ```

2. 启动Dev模式的Dice后台进程并将本地的工作目录挂载至Docker容器内

    ```shell
    $ docker run -it -d -v $HOME/ws/local-tiles-repo:/workspace/tiles-repo \
    -v ~/.aws:/root/.aws \
    -e M_MODE=dev \
    -p 9090:9090 \
    docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest
    ```

3. 创建一个Nginx的“牌”

    ```shell
    $ cd $HOME/ws/local-tiles-repo
    $ mkdir nginx/0.0.1
    ```

4. 创建以下文件`nginx/0.0.1/tile-spec.yaml`

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

5. 编写k8s的Nginx部署脚本`nginx/0.0.1/lib/nginx-on-k8s.yml`

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

6. 您的工作目录应该如下

    ```
    nginx
    └── 0.0.1
        ├── lib
        │   └── nginx-on-k8s.yml
        └── tile-spec.yaml
    ```

7. 创建一个YAML配置文件并将其命名为`nginx-on-eks.yaml`

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

8. 执行CDK引导程序`cdk bootstrap aws://<your aws account>/<aws region>`，例如：

    ```
    cdk bootstrap aws://638198787577/us-east-2
    ```

    {{% notice note %}}该步骤只需要执行一次，以后无需再执行
    {{% /notice %}}

9. 部署到AWS`mctl deploy -f ./nginx-on-eks.yaml`。如果一切顺利你讲会的得到一下结果:

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

10. 检查你的Niginx部署结果

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
