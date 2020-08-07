import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import lambda = require('@aws-cdk/aws-lambda');
import ec2 = require('@aws-cdk/aws-ec2');
import sns = require('@aws-cdk/aws-sns');
import sns_sub = require('@aws-cdk/aws-sns-subscriptions');
import actions = require('@aws-cdk/aws-cloudwatch-actions');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');

export class CloudwatchAlarmDemoStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

    if (SLACK_WEBHOOK_URL) {
      console.log('Get SLACK_WEBHOOK_URL success!');
    } else {
      throw new Error('Get SLACK_WEBHOOK_URL fail. Please export SLACK_WEBHOOK_URL first');
    }

    const vpc = new ec2.Vpc(this, 'VPC');

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true
    });

    lb.addListener('Listener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.fixedResponse(404),
    });

    const fn = new lambda.Function(this, 'alarm-to-slack', {
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("./asset/lambda"),
      environment: {
        SLACK_WEBHOOK_URL,
      }
    });

    const alarm = new cloudwatch.Alarm(this, 'alarm-alb-HTTPCode_ELB_4XX_Count', {
      alarmName: 'ALB-4XX-Alarm',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApplicationELB',
        metricName: 'HTTPCode_ELB_4XX_Count',
        dimensions: { LoadBalancer: lb.loadBalancerFullName },
        statistic: 'Sum',
      }),
      threshold: 1,
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      alarmDescription: '4XX totaled more than 1 time in 1 minute',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    const topic = new sns.Topic(this, 'alarm-topic');
    topic.addSubscription(new sns_sub.LambdaSubscription(fn));

    alarm.addAlarmAction(new actions.SnsAction(topic));

    new cdk.CfnOutput(this, 'alb-host', {
      value: "http://" + lb.loadBalancerDnsName
    });

  }
}
