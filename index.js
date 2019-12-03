const core = require('@actions/core');
const shell = require(`shelljs`);
const jwt = require('jsonwebtoken');
const axios = require('axios');

function getSettingsFor(targetName, settingId) {
  const buildSettings = shell.exec(`xcodebuild -target ${targetName} -showBuildSettings`, { silent: true });
  const bundleIds =  buildSettings.split(`\n`).filter(function(item) {
    return item.includes(settingId)
  });
  if (bundleIds.length == 1) {
    const bundleId = bundleIds[0].replace(`${settingId} = `,"");
    return bundleId.replace(/\s/g, "");;
  } else {
    throw `Could not find the Bundle ID of the given target ${targetName}`;
  }
}

function getToken(issuerID, minute, privateKey, keyId) {
  const payload = { 
    exp: Math.floor(Date.now() / 1000) + (minute * 60),
    aud: "appstoreconnect-v1",
    iss: issuerID
  };
  const options = {
    algorithm: "ES256",
    header: { 
      kid: keyId
    }
  }
  return jwt.sign(payload, privateKey, options);
}

async function get(url, params, token, method = "GET") {
  const options = {
    url: url,
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params: params
  }

  const response = await axios.request(options);
  return response.data;
}

async function bumpVersion() {
  try {
    const appStoreConnectPrivateKey = core.getInput("appStoreConnectPrivateKey");
    const keyID = core.getInput("keyID");
    const issuerID = core.getInput("issuerID");
    const targetName = core.getInput("targetName");
    const bundleIdIdentifier = "PRODUCT_BUNDLE_IDENTIFIER";
    const bundleId = getSettingsFor(targetName, bundleIdIdentifier);
    const token = getToken(issuerID, 2, Buffer.from(appStoreConnectPrivateKey, "utf8"), keyID);
    const appResponse = await get("https://api.appstoreconnect.apple.com/v1/apps", { "filter[bundleId]" : bundleId }, token);
    const appId = appResponse.data[0].id;
    if (appId) {
      const builds = await get("https://api.appstoreconnect.apple.com/v1/builds", { "filter[app]": appId, limit: 1, sort: "-version" }, token);
      const currentBuildNumber = builds.data[0].attributes.version;
      if (currentBuildNumber) {
        shell.exec(`xcrun agvtool new-version -all ${currentBuildNumber}`);
        shell.exec(`xcrun agvtool bump -all`);
      } else {
        throw `Could not find the Version Number for ${appId}`;  
      }
    } else {
      throw `Could not find the App ID for ${bundleId}`;
    }
  } catch (error) {
    core.setFailed(error);
  }
}

bumpVersion();