import { App } from 'aws-cdk-lib';
import {
  $TSContext, $TSObject, stateManager,
} from 'amplify-cli-core';
import { printer } from 'amplify-prompts';
import { category } from '../constants';
import { getTemplateMappings } from '../provider-controllers';
import { DeviceLocationTrackingStack } from '../service-stacks/deviceLocationTrackingStack';
import { parametersFileName, provider, ServiceName } from './constants';
import { DeviceLocationTrackingParameters } from './deviceLocationTrackingParams';
import {
  generateTemplateFile,
  getAuthResourceName,
  getResourceDependencies,
  readResourceMetaParameters,
  ResourceDependsOn,
  updateDefaultResource,
  updateParametersFile,
} from './resourceUtils';

/**
 * createDeviceLocationTrackingResource
 */
export const createDeviceLocationTrackingResource = async (
  context: $TSContext,
  parameters: DeviceLocationTrackingParameters,
): Promise<void> => {
  const authResourceName = await getAuthResourceName(context);
  // generate CFN files
  const templateMappings = await getTemplateMappings(context);

  const mapStack = new DeviceLocationTrackingStack(
    new App(),
    'DeviceLocationTrackingStack',
    { ...parameters, ...templateMappings, authResourceName },
  );
  generateTemplateFile(mapStack, parameters.name);
  saveCFNParameters(parameters);
  stateManager.setResourceInputsJson(
    undefined,
    category,
    parameters.name,
    {
      groupPermissions: parameters.groupPermissions,
      roleAndGroupPermissionsMap: parameters.roleAndGroupPermissionsMap,
      positionFiltering: parameters.positionFiltering,
      linkedGeofenceCollections: parameters.linkedGeofenceCollections,
    },
  );

  const deviceLocationTrackingMetaParameters = constructTrackingMetaParameters(parameters, authResourceName);
  // update default
  if (parameters.isDefault) {
    // remove the previous default
    await updateDefaultResource(context, ServiceName.DeviceLocationTracking);
  }

  context.amplify.updateamplifyMetaAfterResourceAdd(category, parameters.name, deviceLocationTrackingMetaParameters);

  printer.success('Created device location tracking resources');
};

/**
 * modify amplify device tracking resource
 */
export const modifyDeviceLocationTrackingResource = async (
  context: $TSContext,
  parameters: DeviceLocationTrackingParameters,
): Promise<void> => {
  const authResourceName = await getAuthResourceName(context);
  // generate CFN files
  const templateMappings = await getTemplateMappings(context);
  const deviceLocationTrackingStack = new DeviceLocationTrackingStack(
    new App(),
    'DeviceTrackingStack',
    { ...parameters, ...templateMappings, authResourceName },
  );
  generateTemplateFile(deviceLocationTrackingStack, parameters.name);
  saveCFNParameters(parameters);
  stateManager.setResourceInputsJson(
    undefined,
    category,
    parameters.name,
    {
      groupPermissions: parameters.groupPermissions,
      roleAndGroupPermissionsMap: parameters.roleAndGroupPermissionsMap,
      positionFiltering: parameters.positionFiltering,
      linkedGeofenceCollections: parameters.linkedGeofenceCollections,
    },
  );

  // update the default Device Tracker
  if (parameters.isDefault) {
    await updateDefaultResource(context, ServiceName.DeviceLocationTracking, parameters.name);
  }

  const deviceTrackerMetaParameters = constructTrackingMetaParameters(parameters, authResourceName);

  const paramsToUpdate = ['accessType', 'dependsOn'] as const;
  paramsToUpdate.forEach(param => {
    context.amplify.updateamplifyMetaAfterResourceUpdate(category, parameters.name, param, deviceTrackerMetaParameters[param]);
    context.amplify.updateBackendConfigAfterResourceUpdate(category, parameters.name, param, deviceTrackerMetaParameters[param]);
  });
};

