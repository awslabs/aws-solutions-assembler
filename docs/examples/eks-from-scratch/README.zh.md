---
title: 从零构建EKS集群
weight: 3
---

本例将会从零写一个“牌”（组建）来部署EKS集群

![simple eks architecture]({{< param "rootUrl" >}}/simple-eks.svg)

## 预装软件

- [docker](https://docs.docker.com/desktop/#download-and-install)
- [cdk](https://github.com/aws/aws-cdk)
- [aws cli v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [setup aws configuration and credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [mctl](https://github.com/awslabs/aws-solutions-assembler/releases)

## Steps

1. 确保aws cli工具配置正确，你可以通过以下命令检查

    ```shell
    $ aws configure list
        Name                    Value             Type    Location
        ----                    -----             ----    --------
    profile                <not set>             None    None
    access_key     ****************XAWA shared-credentials-file
    secret_key     ****************qEK5 shared-credentials-file
        region                us-east-2      config-file    ~/.aws/config
    ```

2. 为你的自定义的“牌”（组建）创建一个工作目录

    ```shell
    $ mkdir -p $HOME/ws/local-tiles-repo
    ```

3. 启动Dev模式的Dice后台进程并将本地的工作目录挂载至Docker容器内

    ```shell
    $ docker run -it -d -v $HOME/ws/local-tiles-repo:/workspace/tiles-repo \
    -v ~/.aws:/root/.aws \
    -e M_MODE=dev \
    -p 9090:9090 \
    docker.pkg.github.com/awslabs/aws-solutions-assembler/dice:latest

4. 创建一个基于CDK的“牌”

    ```shell
    $ cd $HOME/ws/local-tiles-repo  # enter local tiles repository
    $ mctl init tile -d myeks       # init a CDK tile template under myeks folder
    2020-07-22T11:33:28+08:00 [!]  no such flag -filename
    [ℹ]  Loading  templates from Tile-Repo started ...
    ########
    [ℹ]  Loading  templates finished.
    [ℹ]  Generated file - myeks//0.1.0
    [ℹ]  Generated file - myeks/0.1.0/README.md.tp
    [ℹ]  Generated file - myeks/0.1.0/jest.config.js
    [ℹ]  Generated file - myeks/0.1.0/lib
    [ℹ]  Generated file - myeks/0.1.0/lib/index.ts.tp
    [ℹ]  Generated file - myeks/0.1.0/package-lock.json.tp
    [ℹ]  Generated file - myeks/0.1.0/package.json.tp
    [ℹ]  Generated file - myeks/0.1.0/test
    [ℹ]  Generated file - myeks/0.1.0/test/simple.test.ts.tp
    [ℹ]  Generated file - myeks/0.1.0/tile-spec.yaml.tp
    [ℹ]  Generated file - myeks/0.1.0/tsconfig.json
    $ cd myeks
    $ tree .    # check your folder
    .
    └── myeks
        └── 0.1.0
            ├── README.md
            ├── jest.config.js
            ├── lib
            │   └── index.ts        # main function
            ├── package-lock.json
            ├── package.json
            ├── test
            │   └── simple.test.ts  # unit test
            ├── tile-spec.yaml      # the tile definition
            └── tsconfig.json

    4 directories, 8 files
    $ rm myeks/0.1.0/package-lock.json  # remove the generated package-lock.json because it's out of date
    $ cd myeks/0.1.0/
    $ npm install # install dependencies
    ```

5. 为了让我们的EKS集群有足够的权限，首先创建一个policy的配置描述脚本`lib/policy4eks.ts`

    ```ts
    // lib/policy4eks.ts
    import cdk = require('@aws-cdk/core');
    import ec2 = require('@aws-cdk/aws-ec2');
    import iam = require('@aws-cdk/aws-iam');

    export interface PolicyProps { }

    export class NodePolicies extends cdk.Construct {

    public eksInlinePolicy: { [name: string]: iam.PolicyDocument }

    constructor(scope: cdk.Construct, id: string, props: PolicyProps) {
        super(scope, id);

        this.eksInlinePolicy = {
        "Autoscaler4eks": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "autoscaling:DescribeAutoScalingGroups",
                "autoscaling:DescribeAutoScalingInstances",
                "autoscaling:DescribeLaunchConfigurations",
                "autoscaling:DescribeTags",
                "autoscaling:SetDesiredCapacity",
                "autoscaling:TerminateInstanceInAutoScalingGroup",
                "ec2:DescribeLaunchTemplateVersions"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "ALBIngress": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "acm:GetCertificate",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CreateSecurityGroup",
                "ec2:CreateTags",
                "ec2:DeleteTags",
                "ec2:DeleteSecurityGroup",
                "ec2:DescribeAccountAttributes",
                "ec2:DescribeAddresses",
                "ec2:DescribeInstances",
                "ec2:DescribeInstanceStatus",
                "ec2:DescribeInternetGateways",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:DescribeTags",
                "ec2:DescribeVpcs",
                "ec2:ModifyInstanceAttribute",
                "ec2:ModifyNetworkInterfaceAttribute",
                "ec2:RevokeSecurityGroupIngress",
                "elasticloadbalancing:AddListenerCertificates",
                "elasticloadbalancing:AddTags",
                "elasticloadbalancing:CreateListener",
                "elasticloadbalancing:CreateLoadBalancer",
                "elasticloadbalancing:CreateRule",
                "elasticloadbalancing:CreateTargetGroup",
                "elasticloadbalancing:DeleteListener",
                "elasticloadbalancing:DeleteLoadBalancer",
                "elasticloadbalancing:DeleteRule",
                "elasticloadbalancing:DeleteTargetGroup",
                "elasticloadbalancing:DeregisterTargets",
                "elasticloadbalancing:DescribeListenerCertificates",
                "elasticloadbalancing:DescribeListeners",
                "elasticloadbalancing:DescribeLoadBalancers",
                "elasticloadbalancing:DescribeLoadBalancerAttributes",
                "elasticloadbalancing:DescribeRules",
                "elasticloadbalancing:DescribeSSLPolicies",
                "elasticloadbalancing:DescribeTags",
                "elasticloadbalancing:DescribeTargetGroups",
                "elasticloadbalancing:DescribeTargetGroupAttributes",
                "elasticloadbalancing:DescribeTargetHealth",
                "elasticloadbalancing:ModifyListener",
                "elasticloadbalancing:ModifyLoadBalancerAttributes",
                "elasticloadbalancing:ModifyRule",
                "elasticloadbalancing:ModifyTargetGroup",
                "elasticloadbalancing:ModifyTargetGroupAttributes",
                "elasticloadbalancing:RegisterTargets",
                "elasticloadbalancing:RemoveListenerCertificates",
                "elasticloadbalancing:RemoveTags",
                "elasticloadbalancing:SetIpAddressType",
                "elasticloadbalancing:SetSecurityGroups",
                "elasticloadbalancing:SetSubnets",
                "elasticloadbalancing:SetWebACL",
                "iam:CreateServiceLinkedRole",
                "iam:GetServerCertificate",
                "iam:ListServerCertificates",
                "waf-regional:GetWebACLForResource",
                "waf-regional:GetWebACL",
                "waf-regional:AssociateWebACL",
                "waf-regional:DisassociateWebACL",
                "tag:GetResources",
                "tag:TagResources",
                "waf:GetWebACL",
                "wafv2:GetWebACL",
                "wafv2:GetWebACLForResource",
                "wafv2:AssociateWebACL",
                "wafv2:DisassociateWebACL",
                "shield:DescribeProtection",
                "shield:GetSubscriptionState",
                "shield:DeleteProtection",
                "shield:CreateProtection",
                "shield:DescribeSubscription",
                "shield:ListProtections"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "AppMesh": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "appmesh:*",
                "servicediscovery:CreateService",
                "servicediscovery:GetService",
                "servicediscovery:RegisterInstance",
                "servicediscovery:DeregisterInstance",
                "servicediscovery:ListInstances",
                "servicediscovery:ListNamespaces",
                "servicediscovery:ListServices",
                "route53:GetHealthCheck",
                "route53:CreateHealthCheck",
                "route53:UpdateHealthCheck",
                "route53:ChangeResourceRecordSets",
                "route53:DeleteHealthCheck"

                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "CertManagerChangeSet": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "route53:ChangeResourceRecordSets"
                ],
                resources: ["arn:aws:route53:::hostedzone/*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "CertManagerGetChange": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "route53:GetChange"
                ],
                resources: ["arn:aws:route53:::change/*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "CertManagerHostedZone": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "route53:ListHostedZones",
                "route53:ListResourceRecordSets",
                "route53:ListHostedZonesByName",
                "route53:ListTagsForResource"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "EBS": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "ec2:AttachVolume",
                "ec2:CreateSnapshot",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:DeleteSnapshot",
                "ec2:DeleteTags",
                "ec2:DeleteVolume",
                "ec2:DescribeAvailabilityZones",
                "ec2:DescribeInstances",
                "ec2:DescribeSnapshots",
                "ec2:DescribeTags",
                "ec2:DescribeVolumes",
                "ec2:DescribeVolumesModifications",
                "ec2:DetachVolume",
                "ec2:ModifyVolume"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "EFS": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "elasticfilesystem:*"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "EFSEC2": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "ec2:DescribeSubnets",
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface",
                "ec2:ModifyNetworkInterfaceAttribute",
                "ec2:DescribeNetworkInterfaceAttribute"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "FSX": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "fsx:*"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "ServiceLinkRole": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "iam:CreateServiceLinkedRole",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        }),
        "XRay": new iam.PolicyDocument({
            statements: [
            new iam.PolicyStatement({
                actions: [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords",
                "xray:GetSamplingRules",
                "xray:GetSamplingTargets",
                "xray:GetSamplingStatisticSummaries"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }),
            ]
        })
        }

    }
    }
    ```

6. 接着创建CDK组建。 CDK的组建核心是定义好输入属性和输出的值，以下是输入输出。

    ```ts
    // inputs
    export interface MyEKSProps {
      vpc: ec2.Vpc,
      vpcSubnets?: ec2.ISubnet[],
      clusterName: string,
      capacity?: number,
      capacityInstance?: string,
      clusterVersion?: string,      // EKS cluster version, like: 1.16, 1.17
    }
    // outputs
    export class MyEKS extends cdk.Construct {
      public readonly clusterName: string;      // The cluster name
      public readonly clusterEndpoint: string;  // The endpoint URL for the Cluster
      public readonly masterRoleARN: string;    // An IAM role that will be `system:masters` privileges on your cluster
      public readonly clusterArn: string;       // The AWS generated ARN for the Cluster resource
      public readonly capacity: number;         // Capacity
      public readonly capacityInstance: string; // Instance type, like: t2.medium, m5.large
    }
    ```

    以下是`myeks`“牌”的完整代码

    ```ts
    // lib/index.ts
    import * as cdk from '@aws-cdk/core';
    import eks = require('@aws-cdk/aws-eks');
    import ec2 = require('@aws-cdk/aws-ec2');
    import iam = require('@aws-cdk/aws-iam');
    import { NodePolicies } from './policy4eks'
    import { ManagedPolicy, ServicePrincipal, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';

    /** Input parameters */
    export interface MyEKSProps {
      vpc: ec2.Vpc,
      vpcSubnets?: ec2.ISubnet[],
      clusterName: string,
      capacity?: number,
      capacityInstance?: string,
      clusterVersion?: string,
    }

    export class MyEKS extends cdk.Construct {

      /** Directly exposed to other stack */
      public readonly clusterName: string;
      public readonly clusterEndpoint: string;
      public readonly masterRoleARN: string;
      public readonly clusterArn: string;
      public readonly capacity: number;
      public readonly capacityInstance: string;

      constructor(scope: cdk.Construct, id: string, props: MyEKSProps) {
        super(scope, id);

        const eksRole = new iam.Role(this, 'EksClusterMasterRole', {
          assumedBy: new iam.AccountRootPrincipal(),
          managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSServicePolicy"),
            ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSClusterPolicy"),
          ]
        });

        // Instance type for node group
        let capacityInstance: ec2.InstanceType;
        if (props.capacityInstance == undefined) {
          capacityInstance = ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.LARGE);
        } else {
          capacityInstance = new ec2.InstanceType(props.capacityInstance);
        }

        // Prepared subnet for node group
        let vpcSubnets: ec2.SubnetSelection[];
        if (props.vpcSubnets == undefined) {
          vpcSubnets = [{ subnets: props.vpc.publicSubnets }, { subnets: props.vpc.privateSubnets }];
        } else {
          vpcSubnets = [{ subnets: props.vpcSubnets }];
        }
        // Innitial EKS cluster
        const cluster = new eks.Cluster(this, "BasicEKSCluster", {
          vpc: props.vpc,
          vpcSubnets: vpcSubnets,
          clusterName: props.clusterName,
          defaultCapacity: 0,
          version: eks.KubernetesVersion.of(props.clusterVersion || '1.16'),
          // Master role as initial permission to run Kubectl
          mastersRole: eksRole,
        });

        /** managed nodegroup */
        const nodegroupRole = new iam.Role(scope, 'NodegroupRole', {
          assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
          managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
            ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
            ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
          ],
          inlinePolicies: new NodePolicies(scope, "inlinePolicies", {}).eksInlinePolicy
        });
        const managed = cluster.addNodegroup("managed-node", {
          instanceType: capacityInstance,
          minSize: Math.round(props.capacity! / 2),
          maxSize: props.capacity,
          nodeRole: nodegroupRole
        });

        /** Added CF Output */
        new cdk.CfnOutput(this, "clusterName", { value: cluster.clusterName })
        new cdk.CfnOutput(this, "masterRoleARN", { value: eksRole.roleArn })
        new cdk.CfnOutput(this, "clusterEndpoint", { value: cluster.clusterEndpoint })
        new cdk.CfnOutput(this, "clusterArn", { value: cluster.clusterArn })
        new cdk.CfnOutput(this, "capacity", { value: String(props.capacity) || "0" })
        new cdk.CfnOutput(this, "capacityInstance", { value: capacityInstance.toString() })

        this.clusterName = cluster.clusterName;
        this.masterRoleARN = eksRole.roleArn;
        this.clusterEndpoint = cluster.clusterEndpoint;
        this.clusterArn = cluster.clusterArn;
        this.capacity = props.capacity || 0
        this.capacityInstance = capacityInstance.toString()
      }
    }
    ```

7. 一旦完成了基于CDK的牌的开发，我们可以通过一个简单的测试去验证集群的配置

    ```ts
    // test/myeks.test.ts
    import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
    import * as cdk from '@aws-cdk/core';
    import MyEKS = require('../lib/index');
    import ec2 = require('@aws-cdk/aws-ec2');

    test('EKS Cluster Created', () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, "TestStack");
      const vpc = new ec2.Vpc(stack, "Vpc");

      // WHEN
      new MyEKS.MyEKS(stack, 'MyTestConstruct', { vpc: vpc, clusterName: "testCluster" });
      // THEN
      expectCDK(stack).to(haveResource("AWS::EKS::Nodegroup"));
    });
    ```

    ```shell
    $ npm run test

    > myeks@0.1.0 test ***
    > jest

    PASS  test/myeks.test.ts
    ✓ EKS Cluster Created (1441ms)

    Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total
    Snapshots:   0 total
    Time:        4.341s, estimated 6s
    Ran all test suites.
    ```

8. 为了可以部署这张“牌”，还需要定义`tile-spec.yaml`

    ```yaml
    # API version
    apiVersion: mahjong.io/v1alpha1
    # Kind of entity
    kind: Tile
    # Metadata
    metadata:
        # Name of entity
        name: MyEKS
        # Category of entity
        category: ContainerProvider
        # Vendor
        vendorService: EKS
        # Version of entity
        version: 0.0.5
    # Specification
    spec:
      # Dependencies represent dependency with other Tile
      dependencies:
          # As a reference name
        - name: network
          # Tile name
          tileReference: Network0
          # Tile version
          tileVersion: 0.0.1
      # Inputs are input parameters when lauching
      inputs:
        # String
        - name: cidr
          inputType: String
          require: true
          override:
            name: network
            field: cidr
        # CDKObject
        - name: vpc
          inputType: CDKObject
          description: 'Refer to VPC object on Tile - Network0'
          dependencies:
              # Reference name in Dependencies
            - name: network
              # Filed name in refered Tile
              field: baseVpc
          # Input is mandatory or not, true is mandatory and false is optional
          require: false
        # CDKObject[]
        - name: vpcSubnets
          inputType: CDKObject[]
          description: ''
          dependencies:
            - name: network
              field: publicSubnet1
            - name: network
              field: publicSubnet2
            - name: network
              field: privateSubnet1
            - name: network
              field: privateSubnet2
          require: false
        # String
        - name: clusterName
          inputType: String
          description: ''
          defaultValue: default-eks-cluster
          require: true
        # Number/ default: 2
        - name: capacity
          inputType: Number
          description: ''
          defaultValue: 2
          require: false
        # String/ default: 'c5.large'
        - name: capacityInstance
          inputType: String
          description: ''
          defaultValue: 'c5.large'
          require: false
        # String/ default: '1.15'
        - name: clusterVersion
          inputType: String
          description: ''
          defaultValue: '1.16'
          require: false
      # Ouptputs represnt output value after launched, for 'ContainerApplication' might need leverage specific command to retrive output.
      outputs:
        # String
        - name: clusterName
          outputType: String
          description: AWS::EKS::Cluster.Name
        # String
        - name: clusterArn
          outputType: String
          description: AWS::EKS::Cluster.ARN
        # String
        - name: clusterEndpoint
          outputType: String
          description: AWS::EKS::Cluster.Endpoint
        # String
        - name: masterRoleARN
          outputType: String
          description: AWS::IAM::Role.ARN
        # String
        - name: capacityInstance
          outputType: String
          description: AWS::EKS::Cluster.capacityInstance
        # String/ default: '1.15'
        - name: capacity
          outputType: String
          description: AWS::EKS::Cluster.capacity

      # Notes are description list for addtional information.
      notes:
        - "Tag public subnets with 'kubernetes.io/role/elb=1'"
        - "Tag priavte subnets with 'kubernetes.io/role/internal-elb=1'"
    ```

    您可能会好奇为什么这张“牌”会依赖于`network`“牌”。原因是由于我们在之前的输入属性`MyEKSProps`中需要提供VPC的一些配置
    然后这些配置刚好可以利用现有的`network`“牌”

9. 最后，通过一个部署YAML`try-myeks.yaml`文件去部署整个EKS集群

    ```yaml
    # try-myeks.yaml
    apiVersion: mahjong.io/v1alpha1
    kind: Deployment
    metadata:
      name: MyEKS
      version: 0.1.0
    spec:
      template:
        tiles:
          MyEKS:
              tileReference: MyEKS
              tileVersion: 0.1.0
              inputs:
              - name: clusterName
                inputValue: myeks-cluster
              - name: capacity
                inputValue: 3
              - name: capacityInstance
                inputValue: m5.large
              - name: version
                inputValue: 1.17
      summary:
        description:
        outputs:
        - name: EKS Cluster Name
          value: $(MyEKS.outputs.clusterName)
        - name: Master role arn for EKS Cluster
          value: $(MyEKS.outputs.masterRoleARN)
        - name: The API endpoint EKS Cluster
          value: $(MyEKS.outputs.clusterEndpoint)
        - name: Instance type of worker node
          value: $(MyEKS.outputs.capacityInstance)
        - name: Default capacity of worker node
          value: $(MyEKS.outputs.capacity)

        notes: []
    ```

    ```shell
    $ mctl deploy -f ./try-myeks.yaml
    ```
