---
title: "Build Your Own Tile"
date: 2020-07-27T14:13:55+08:00
weight: 30
---

During our usage of microservices' tile(building block). You may already find that, we need two steps (define a deployment and run a deployment) to deploy VPC, IAM, EKS sort of things with best practices on AWS cloud. We totally need around 10 steps to finish deploying 2048 games on EKS.

What if we want to deploy Nginx instead?

Now, let's create a new tile to deploy a Nginx server on top of the EKS in the previous chapter.

## Build your own tile

### Architecture

Usually, you need to think about what kind of workload of your tile belongs to?

As the basic unit, tile has to ways to build. 1. Based on [CDK Construct](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html). 2. Based on helm, k8s, shell, kustomize.

A tile usually contains with following components:
- AWS CDK
- Shell Scripts
- K8S Deployment
- K8S Heml
- K8S Kustomize

You could use the exisiting tile directly or create your own tile by following a tile specification.

Belows is the architecture of Nginx on EKS

![nginx-on-eks]({{< param "rootUrl" >}}/nginx-on-eks.svg)

### Create a folder to store your Nginx tile

Create a local directory as tiles repository

```shell
$ cd $HOME/ws/local-tiles-repo
$ mkdir
```

### Create tile spec

Create the following file `nginx/0.0.1/tile-spec.yaml`

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

### Create a deployment file

Create a k8s Nginx deployment file `nginx/0.0.1/lib/nginx-on-k8s.yml`

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

### Check your folder structure

Below is the tile specification

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

So your customized tile should look like this

```bash
nginx
└── 0.0.1
    ├── lib
    │   └── nginx-on-k8s.yml
    └── tile-spec.yaml
```

### Finish the tile development

Now, you have finished the development of the tile. You could use it to build your own infrastructure in a deployment file by depending on other existing tiles.

## Use your customized tile

### Create a deployment yaml file

Just like a tile, create a deployment file named as `nginx-on-eks.yaml`

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

### Excute tile deployment

Run `mctl deploy -f ./nginx-on-eks.yaml`. You will get the following output if everything is fine

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

### Check Nginx deployment result

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
