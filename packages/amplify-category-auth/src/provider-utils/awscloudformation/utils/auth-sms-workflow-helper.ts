import { $TSContext, stateManager } from '@aws-amplify/amplify-cli-core';
import { AuthInputState } from '../auth-inputs-manager/auth-input-state';
import { CognitoConfiguration } from '../service-walkthrough-types/awsCognito-user-input-types';
import { ServiceQuestionHeadlessResult } from '../service-walkthrough-types/cognito-user-input-types';
import { getProviderPlugin } from './get-provider-plugin';

export type UserPoolMessageConfiguration = {
  mfaConfiguration?: string;
  mfaTypes?: string[];
  usernameAttributes?: string[];
};

export const doesConfigurationIncludeSMS = (request: CognitoConfiguration | ServiceQuestionHeadlessResult): boolean => {
  if ((request.mfaConfiguration === 'OPTIONAL' || request.mfaConfiguration === 'ON') && request.mfaTypes?.includes('SMS Text Message')) {
    return true;
  }

  return (
    request.usernameAttributes?.some((str) =>
      str
        ?.split(',')
        .map((str) => str.trim())
        .includes('phone_number'),
    ) || false
  );
};

async function loadResourceParametersLegacyCode(authResourceName: string): Promise<UserPoolMessageConfiguration> {
  const legacyParameters = await stateManager.getResourceParametersJson(undefined, 'auth', authResourceName);
  const userPoolMessageConfig: UserPoolMessageConfiguration = {
    mfaConfiguration: legacyParameters.mfaConfiguration,
    mfaTypes: legacyParameters.mfaTypes,
    usernameAttributes: legacyParameters.usernameAttributes,
  };
  return userPoolMessageConfig;
}
export const loadResourceParameters = async (context: $TSContext, authResourceName: string): Promise<UserPoolMessageConfiguration> => {
  const cliState = new AuthInputState(context, authResourceName);
  let userPoolMessageConfig;
  try {
    userPoolMessageConfig = (await cliState.loadResourceParameters(context, cliState.getCLIInputPayload())) as UserPoolMessageConfiguration;
  } catch (error) {
    //Generated with legacy code - needs migration
    userPoolMessageConfig = await loadResourceParametersLegacyCode(authResourceName);
  }
  return userPoolMessageConfig;
};

export const loadImportedAuthParameters = async (context: $TSContext, userPoolName: string): Promise<UserPoolMessageConfiguration> => {
  const providerPlugin = getProviderPlugin(context);
  const cognitoUserPoolService = await providerPlugin.createCognitoUserPoolService(context);
  const userPoolDetails = await cognitoUserPoolService.getUserPoolDetails(userPoolName);
  const mfaConfig = await cognitoUserPoolService.getUserPoolMfaConfig(userPoolName);
  return {
    mfaConfiguration: mfaConfig.MfaConfiguration,
    usernameAttributes: userPoolDetails.UsernameAttributes,
    mfaTypes: mfaConfig.SmsMfaConfiguration ? ['SMS Text Message'] : [],
  };
};
