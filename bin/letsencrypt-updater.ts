#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { LetsencryptUpdaterStack } from '../lib/letsencrypt-updater-stack';

const app = new cdk.App();
new LetsencryptUpdaterStack(app, 'LetsencryptUpdaterStack');
