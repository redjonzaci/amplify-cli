import { createNewProjectDir, deleteProject, deleteProjectDir, initIosProjectWithProfile } from '@aws-amplify/amplify-e2e-core';
import { iosValidate, runPinpointConfigTest } from './notifications-pinpoint-config-util';

const envName = 'integtest';
const projectSettings = {
  envName,
  disableAmplifyAppCreation: false,
};
const frontendConfig = {
  frontend: 'ios',
};

describe('ios notifications pinpoint configuration', () => {
  let projectRoot: string;

  beforeEach(async () => {
    projectRoot = await createNewProjectDir('notifications-pinpoint');
  });

  afterEach(async () => {
    deleteProjectDir(projectRoot);
  });

  it('should add pinpoint to iOS configuration', async () => {
    await initIosProjectWithProfile(projectRoot, projectSettings);
    try {
      await runPinpointConfigTest(projectRoot, envName, frontendConfig, iosValidate);
    } finally {
      await deleteProject(projectRoot);
    }
  });
});
