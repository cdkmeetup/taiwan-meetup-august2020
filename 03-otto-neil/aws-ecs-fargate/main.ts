import { Construct } from 'constructs';
import { App, TerraformStack ,Token ,TerraformOutput} from 'cdktf';
import { AwsProvider ,SecurityGroup ,EcsCluster ,EcsTaskDefinition ,EcsService ,Lb ,AlbTargetGroup ,AlbListener ,SecurityGroupRule ,IamRole ,IamRolePolicyAttachment ,CloudwatchLogGroup ,Route53Record ,DataAwsRoute53Zone} from './.gen/providers/aws';
import { Vpc } from './.gen/modules/terraform-aws-modules/vpc/aws';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    const healthcheckpath ='/'
    const imagename = 'gcr.io/cloudrun/hello:latest'
    // get acm arn for your account .
    const ACM = 'arn:aws:acm:${region}:${account-id}:certificate/x-x-x-x-x';
    new AwsProvider(this, 'aws', {
      region: 'ap-northeast-1'
    });

    const vpc = new Vpc(this , 'ECSVPC',{
      cidr: '10.0.0.0/16',
      name: 'ECSVPC',
      azs: ['ap-northeast-1a', 'ap-northeast-1c'],
      publicSubnets: ['10.0.101.0/24', '10.0.102.0/24'],
      enableDnsSupport: true,
      enableDnsHostnames: true,
      enableNatGateway: false
    });

    const albsg = new SecurityGroup(this ,'AlbSG',{
      name: 'ECSCDKTF-ALB',
      vpcId: vpc.vpcIdOutput,
      description:'Allow TLS inbound traffic'
    });

    const ecsTasksSG = new SecurityGroup(this ,'AlbECSSG',{
      name: 'ECSCDKTF-ECSSG',
      vpcId: vpc.vpcIdOutput,
      description:'Allow TLS inbound traffic'
    });

    new SecurityGroupRule(this ,'albsghttprule',{
      type: 'ingress',
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
      securityGroupId: `${albsg.id}`,
      dependsOn: [albsg]
    });

    new SecurityGroupRule(this ,'albsghttpsrule',{
      type: 'ingress',
      fromPort: 443,
      toPort: 443,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
      securityGroupId: `${albsg.id}`,
      dependsOn: [albsg]
    });

    new SecurityGroupRule(this ,'albsgengressrule',{
      type: 'egress',
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      cidrBlocks: ['0.0.0.0/0'],
      securityGroupId: `${albsg.id}`,
      dependsOn: [albsg]
    });

    new SecurityGroupRule(this ,'ecssgbrule',{
      type: 'ingress',
      fromPort: 8080,
      toPort: 8080,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
      securityGroupId: `${ecsTasksSG.id}`,
      dependsOn: [ecsTasksSG]
    });

    new SecurityGroupRule(this ,'ecssgengressrule',{
      type: 'egress',
      fromPort: 0,
      toPort: 0,
      protocol: '-1',
      cidrBlocks: ['0.0.0.0/0'],
      securityGroupId: `${ecsTasksSG.id}`,
      dependsOn: [ecsTasksSG]
    });

    new CloudwatchLogGroup(this , 'demoCloudwatchLogGroup',{
      name: 'demo',
    });

    const ecstaskrole = new IamRole(this , 'ecsTaskRole',{
      name: 'CDKTFecsTaskRole',
      assumeRolePolicy:
`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
 }`
    });

    const ecsTaskExecutionRole = new IamRole(this , 'ecsTaskExecutionRole',{
      name: 'CDKTFecsTaskExecutionRole',
      assumeRolePolicy:
`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
 }`
    });

    const roleattachpolicy = new IamRolePolicyAttachment(this, 'ecsTaskExecutionRoleAttachPolicy',{
      role: `${ecsTaskExecutionRole.name}`,
      policyArn: 'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      dependsOn: [ecsTaskExecutionRole]
    })

    const ecsCluster = new EcsCluster(this, 'CDKTFEcsCluster',{
      name: 'CDKTFEcsCluster'
    });

    const ecstasksdefine = new EcsTaskDefinition(this ,'CDKTFEcsTaskDefinition',{
      networkMode: 'awsvpc',
      executionRoleArn: ecsTaskExecutionRole.arn,
      taskRoleArn: ecstaskrole.arn,
      cpu: '256',
      memory: '512',
      requiresCompatibilities: ['FARGATE'],
      family: 'fargate-task-definition',
      containerDefinitions: 
`[
  {
    "essential": true,
    "name": "demo",
    "image": "${imagename}",
    "portMappings": [
      {
        "hostPort": 8080,
        "protocol": "tcp",
        "containerPort": 8080
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "demo",
        "awslogs-stream-prefix": "ecsFargate",
        "awslogs-region": "ap-northeast-1"
      }
    }
  }
]`,
      dependsOn: [ecsCluster,ecsTaskExecutionRole ,ecstaskrole]
    });
    const lb = new Lb(this, 'LB',{
      name: 'ECSLB',
      internal: false,
      loadBalancerType: 'application',
      securityGroups: [`${albsg.id}`],
      subnets: Token.asList(vpc.publicSubnetsOutput),
      enableDeletionProtection: false,
      dependsOn: [albsg]
      
    });

    const albtg = new AlbTargetGroup(this , 'AlbTargetGroup',{
      name: 'AlbTargetGroup',
      port: 80,
      protocol: 'HTTP',
      vpcId: vpc.vpcIdOutput,
      targetType: 'ip',
      healthCheck: [{
        path: `${healthcheckpath}`
      }],
      dependsOn: [lb]
    });

    new AlbListener(this, 'AlbListenerhttp',{
      loadBalancerArn: `${lb.id}`,
      port: 80,
      protocol: 'HTTP',
      dependsOn: [lb],
      defaultAction: [{
        type: 'redirect',
        redirect: [{
          port: '443',
          protocol: 'HTTPS',
          statusCode: 'HTTP_301'
        }]
      }]
    });

    new AlbListener(this, 'AlbListenerhttps',{
      loadBalancerArn: `${lb.id}`,
      dependsOn: [lb],
      port: 443,
      protocol: 'HTTPS',
      sslPolicy: 'ELBSecurityPolicy-2016-08',
      certificateArn: ACM,
      defaultAction: [{
        targetGroupArn: albtg.id,
        type: 'forward'
      }]
    });


    new EcsService(this ,'CDKTFEcsService',{
      name: 'CDKTFEcsService',
      cluster: ecsCluster.id,
      taskDefinition: ecstasksdefine.arn,
      desiredCount: 1,
      dependsOn: [lb, albsg, ecstasksdefine,ecsCluster,roleattachpolicy],
      launchType: 'FARGATE',
      networkConfiguration: [{
        securityGroups: [`${ecsTasksSG.id}`],
        subnets: Token.asList(vpc.publicSubnetsOutput),
        assignPublicIp: true
      }],
      loadBalancer: [{
        targetGroupArn: albtg.id,
        containerName: 'demo',
        containerPort: 8080
      }]
    });
    // your public zone on route53
    const myzone = new DataAwsRoute53Zone(this, 'MyDataAwsRoute53Zone',{
      name: 'example.com.',
      privateZone: false
    });

    const url = new Route53Record(this , 'CDKTFRoute53Record',{
      zoneId: `${myzone.zoneId}`,
      name: `cdktf.example.com`,
      type: 'A',
      alias: [{
        name: lb.dnsName,
        zoneId: `${lb.zoneId}`,
        evaluateTargetHealth: false
      }],
      dependsOn: [lb]
  
    });

    new TerraformOutput(this, 'CDKTFDEMOUrl',{
      value: 'https://'+ url.fqdn 
    });
  
  }
}

const app = new App();
new MyStack(app, 'aws-ecs-fargate');
app.synth();
