# Example for Google Cloud based on Typescript

This resembles the example for the Google Cloud at [Hashicorp Learn](https://learn.hashicorp.com/terraform/gcp/build)

## Usage

Install project dependencies

```shell
yarn install
```

Generate CDK for Terraform constructs for Terraform provides and modules used in the project. you can see config in `cdktf.json`

```bash
cdktf get
```

You can now edit the `main.ts` file if you want to modify any code.

Make sure to create your credential file `google.json` to make this example usable.

you can see [this page ](https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=zh-tw#iam-service-account-keys-list-gcloud)

Generate Terraform configuration

```bash
cdktf synth
```

The above command will create a folder called `cdktf.out` that contains all Terraform JSON configuration that was generated.

See changes `cdktf diff` and deploy via `cdktf deploy`.

When you're done run `cdktf destroy`.

You need 
- `GCP project ID`
- `google.json` store your `credentials`
