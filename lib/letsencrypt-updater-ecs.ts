import * as cdk from '@aws-cdk/core';
import * as efs from '@aws-cdk/aws-efs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

import { Schedule } from "@aws-cdk/aws-applicationautoscaling";

import path = require('path');
import { Duration } from '@aws-cdk/core';
import { BlockDeviceVolume } from '@aws-cdk/aws-ec2';

export class LetsencryptUpdaterEcsStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const vpc = new ec2.Vpc(this, "LetsEncryptUpdateEcsVpc", {
            maxAzs: 3
        });
        const fileSystem = new efs.FileSystem(this, 'LetsEncryptUpdateFilesystem', {
            vpc,
            encrypted: true,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
            throughputMode: efs.ThroughputMode.BURSTING,
        });
        const cluster = new ecs.Cluster(this, "LetsEncryptUpdateEcsCluster", {
            vpc: vpc
        });

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
        /*
        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
            executionRole: role,
        });
        taskDefinition.addContainer('CreateCertContainer', {
            image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, 'certbot-image')),
            command: [
                "certonly", 
                "-d", "chrislyth.io", 
                "-d", "*.chrislyth.io", 
                "--agree-tos", "--non-interactive", "--dns-route53", 
                "-m", "cjlyth@gmail.com", 
                "--server", "https://acme-v02.api.letsencrypt.org/directory"],
            memoryLimitMiB: 256
        });
        
        const task = new ecs_patterns.ScheduledFargateTask(this, "LetsEncryptUpdateEcsFargateTask", {
            cluster: cluster,
            scheduledFargateTaskDefinitionOptions: { taskDefinition },
            schedule: Schedule.rate(Duration.minutes(1))
        });
        // */

        new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
            cluster,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            },
        });

    }
}