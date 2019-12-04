# Version bumper for iOS projects

This action will check the App Store Connect based on the provided inputs and bumps the bundle version number of the already checked out xcode project.
Apple Generic should be set for the Versioning System build setting.

**Please use secrets when appropriate!**

[How to add a secrets?](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)

## Inputs

### `appStoreConnectPrivateKey`

**Required** App Store Connect private key with header and footer


### `keyID`

**Required** App Store Connect private key identifier


### `issuerID`

**Required** App Store Connect issuer identifier


### `targetName`

**Required** Target name to identify the application


## Example usage

```yaml
- name: Build number bump
  uses: ngeri/version-bump@v1.0.2
  with:
    appStoreConnectPrivateKey: ${{ secrets.appStoreConnectPrivateKey }}
    keyID: ${{ env.keyID }}
    issuerID: ${{ env.issuerID }}
    targetName: ${{ env.targetName }}
```