const saveCFNParameters = (
  parameters: Pick<DeviceLocationTrackingParameters, 'name' | 'dataProvider' | 'isDefault' | 'positionFiltering' | 'linkedGeofenceCollections'>,
): void => {
  const params = {
    authRoleName: {
      Ref: 'AuthRoleName',
    },
    unauthRoleName: {
      Ref: 'UnauthRoleName',
    },
    trackerName: parameters.name,
    positionFiltering: parameters.positionFiltering,
    isDefault: parameters.isDefault,
    pricingPlan: undefined,
    linkedGeofenceCollections: parameters.linkedGeofenceCollections,
  };

  updateParametersFile(params, parameters.name, parametersFileName);
};

/**
 * Gives the Tracking resource configurations to be stored in Amplify Meta file
 */
export const constructTrackingMetaParameters = (
  params: DeviceLocationTrackingParameters,
  authResourceName: string,
): DeviceLocationTrackingMetaParameters => {
  const dependsOnResources = getResourceDependencies(params.groupPermissions, authResourceName);

  const result: DeviceLocationTrackingMetaParameters = {
    isDefault: params.isDefault,
    providerPlugin: provider,
    service: ServiceName.DeviceLocationTracking,
    positionFiltering: params.positionFiltering,
    linkedGeofenceCollections: params.linkedGeofenceCollections,
    accessType: params.accessType,
    dependsOn: dependsOnResources,
  };
  return result;
};

/**
 * The Meta information stored for a Device Location Tracking resource
 */
export type DeviceLocationTrackingMetaParameters = Pick<DeviceLocationTrackingParameters, 'isDefault' | 'accessType' | 'positionFiltering' | 'linkedGeofenceCollections'> & {
  providerPlugin: string;
  service: string;
  dependsOn: ResourceDependsOn[];
};

/**
 * getCurrentTrackingParameters
 */
export const getCurrentTrackingParameters = async (trackerName: string): Promise<Partial<DeviceLocationTrackingParameters>> => {
  const currentTrackingMetaParameters = (
    await readResourceMetaParameters(ServiceName.DeviceLocationTracking, trackerName)
  ) as DeviceLocationTrackingMetaParameters;
  const currentTrackingParameters = stateManager.getResourceInputsJson(
    undefined, category, trackerName, { default: {}, throwIfNotExist: false },
  );
  return {
    accessType: currentTrackingMetaParameters.accessType,
    isDefault: currentTrackingMetaParameters.isDefault,
    positionFiltering: currentTrackingMetaParameters.positionFiltering,
    linkedGeofenceCollections: currentTrackingMetaParameters.linkedGeofenceCollections,
    groupPermissions: currentTrackingParameters?.groupPermissions || [],
    roleAndGroupPermissionsMap: currentTrackingParameters?.roleAndGroupPermissionsMap || {},
  };
};

/**
 * getTrackingIamPolicies
 */
export const getTrackingIamPolicies = (resourceName: string, crudOptions: string[]): { policy: $TSObject[]; attributes: string[] } => {
  const policy = [];
  const actions = new Set<string>();

  crudOptions.forEach(crudOption => {
    switch (crudOption) {
      case 'create':
        actions.add('geo:CreateTracker');
        break;
      case 'read':
        actions.add('geo:GetDevicePosition');
        actions.add('geo:GetDevicePositionHistory');
        break;
      case 'delete':
        actions.add('geo:DeleteTracker');
        break;
      default:
        break;
    }
  });

  const trackingPolicy = {
    Effect: 'Allow',
    Action: Array.from(actions),
    Resource: [
      {
        'Fn::Join': [
          '',
          [
            'arn:aws:geo:',
            { Ref: 'AWS::Region' },
            ':',
            { Ref: 'AWS::AccountId' },
            ':tracking/',
            {
              Ref: `${category}${resourceName}Name`,
            },
          ],
        ],
      },
    ],
    Condition: {
      deviceContains: ['${cognito-identity.amazonaws.com:sub}'],
    },
  };
  policy.push(trackingPolicy);
  const attributes = ['Name'];

  return { policy, attributes };
};
