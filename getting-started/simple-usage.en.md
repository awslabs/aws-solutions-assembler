---
title: Simple Usage
date: 2020-07-27T13:56:43+08:00
---

As you know, many of contributors have built best practices into Mahjong's building blocks. We called it "tile"

In this case, we're going to deploy a AWS EKS cluster

You only need to define your cluster name, nodes number, instance types and k8s version. Mahjong will help you to build cluster with minimal permission, cross AZ environment

## Define and build service component

### Know how to use Mahjong

Mahjong use Yaml to control deployment and tiles definition, including:

#### Tile

A building block, defined by YAML, represents a cloud component or a combination of multiple cloud components or resources. Tile is categorized by Network, ContainerProvider, Storage, Database, Application, ContainerApplication, Analysis, ML. Application and ContainerApplication are represented through commands and files, and rest of categories are represented through Construct::CDK

#### Deployment

A unit of deployment,  defined by YAML, and all resources defined within the scope of Tiles.

#### "Hu"

A high level collection of deployment units,  defined by YAML, represents a full solution and includes multiple Tiles with specific definition.

![high-level-arch]({{< param "rootUrl" >}}/high-level-arch.png)

### Define your EKS cluster

Now, let's define your EKS cluster with a simple yaml file

create `simple-eks.yaml`

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

### Deploy it to AWS cloud

Run `mctl deploy -f ./simple-eks.yaml`

```shell
    $ mctl deploy -f ./simple-eks.yaml
```

You will get the following output if everything works as expected

```shell

    [ℹ]  EKS Cluster Name = mahjong-cluster101
    [ℹ]  Master role arn for EKS Cluster = arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    [ℹ]  The API endpoint EKS Cluster = https://8F4AEE06CDA95AA5B9B82016B406F53B.gr7.us-east-2.eks.amazonaws.com
    [ℹ]  Instance type of worker node = m5.large
    [ℹ]  Default capacity of worker node = 3
```

### Finish the deployment

Now your have finished AWS EKS deployment with Mahjong

![eks]({{< param "rootUrl" >}}/simple-eks.svg)

## Verification

### Verify EKS

Once you have finished the deployment, you can check your cluster `mahjong-cluster101`

- Find the master role in deployment logs

    For example:

    ```shell
    arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    ```

- Run `aws --region <region-code> eks update-kubeconfig --name <cluster_name> --role-arn arn:aws:iam::<aws_account_id>:role/<role_name>` to save k8s logging configuration

    For example:

    ```
    aws --region us-east-2 eks update-kubeconfig--name mahjong-cluster101 --role-arn arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    ```

- Install eksctl

    ```shell
    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    sudo mv /tmp/eksctl /usr/local/bin
    ```

- Install kubectl

    ```shell
    curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl"
    chmod +x ./kubectl
    sudo mv ./kubectl /usr/local/bin/kubectl
    kubectl version --client
    ```

- Check the cluster

    ```shell
    $ kubectl get svc
    NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
    kubernetes   ClusterIP   172.20.0.1   <none>        443/TCP   4h41m
    ```

### Use the EKS

Now let's deploy a web game with the provisioned EKS cluster

- create a file `2048.k8s.yaml`

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

- Run deployment

    ```shell
    $ kubectl apply -f 2048.k8s.yaml
    ```

- Check service status

    ```shell
    $ kubectl get service/my2048-service
    NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
    my2048-service LoadBalancer 172.20.88.7 a6ba48df2f1774376a8e065336c8bd44-1753238188.us-east-1.elb.amazonaws.com 80:31276/TCP 4d20h
    ```

- Access your service

    open your application endpoint in your browser

    ![2048]({{< param "rootUrl" >}}/2048.png)
