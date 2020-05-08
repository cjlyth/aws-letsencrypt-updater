# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`LetsencryptUpdaterStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## certbot commands

Need to figure out how best to run this on startup. Thinking systemd or bashrc.
May convert this whole thing to a container instead of ec2

```

certbot certonly -d chrislyth.io -d *.chrislyth.io --dns-route53 \
    --logs-dir /mnt/efs/fs1/letsencrypt/log/ \
    --config-dir /mnt/efs/fs1/letsencrypt/config/ \
    --work-dir /mnt/efs/fs1/letsencrypt/work/ \
    -m cjlyth@gmail.com \
    --agree-tos --non-interactive \
    --server https://acme-v02.api.letsencrypt.org/directory

# certbot renew --dry-run \
    --logs-dir /mnt/efs/fs1/letsencrypt/log/ \
    --config-dir /mnt/efs/fs1/letsencrypt/config/ \
    --work-dir /mnt/efs/fs1/letsencrypt/work/ \


```