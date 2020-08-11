import { Construct } from 'constructs';
import { App, TerraformStack , TerraformOutput} from 'cdktf';
//import { AlicloudProvider  ,SlbServerGroup ,CsSwarm ,CsApplication ,SlbListenerA }  from './.gen/providers/alicloud';
import { AlicloudProvider   ,CsSwarm ,CsApplication  }  from './.gen/providers/alicloud';
class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const imagename = 'gcr.io/cloudrun/hello:latest'

    
    // need to change to your default vsw in vpc your want.
    const vswitchid = 'vsw-xxxxxxxxxxxxxx';


    new AlicloudProvider(this ,'AlibabaIAM',{
      region: 'ap-northeast-1',
    });

    const alibabaCsSwarm = new CsSwarm(this , 'alibabaCsSwarm',{
      password: '1qaZ2wsx',
      instanceType: 'ecs.t5-lc1m1.small',
      name: 'alibabaCsSwarm',
      diskCategory: 'cloud_efficiency',
      diskSize: 20,
      cidrBlock: '192.168.0.0/24',
      vswitchId: vswitchid
    });

    new CsApplication(this, 'Csapplication',{
      clusterName: `${alibabaCsSwarm.name}`,
      name: 'aspnet',
      version: '1.0',
      dependsOn: [alibabaCsSwarm],
      template: 
`
version: 2.0
services:
  aspnet:
    image: ${imagename}
    ports:
    - "80:8080"
`
    }); 
    // if you do not have ca on aliyun , you do not use this .
    //const newSlbSG = new SlbServerGroup(this , 'SlbServerGroup',{
    //  loadBalancerId: lbId,
    //  name: 'aspnet',
    //  dependsOn: [alibabaCsSwarm],
    //  servers: [{
    //    serverIds: [alibabaCsSwarm.nodes('0').id],
    //    port: 80,
    //    weight: 100
    //  }]
    //});
//
    //new SlbListenerA(this , 'SlbListener',{
    //  loadBalancerId: lbId,
    //  dependsOn: [newSlbSG],
    //  backendPort: 80,
    //  protocol: 'https',
    //  frontendPort: 443,
    //  sslCertificateId: 'sslCertificateId-on-your-aliyun-account',
    //  serverGroupId: newSlbSG.id,
    //  bandwidth: 100,
    //  healthCheck: 'off'
    //});
    
    // output node public ip .
    new TerraformOutput(this ,'node-eip',{
      value: alibabaCsSwarm.nodes('0').eip
    });
  }
}

const app = new App();
new MyStack(app, 'alibaba');
app.synth();