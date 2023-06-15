import {
  DescribeIdentityProviderResponse,
  GetUserPoolMfaConfigResponse,
  IdentityProviderType,
  UserPoolDescriptionType,
  UserPoolType,
  UserPoolClientType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';

export interface ICognitoUserPoolService {
  listUserPools(): Promise<UserPoolDescriptionType[]>;
  getUserPoolDetails(userPoolId: string): Promise<UserPoolType>;
  listUserPoolClients(userPoolId: string): Promise<UserPoolClientType[]>;
  listUserPoolIdentityProviders(userPoolId: string): Promise<IdentityProviderType[]>;
  getUserPoolIdentityProviderDetails(userPoolId: string, providerName: string): Promise<DescribeIdentityProviderResponse>;
  getUserPoolMfaConfig(userPoolId: string): Promise<GetUserPoolMfaConfigResponse>;
}
