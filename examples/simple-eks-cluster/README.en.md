---
title: Simple EKS Cluster
weight: 1
---

This example will deploy a simple EKS cluster with existing tile

![simple eks architecture]({{< param "rootUrl" >}}/simple-eks.svg)

## Prerequisites

- [docker](https://docs.docker.com/desktop/#download-and-install)
- [cdk](https://github.com/aws/aws-cdk)
- [aws cli v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [setup aws configuration and credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)

## Steps

1. Make sure your aws cli is well configured, you will see something like below

    ```shell
    $ aws configure list
        Name                    Value             Type    Location
        ----                    -----             ----    --------
    profile                <not set>             None    None
    access_key     ****************XAWA shared-credentials-file
    secret_key     ****************qEK5 shared-credentials-file
        region                us-east-2      config-file    ~/.aws/config
    ```

2. Lanuch dice daemon if not existing:

    ```shell
    $ docker run -d -v ~/.aws:/root/.aws -p 9090:9090 docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest
    ```

3. Create a YAML config file named as `simple-eks.yaml`

    ```yaml
    apiVersion: mahjong.io/v1alpha1
    kind: Deployment
    metadata:
      name: eks-simple
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

4. Bootstrap CDK: `cdk bootstrap aws://<your aws account>/<aws region>`. For example:

    ```
    cdk bootstrap aws://638198787577/us-east-2
    ```

    {{% notice note %}}This step only need to process once
    {{% /notice %}}

5. Deploy to AWS: `mctl deploy -f ./simple-eks.yaml`. If everything works fine you will get this:

    ```shell
    $ mctl deploy -f ./simple-eks.yaml

    ...

    [ℹ]  EKS Cluster Name = mahjong-cluster101
    [ℹ]  Master role arn for EKS Cluster = arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
    [ℹ]  The API endpoint EKS Cluster = https://8F4AEE06CDA95AA5B9B82016B406F53B.gr7.us-east-2.eks.amazonaws.com
    [ℹ]  Instance type of worker node = m5.large
    [ℹ]  Default capacity of worker node = 3
    ```

6. Once you finished the previous step, you can check your cluster `mahjong-cluster101`
    1. Find your master role arn for eks cluster.

        For example:

        ```
        arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
        ```

    2. Create kubernetes config by `aws --region <region-code> eks update-kubeconfig --name <cluster_name> --role-arn arn:aws:iam::<aws_account_id>:role/<role_name>`.

        For example:

        ```
        aws --region us-east-2 eks update-kubeconfig--name mahjong-cluster101 --role-arn arn:aws:iam::638198787577:role/Eks0StacktileEks0005-Eks0EksClusterMasterRole76926-D9OV6NASDYGC
        ```

    3. Test your kubernetes cluster

        ```shell
        $ kubectl get svc
        NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
        kubernetes   ClusterIP   172.20.0.1   <none>        443/TCP   4h41m
        ```

       {{% notice note %}}Make sure you have [kubernetes-cli](https://kubernetes.io//docs/tasks/tools/install-kubectl/) installed to be able to use `kubectl`
       {{% /notice %}}
