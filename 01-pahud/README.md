Read this doc in Hackmd: https://hackmd.io/@pahud/taiwan-cdk-meetup-2020aug-pahud

# CDK Recent Updates 

![](https://i.imgur.com/dlcF5UE.png)


```typescript=
const deployment = new kplus.Deployment(this, 'MyApp', {
  spec: {
    replicas: 3,
    podSpecTemplate: {
      containers: [new kplus.Container({
        image: 'node',
        port: 9000
      })],
    },
  },
});

// this will internally create a service
deployment.expose({port: 8000});
```
- no `selector`
- no `ports`(jsut `expose` it)

will generate

```yaml=
kind: Deployment
apiVersion: apps/v1
spec:
  replicas: 3
  selector:
    matchLabels:
      cdk8s.deployment: MyAppC6A88652
  template:
    metadata:
      labels:
        cdk8s.deployment: MyAppC6A88652
    spec: <pod-spec-ommitted-for-brevity>
---
kind: Service
apiVersion: v1
spec:
  type: ClusterIP
  ports:
    - port: 8000
      targetPort: 9000 # this is the port exposed by container.
  selector:
    cdk8s.deployment: MyAppC6A88652
```

ref: https://aws.amazon.com/tw/blogs/containers/introducing-cdk8s-intent-driven-apis-for-kubernetes-objects/


## Construct Catalog

![](https://i.imgur.com/73igusn.png)

![](https://i.imgur.com/58E2tAb.png)


## Lambda with EFS support

{%youtube kZhgMHcEuUw %}


## CDK Patterns - Attach a FileSystem to your AWS Lambda Function

![](https://i.imgur.com/LVqCoXl.png)


## AWS Taipei Summit Speech

{%youtube xEOaHo-v9gQ %}


## zxkane/cdk-collections

![](https://i.imgur.com/CZKODYj.png)

https://github.com/zxkane/cdk-collections


![](https://i.imgur.com/LxNGygZ.png)
https://www.twitch.tv/videos/673830072?t=00h13m17s

## Terraform CDK
_june 16_

![](https://i.imgur.com/BBtb2yU.png)


![](https://i.imgur.com/T3Ztmig.png)


https://github.com/hashicorp/terraform-cdk/

![](https://i.imgur.com/ISu48wD.png)


## CDK Pipelines

![](https://i.imgur.com/wVWZACE.png)


![](https://i.imgur.com/MLQ9zgY.png)

![](https://i.imgur.com/fKhbuac.png)


{%youtube KBnJeV-ZeA0 %}


## Global CDK Day

![](https://i.imgur.com/5vgHGLC.png)


## Contribute to AWS CDK

{%youtube QdGRRJs1iyU %}

{%youtube OXQSSibrt-A %}

David Sung and Joel Zhong have created their PRs

## Serverless LAMP with AWS CDK

![](https://i.imgur.com/Vhy9kl4.png)

![](https://i.imgur.com/ADHRqaa.png)


workshop筆記網址： https://hackmd.io/@pahud/aws-serverless-lamp-taipei-2020

1. **Introducing the new Serverless LAMP stack** - https://amzn.to/2Ck7f36
2. **Introducing the serverless LAMP stack – part 2 relational databases**  - https://amzn.to/2ClQwMU
3. **The Serverless LAMP stack part 3: Replacing the web server** - https://amzn.to/2PGLHAH
4. **The serverless LAMP stack part 4: Building a serverless Laravel application** - https://amzn.to/3apYIIF
5. (準備發布中) **Introducing the New CDK Construct Library for Serverless LAMP**



## Taiwan CDK Meetup on CDKWeekly

![](https://i.imgur.com/jafk7Sm.png)





