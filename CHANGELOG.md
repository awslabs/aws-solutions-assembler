# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]



## [0.13.0] - 2020-07-24
### Added
- mctl can load specification(yaml) from w3 address
- mctl can download specification of Hu/Tile from repo 


### Changed
- #12 Dice retrieve STS token from regional endpoint by default, aslo suggest using [v2Token](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_enable-regions.html)

### Fixed 
- #11 mctl exit with error code when deployment was failed 



## [0.12.4] - 2020-07-23
### Changed
- Improve performance when parsing yaml


### Fixed
- Fixed potential wrong value referenc when using empty string



## [0.12.3] - 2020-07-22
### Changed
- Using pre-built metadata of Hu & Tile for API query

### Fixed
- Fixed API to retrieve metadata of hu

## [0.12.2] - 2020-07-14
### Changed
- Upgrade kubectl to 1.16.12
- Upgrade aws-iam-authenticator to 0.5.1
- Upgrade kustomize to 3.8.0
- Upgrade Helm to 3.2.4
- Update CDK based framwork to 1.51.0
- Restruct directory of Hu with versioning

### Fixed
- Fixed retrieving metadata of Hu from local repo
- Fixed failed to override input value


## [0.12.0] - 2020-07-02
### Added
- Support multiple dependencies in deployment.
- Support parallel provision.
- New API to retrieve deployment status by session id.

### Changed
- Docker images will be released to GitHub package.
- Moved into awslabs from https://github.com/cc4i/mahjong0.
- Move initial Tiles and Hu to seperated repo - https://github.com/mahjong-contributions/mahjong-constuct 

### Fixed
- Fix typos in recent README changes.
- Update outdated unreleased diff link.

