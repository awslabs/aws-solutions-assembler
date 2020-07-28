---
title: "Config Spec"
date: 2020-07-27T16:23:31+08:00
weight: 40
---

## Tile Spec

```yaml
# API version
# Dice will inject environment variables, such as $WORK_HOME, $NAMESPACE, $TILE_HOME..., etc.
apiVersion: mahjong.io/v1alpha1
# Kind of entity
# - Options:  Tile, a construct component
#             Deployment, a deployment unit
#             Hu, a prepared deployment unit with architectural design
kind:
# Metadata
metadata:
    # Name of entity
    name:
    # Category of entity
    # - Options:  Network, provisioned through CDK approach.
    #             Compute, provisioned through CDK approach.
    #             ContainerProvider, provisioned through CDK approach.
    #             Storage, provisioned through CDK approach.
    #             Database, provisioned through CDK approach.
    #             Application, !!! provisioned through specific approach due to application features. Not defined yet!!!
    #             ContainerApplication, !!! provisioned through specific approach based on manifest type. !!!
    #             Analysis, provisioned through CDK approach.
    #             ML, provisioned through CDK approach.
    category:

    # Indicate service of contianer vendor when category is ContainerApplication, different vendor require specific
    # parameters to connect with Cluster.
    # - Options:  EKS, AWS Elastic Kubernetes Service, require: Cluster Name, Master Role ARN
    #             ECS, ???
    #             Kops, ???
    #             Kubernetes, ???
    vendorService:

    # Dependent on what kind of vendor service, to determine what input parameters are required.
    # For example, dependentOnVendorService: EKS, that's required 'clusterName', 'masterRoleARN'
    dependentOnVendorService:

    # Version of entity
    version:
# Specification
spec:
  global:
    env:
      - name:
        value:
        value:
  preRun:
    stages:
      - name:
        command:


  # Dependencies represent dependency with other Tile
  dependencies:
      # As a reference name
    - name:
      # Tile name
      tileReference:
      # Tile version
      tileVersion:
  # Inputs are input parameters when lauching
  inputs:
      # Name of input parameter, with dependency
    - name:
      # Type of input parameter
      # - Options:  String/String[], string type, [] indicate the input is array
      #             Number/Number[], number type, [] indicate the input is array
      #             CDKObject/CDKObject[], input is a object refer to a CDK construct, [] indicate the input is array
      #             Base64
      inputType:
      # Dependency list, dependency could be more than one list and will orgnized as an array. -> {'', '', ''}
      dependencies:
          # Reference name in Dependencies
        - name:
          # Filed name in refered Tile
          field:
          # Override input field of referred dependency if true
          # override: true/false
      require: true

    # Name of input parameter with default value
    - name:
      inputType:
      require: false
      # default value of input parameter
      defaultValue:
    - name:
      inputType:
      require: false
      override:
        name:
        field:
  manifests:
    # Type of manifest
    # - Options:  K8s, standard k8s manifest: deployment, service, etc.
    #             Helm, helm style manifiest, parsing with 'folders'
    #             Kustomize, kustomize style manifest, parsing with 'folders'
    # manifest: k8s / Kustomization / Helm
    manifestType:
    # manifest list
    files:
      - k8s/install.yaml
    # manifest folder
    folders:
      - kustomization
    # The manifests are dependent on what kind of Kubernetes Cluster.
    dependencies:
      # As a reference name, refer to .spec.dependencies
      - name: eks

  # Ouptputs represnt output value after launched, for 'ContainerApplication' might need leverage specific command to retrive output.
  outputs:
      # Type of output value
      # - Options:  String, string type
      #             Number, number type
      #             CDKObject, output is a object refer to a CDK construct
      #             FromCommand, output is retrieved by a command, which refer to 'defaultValueCommand'
      # Name of output
    - name:
      outputType:
      defaultValue:
      # Description is definition for output, recommend to use CloudFormation, such as AWS::EKS::Cluster,
      # AWS::EKS::Cluster.Endpoint as per convention. For those output wasn't included in CloudFormation,
      # recommend to use style 'Custom::[definition]'
      description:
      # Name of output
    - name:
      # Type of output
      outputType: FromCommand
      # Command to retrieve output
      defaultValueCommand:
      #
      description: Custom::Password

  # Notes are description list for addtional information.
  notes: []

```

## Deployment Spec

```yaml
apiVersion: mahjong.io/v1alpha1
kind: Deployment
metadata:
  name: mahjong
spec:
  template:
    # Category of Tile
    # - Options:  Network, provisioned through CDK approach.
    #             Compute, provisioned through CDK approach.
    #             ContainerProvider, provisioned through CDK approach.
    #             Storage, provisioned through CDK approach.
    #             Database, provisioned through CDK approach.
    #             Application, !!! provisioned through specific approach due to application features. Not defined yet!!!
    #             ContainerApplication, !!! provisioned through specific approach based on manifest type. !!!
    #             Analysis, provisioned through CDK approach.
    #             ML, provisioned through CDK approach.
    #
    # - Examples: vpc/ cidr / subnet / internet gateway / NAT / ...
    category:
    tiles:
      - tileReference:
        tileVersion:
        inputs:
          - name:
            #InputValue/InputValues could be used either one of them.
            inputValue:
          - name:
            inputValues:
              - ...
              - ...
        manifests:
          namespace:
  summary:
    description:
    outputs:
      - name:
        value:
   notes: []
    # Nework:
    #       # {{ vpc/ cidr / subnet / internet gateway / NAT / ... }}

    # Compute:
    #       # {{ ec2 / spot-ec2 / auto scaling group / elb / ... }}

    # ContainerProvider:
    #       # {{ eks / ecs   }}

    # Storage:
    #       # {{ EBS / EFS / CSI + EBS CSI + EFS / ...}}

    # Database:
    #       # {{ standard RDS / Aurora / Redis / ...}}

    # ContainerApplication:
    #       # {{ Istio / Argo CD / Grafana / Prometheus / Knative / Kubeflow }}
    #   - basicDevops:
    #       # {{ ArgoCD / Argo Roolouts / Flux / Grafana / Prometheus }}
    #       version: 1.0.0
    #   - basicServerless:
    #       # {{ knative }}
    #       version: 1.0.0
    #   - basicMisroservice:
    #       # {{  Istio / Argo CD / Grafana / Prometheus / Thanose }}
    #       version: 1.0.0
    #   - basicML:
    #       #{{ kubeflow }}

    # Application
    # Analysis
    # ML
    #
    #
```
