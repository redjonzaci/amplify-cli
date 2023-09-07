//
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License").
// You may not use this file except in compliance with the License.
// A copy of the License is located at
//
// http://aws.amazon.com/apache2.0
//
// or in the "license" file accompanying this file. This file is distributed
// on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing
// permissions and limitations under the License.
//

// ############################################################################
// Auto-generated file using `build` NPM script. Do not edit this file manually
// ############################################################################

const execa = require('execa');
const path = require('path');
const { pathManager } = require('@aws-amplify/amplify-cli-core');

const BINARY_PATH = 'resources/amplify-xcode';
const PACKAGE_NAME = '@aws-amplify/amplify-frontend-ios';
const amplifyXcodePath = () => path.join(pathManager.getAmplifyPackageLibDirPath(PACKAGE_NAME), BINARY_PATH);

/**
 * Import Amplify configuration files
 * @param {Object} params
 * @param {String} params.path - Project base path
 */
async function importConfig(params) {
  const command = amplifyXcodePath();
  const args = ['import-config'];
  if (params['path']) {
    args.push(`--path=${params['path']}`);
  }
  await execa(command, args, { stdout: 'inherit' });
}

/**
 * Import Amplify models
 * @param {Object} params
 * @param {String} params.path - Project base path
 */
async function importModels(params) {
  const command = amplifyXcodePath();
  const args = ['import-models'];
  if (params['path']) {
    args.push(`--path=${params['path']}`);
  }
  await execa(command, args, { stdout: 'inherit' });
}

/**
 * Generates a JSON description of the CLI and its commands
 * @param {Object} params
 * @param {String} params.output-path - Path to save the output of generated schema file
 */
async function generateSchema(params) {
  const command = amplifyXcodePath();
  const args = ['generate-schema'];
  if (params['output-path']) {
    args.push(`--output-path=${params['output-path']}`);
  }
  await execa(command, args, { stdout: 'inherit' });
}

module.exports = {
  importConfig,
  importModels,
  generateSchema,
};
