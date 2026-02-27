#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QSocialStack } from '../lib/q-social-stack';

const app = new cdk.App();
new QSocialStack(app, 'QSocialStack', {});
