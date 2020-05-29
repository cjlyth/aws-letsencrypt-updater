# Let's Encrypt Updater

This is a project for me to explore the AWS CDK and patterns to manage SSL certificates from [Let's Encrypt](https://letsencrypt.org/). 
You should not take anything in this repository as best practice. 
This is purely a tool for self directed leaning.

I run a lot of devices and services that have self-signed SSL certificates. 
Since these certificates are not trusted by by browser, I have to tell my system to trust the certificate or ignore invalid certificates. 

You should not trust 3rd party self-signed certificates since you do not know the security practices that were used to generate the certificate.
That certificate could be reused on all devices or services from a manufacturer. 
This opens an opportunity for someone with malicious intent.

Ignoring invalid certificates is not widely supported, and it usually has to be added for each request or session. This can get annoying and leads to trusting the certificate. 

I could use [AWS Certificate Manager (ACM)](https://aws.amazon.com/certificate-manager/). 
To use ACM with the on-premisis services and devices, you have to use a private certificate authority (CA) and export the certificates. 
To use this transparently, I would have to configure every host or application to trust the private CA. 
Unfortunately some applications don't support custom CAs. 

To avoid these problems, I like to use Let's Encrypt's free SSL certificates.
The certificates can be installed anywhere you need them and they are [compatible with my choice of platforms](https://letsencrypt.org/docs/certificate-compatibility/). 


## Stack in this project

This project assumes you already have a hosted zone with the appropriate records DNS challenge records.


### LetsencryptUpdaterEcsStack
```
cdk deploy LetsencryptUpdaterEcsStack
```

### LetsencryptUpdaterStack

This stack creates an ec2 instance with userdata that installs certbot and prepares to run the commands in the [section below](#Manual_certificate_management).

_By default this stack expects an SSH key named 'cjlyth-aws'_

#### TODO

- [ ] Create a stopped instance that has userdata to run the certbot create command
- [ ] Create a stopped instance that has userdata to run the certbot renew command
- [ ] Make the SSH key name a parameter 

#### Usage

```
cdk deploy LetsencryptUpdaterStack

```


## Manual certificate management

The EC2 update method installs all of the tooling to run the following commands in the userdata. 

The ECS version uses a docker image that has certbot installed. 

### Request a new certificate

```
certbot certonly -d chrislyth.io -d *.chrislyth.io --dns-route53 \
    --logs-dir /mnt/efs/fs1/letsencrypt/log/ \
    --config-dir /mnt/efs/fs1/letsencrypt/config/ \
    --work-dir /mnt/efs/fs1/letsencrypt/work/ \
    -m cjlyth@gmail.com \
    --agree-tos --non-interactive \
    --server https://acme-v02.api.letsencrypt.org/directory
```

### Renew a new certificate

```
# certbot renew --dry-run \
    --logs-dir /mnt/efs/fs1/letsencrypt/log/ \
    --config-dir /mnt/efs/fs1/letsencrypt/config/ \
    --work-dir /mnt/efs/fs1/letsencrypt/work/ 
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

