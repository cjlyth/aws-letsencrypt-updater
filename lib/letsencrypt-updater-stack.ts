import * as cdk from '@aws-cdk/core';
import * as efs from '@aws-cdk/aws-efs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

import { Instance, InstanceType, SubnetType, InstanceClass, InstanceSize } from '@aws-cdk/aws-ec2';

export class LetsencryptUpdaterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'LetsEncryptUpdateEc2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),   // required
    });
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['route53:ListHostedZones', 'route53:GetChange'],
    }));
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['arn:aws:route53:::hostedzone/Z06651931F5GDL32BK028'],
      actions: ['route53:ChangeResourceRecordSets'],
    }));


    const vpc = new ec2.Vpc(this, 'LetsEncryptUpdate');
    const fileSystem = new efs.FileSystem(this, 'LetsEncryptUpdateFilesystem', {
      vpc,
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
    });

    const linux = new ec2.GenericLinuxImage({
      'us-west-2': 'ami-003634241a8fcdec0',
    });

    const securityGroup = new ec2.SecurityGroup(this, 'LetsEncryptUpdateSecurityGroup', {
      vpc,
      description: 'Allow ssh and httpd access to ec2 instances',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from the world');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow http access from the world');

    //*
    const inst = new Instance(this, 'LetsEncryptUpdateInstance', {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: linux,
      vpc,
      securityGroup,
      keyName: 'cjlyth-aws',
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      role
    });
    
    fileSystem.connections.allowDefaultPortFrom(inst);

    inst.userData.addCommands(
      "apt-get -y update",
      "apt-get -y upgrade",
      "apt-get -y install amazon-efs-utils",
      "apt-get -y install nfs-common",
      "file_system_id_1=" + fileSystem.fileSystemId,
      "efs_mount_point_1=/mnt/efs/fs1",
      "mkdir -p \"${efs_mount_point_1}\"",
      "test -f \"/sbin/mount.efs\" && echo \"${file_system_id_1}:/ ${efs_mount_point_1} efs defaults,_netdev\" >> /etc/fstab || " +
      "echo \"${file_system_id_1}.efs." + cdk.Stack.of(this).region + ".amazonaws.com:/ ${efs_mount_point_1} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0\" >> /etc/fstab",
      "mount -a -t efs,nfs4 defaults",
      "apt-get -y install software-properties-common",
      "add-apt-repository -y ppa:certbot/certbot",
      "apt-get update",
      "apt-get -y install certbot",
      "apt-get -y install python3-certbot-dns-route53",
      "mkdir -p /mnt/efs/fs1/letsencrypt/{log,config,work}");
      // */
  }
}
