import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { CloudRunService, GoogleProvider, DataGoogleIamPolicy, CloudRunServiceIamPolicy } from './.gen/providers/google';
import * as path from 'path';
import * as fs from 'fs';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    const imagename = 'gcr.io/cloudrun/hello:latest'


    const local = 'asia-east1' //region -> taiwan .
    const projectId = '${google-project-id}'
    new GoogleProvider(this, 'GoogleAuth', {
      region: local,
      zone: local+'-c',
      project: projectId,
      credentials: fs.readFileSync(path.join(process.cwd(), 'google.json')).toString()
    });
    // define cloud run service .
    // port default on 8080 .
    const cloudrunsvcapp = new CloudRunService(this, 'GcpCDKCloudrunsvc',{
      location: local,
      name: 'gcpcdktfcloudrunsvc2020',
      template:[{
        spec:[{
          containers: [{
            image: imagename
          }],
        }]
      }]
    });
    // any one can access application .
    const policy_data = new DataGoogleIamPolicy(this, 'datanoauth',{
      binding:[{
        role: 'roles/run.invoker',
        members:['allUsers']
      }]
    });

    new CloudRunServiceIamPolicy(this, 'runsvciampolicy',{
      location: local,
      project: cloudrunsvcapp.project,
      service: cloudrunsvcapp.name,
      policyData: policy_data.policyData
    });
    // output application url .
    new TerraformOutput(this, 'cdktfcloudrunUrl',{
      value: '${'+cloudrunsvcapp.fqn +'.status[0].url}',
    });

    new TerraformOutput(this, 'cdktfcloudrunUrlN',{
      value: cloudrunsvcapp.status('0').url,
    });

  }
}

const app = new App();
new MyStack(app, 'gcp-cloud-run');
app.synth();
