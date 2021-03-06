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

