#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LetsencryptUpdaterStack } from '../lib/letsencrypt-updater-stack';
import { LetsencryptUpdaterEcsStack } from '../lib/letsencrypt-updater-ecs';
const envUSWest = { region: 'us-west-2' };

const app = new cdk.App();
new LetsencryptUpdaterStack(app, 'LetsencryptUpdaterStack', { env: envUSWest });
new LetsencryptUpdaterEcsStack(app, 'LetsencryptUpdaterEcsStack', { env: envUSWest });