import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AppService  ,AppServicePlan ,AzurermProvider ,ResourceGroup } from './.gen/providers/azurerm';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    const imagename = 'gcr.io/cloudrun/hello:latest'


    new AzurermProvider(this, 'azureFeature',{
      features: [{}]
    });

    const rg = new ResourceGroup(this, 'cdktf-rg',{
      name: 'CDKTFdemo2020',
      location : 'westeurope'
    });

    const asp = new AppServicePlan(this, 'cdktf-asp',{
      kind: 'Linux',
      reserved: true,
      resourceGroupName: rg.name,
      location: rg.location,
      name: 'DockerDemoCDKTF',
      //sku: [{'size': 'F1','tier': 'Free'}], (need to this issue solve https://github.com/hashicorp/terraform-cdk/issues/261 )
      sku: [{'size': 'S1','tier': 'Standard'}],
      dependsOn: [rg],
    });

    const appsvc = new AppService(this, 'docker-cdktf',{
      name: 'cdktfdemoneil2020',
      appServicePlanId: `${asp.id}`,
      location: rg.location,
      resourceGroupName: rg.name,
      clientAffinityEnabled: false,
      httpsOnly: true,
      dependsOn: [asp],
      siteConfig: [{
        linuxFxVersion: `DOCKER|${imagename}`,
        //use32BitWorkerProcess: true  // (need to this issue solve https://github.com/hashicorp/terraform-cdk/issues/261 )
      }],
      });

      new TerraformOutput(this, 'appweburl', {
        value: `https://${appsvc.name}.azurewebsites.net`
      });

    }
}

const app = new App();
new MyStack(app, 'azure-app-service-docker');


app.synth();