import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

import config from '../helpers/config.js';
import selectors from '../helpers/selectors.js';
import createNightmare from '../helpers/nightmare';
import insertFixtures from '../helpers/insertFixtures';

const customConfig = { threshold: 0 };
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  noColors: true,
  failureThreshold: '0.01',
  failureThresholdType: 'percent'
});

expect.extend({ toMatchImageSnapshot });

const nightmare = createNightmare();

describe('visual regression', () => {
  beforeAll(async () => insertFixtures());
  afterAll(async () => nightmare.end());

  it('login', async () => {
    await nightmare
    .goto(config.url)
    .waitToClick(selectors.navigation.loginNavButton)
    .wait('#username')
    .waitProgressBarToFinish()
    .screenshot()
    .then((screenshotBuffer) => {
      expect(screenshotBuffer).toMatchImageSnapshot();
    });
  });

  it('library', async () => {
    await nightmare
    .goto(config.url)
    .waitProgressBarToFinish()
    .screenshot()
    .then((screenshotBuffer) => {
      expect(screenshotBuffer).toMatchImageSnapshot();
    });
  });

  it('uploads', async () => {
    await nightmare
    .login('admin', 'admin')
    .goToUploads()
    .waitProgressBarToFinish()
    .screenshot()
    .then((screenshotBuffer) => {
      expect(screenshotBuffer).toMatchImageSnapshot();
    });
  });

  it('settings', async () => {
    await nightmare
    .waitToClick(selectors.navigation.settingsNavButton)
    .wait(selectors.settingsView.settingsHeader)
    .waitProgressBarToFinish()
    .screenshot()
    .then((screenshotBuffer) => {
      expect(screenshotBuffer).toMatchImageSnapshot();
    });
  });
});
