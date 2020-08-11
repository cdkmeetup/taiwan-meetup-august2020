# Example for AWS based on Typescript


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

Generate Terraform configuration

```bash
cdktf synth
```

The above command will create a folder called `cdktf.out` that contains all Terraform JSON configuration that was generated.

See changes `cdktf diff` and deploy via `cdktf deploy`.

When you're done run `cdktf destroy`.

You need 
- `aws account` 
- `aws configure`
- `get ACM arn for your account`
