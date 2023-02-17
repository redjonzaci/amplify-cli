import { initJSProjectWithProfile, deleteProject, createNewProjectDir, deleteProjectDir } from 'amplify-e2e-core';
import { testSchema } from '../schema-api-directives';

describe('api directives @auth batch 7', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await createNewProjectDir('auth7');
    await initJSProjectWithProfile(projectDir, {});
  });

  afterEach(async () => {
    await deleteProject(projectDir);
    deleteProjectDir(projectDir);
  });

  it('auth fieldLevelAuth5', async () => {
    const testResult = await testSchema(projectDir, 'auth', 'fieldLevelAuth5');
    expect(testResult).toBeTruthy();
  });
});
