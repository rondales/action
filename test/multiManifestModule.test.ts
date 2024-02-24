import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as vscode from 'vscode';
import * as fs from 'fs';

import { context } from './vscontext.mock';
import { multimanifestmodule } from '../src/multimanifestmodule';
import { authextension } from '../src/authextension';

const expect = chai.expect;
chai.use(sinonChai);

suite('multimanifest module', () => {
  let sandbox: sinon.SinonSandbox;
  let workspaceFolder = vscode.workspace.workspaceFolders[0];

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('form_manifests_payload should throw error', async () => {
    let savedErr: string;
    sandbox.stub(multimanifestmodule, 'manifestFileRead').rejects('err');
    try {
      await multimanifestmodule.form_manifests_payload('path/file', 'maven');
    } catch (err) {
      savedErr = err.name;
      return;
    }
    expect(savedErr).equals('err');
    expect.fail();
  });

  test('form_manifests_payload should return form_data in success', async () => {
    sandbox.stub(multimanifestmodule, 'manifestFileRead').resolves({
      manifest: 'manifest',
      filePath: 'path'
    });
    let form_manifests_payloadPR = await multimanifestmodule.form_manifests_payload(
      'path/file', ''
    );
    expect(form_manifests_payloadPR).to.include({ ecosystem: '' });
  });

  test('manifestFileRead should return error', async () => {
    let savedErr: string;
    sandbox.stub(fs, 'readFile').yields({ message: 'err' });
    try {
      await multimanifestmodule.manifestFileRead('path/file');
    } catch (err) {
      savedErr = err;
      return;
    }
    expect(savedErr).equals('err');
    expect.fail();
  });

  test('manifestFileRead should return data', async () => {
    let savedData: any, savedErr: string;
    sandbox.stub(fs, 'readFile').yields(null, true);
    let filePath = 'path/target/npmlist.json';
    try {
      savedData = await multimanifestmodule.manifestFileRead(filePath);
    } catch (err) {
      savedErr = err;
      return;
    }
    expect(savedData.filePath).equals('package.json');
  });

  test('triggerManifestWs should return error', async () => {
    let stubAuthorize_f8_analytics = sandbox
      .stub(authextension, 'authorize_f8_analytics')
      .rejects('err');
    let savedErr: string;
    try {
      await multimanifestmodule.triggerManifestWs(context);
    } catch (err) {
      savedErr = err;
      return;
    }
    expect(savedErr).equals('Unable to authenticate.');
    expect.fail();
    expect(stubAuthorize_f8_analytics).callCount(1);
  });

  test('triggerManifestWs should should resolve to true', async () => {
    let stubAuthorize_f8_analytics = sandbox
      .stub(authextension, 'authorize_f8_analytics')
      .resolves(true);
    let promiseTriggerManifestWs = await multimanifestmodule.triggerManifestWs(
      context
    );
    expect(promiseTriggerManifestWs).equals(true);
    expect(stubAuthorize_f8_analytics).callCount(1);
  });

  test('triggerFullStackAnalyses should call findFiles once', async () => {
    let findFilesSpy = sandbox.spy(vscode.workspace, 'findFiles');
    try {
      await multimanifestmodule.triggerFullStackAnalyses(
        context,
        workspaceFolder
      );
    } catch (err) {
      return;
    }
    expect(findFilesSpy).callCount(1);
  });

  test('dependencyAnalyticsReportFlow should call triggerFullStackAnalyse once', async () => {
    let triggerFullStackAnalyseSpy = sandbox.spy(
      multimanifestmodule,
      'triggerFullStackAnalyses'
    );
    try {
      await multimanifestmodule.dependencyAnalyticsReportFlow(context);
    } catch (err) {
      return;
    }
    expect(triggerFullStackAnalyseSpy).callCount(1);
  });
});
