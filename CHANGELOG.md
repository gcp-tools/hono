# Changelog

## [1.20.0](https://github.com/gcp-tools/hono/compare/v1.19.0...v1.20.0) (2025-12-12)

### Features

* data corruption error ([6beb192](https://github.com/gcp-tools/hono/commit/6beb192d203e7330e44af75424efd81ccd8cfdaf))

## [1.19.0](https://github.com/gcp-tools/hono/compare/v1.18.1...v1.19.0) (2025-12-12)

### Features

* checks for conflict errors ([10151c1](https://github.com/gcp-tools/hono/commit/10151c1f22d308e74635a83b8d1194f3a66a3cbe))

## [1.18.1](https://github.com/gcp-tools/hono/compare/v1.18.0...v1.18.1) (2025-12-11)

### Bug Fixes

* correct roles type ([df5746f](https://github.com/gcp-tools/hono/commit/df5746f90cebbabd9f66c252136aca3e8b1b3a43))

## [1.18.0](https://github.com/gcp-tools/hono/compare/v1.17.0...v1.18.0) (2025-12-11)

### Features

* change organisationType to accept array of strings in requireOrgAndRole ([c7340f8](https://github.com/gcp-tools/hono/commit/c7340f8fe09003b35223c3f33e7dffb5913a1d94))

## [1.17.0](https://github.com/gcp-tools/hono/compare/v1.16.0...v1.17.0) (2025-12-11)

### Features

* add requireRole and rename requires to requireOrgAndRole ([436a75b](https://github.com/gcp-tools/hono/commit/436a75b7812d38aa6dff28aa991658ec08484065))

## [1.16.0](https://github.com/gcp-tools/hono/compare/v1.15.0...v1.16.0) (2025-12-11)

### ⚠ BREAKING CHANGES

* Multiple breaking changes to the API:

- PostgresClient now returns { query, transaction } instead of single client
- BaseContext.db.postgres is now an object with query/transaction properties
- Removed BaseContext.db.postgresWebSocket (use postgres.transaction instead)
- PostgresRepoFn.adapter changed from 'http'|'websocket' to 'query'|'transaction'
- requireRole renamed to requires and now accepts { role, organisationType }[]
- Removed init-firestore-repo middleware (use init-repo instead)
- Removed organisation middleware

New features:
- Added BigQuery support with BigQueryRepoFn and makeBigQueryIOFn
- Added Postgres support with NeonDB (http + serverless) and postgres.js
- Unified init-repo middleware handles all database types
- Simplified postgres.mts with automatic NeonDB/postgres.js detection

### Features

* add postgres and bigquery support with unified repo pattern ([fa5f5bb](https://github.com/gcp-tools/hono/commit/fa5f5bb5c9d27b3dd66e757a348aad093b1db539))

## [1.15.0](https://github.com/gcp-tools/hono/compare/v1.14.0...v1.15.0) (2025-11-03)

### Features

* adds firebase auth params ([afd2009](https://github.com/gcp-tools/hono/commit/afd200927b5be851ad454c16eb008f35509c09bf))

### Chores

* updates dependencies ([0cad257](https://github.com/gcp-tools/hono/commit/0cad257eeff6c1c2f13c186e8781a062977265e7))

## [1.14.0](https://github.com/gcp-tools/hono/compare/v1.13.0...v1.14.0) (2025-10-30)

### Features

* uses correct logger ([67e4c02](https://github.com/gcp-tools/hono/commit/67e4c029daa980ef7764e9bf690b27e6ba2acea8))

## [1.13.0](https://github.com/gcp-tools/hono/compare/v1.12.1...v1.13.0) (2025-10-29)

### Features

* better claims ([480efd8](https://github.com/gcp-tools/hono/commit/480efd8f7ce4adcb9b138cc07a69bd92210b47ad))

## [1.12.1](https://github.com/gcp-tools/hono/compare/v1.12.0...v1.12.1) (2025-10-29)

### Chores

* adds import that was incorrectly removed ([342ab78](https://github.com/gcp-tools/hono/commit/342ab781d31574d787e24163ff14b5a60c281009))

## [1.12.0](https://github.com/gcp-tools/hono/compare/v1.11.1...v1.12.0) (2025-10-29)

### Features

* improves contexts ([d530f9a](https://github.com/gcp-tools/hono/commit/d530f9ab833894435efd624fe817583156ae2d71))

## [1.11.1](https://github.com/gcp-tools/hono/compare/v1.11.0...v1.11.1) (2025-10-29)

### Bug Fixes

* updates exports ([6f24606](https://github.com/gcp-tools/hono/commit/6f246060bbb4edc1028665b70afe84e94c41d451))

## [1.11.0](https://github.com/gcp-tools/hono/compare/v1.10.2...v1.11.0) (2025-10-29)

### Features

* improves rbac ([c1c549f](https://github.com/gcp-tools/hono/commit/c1c549f9829624cb3b8fc14f8bf5785d83c9ac29))

## [1.10.2](https://github.com/gcp-tools/hono/compare/v1.10.1...v1.10.2) (2025-10-27)

### Bug Fixes

* reconfigures htpp response types for better type safety. hopefully. ([2a942f6](https://github.com/gcp-tools/hono/commit/2a942f66e65266183469a79f81d973bfe098b61f))

## [1.10.1](https://github.com/gcp-tools/hono/compare/v1.10.0...v1.10.1) (2025-10-26)

### Bug Fixes

* adds firebase auth config ([bdde0b0](https://github.com/gcp-tools/hono/commit/bdde0b0759b5a0e8abb14c5685657e78a99e29fc))

## [1.10.0](https://github.com/gcp-tools/hono/compare/v1.9.1...v1.10.0) (2025-10-26)

### Features

* better generics ([f0cf658](https://github.com/gcp-tools/hono/commit/f0cf65839771232dd750b8cb162eec63e157ee11))

## [1.9.1](https://github.com/gcp-tools/hono/compare/v1.9.0...v1.9.1) (2025-10-26)

### Bug Fixes

* unifies result type across io functions ([c2a072b](https://github.com/gcp-tools/hono/commit/c2a072b4f3fb5d674d6d56175a6ae78c3f426639))

## [1.9.0](https://github.com/gcp-tools/hono/compare/v1.8.0...v1.9.0) (2025-10-23)

### Features

* adds role ([ea139ec](https://github.com/gcp-tools/hono/commit/ea139ecadeaae3a1d320e18076c5cd22b98986cb))

## [1.8.0](https://github.com/gcp-tools/hono/compare/v1.7.0...v1.8.0) (2025-10-23)

### Features

* add simpleContext middleware for internal services ([8337aad](https://github.com/gcp-tools/hono/commit/8337aad876f5c1e246775fa29c19d0e730757dd8))

## [1.7.0](https://github.com/gcp-tools/hono/compare/v1.6.0...v1.7.0) (2025-10-21)

### Features

* better generics ([6841af2](https://github.com/gcp-tools/hono/commit/6841af21095a74f870fd8452b2ada015cd5ff631))

## [1.6.0](https://github.com/gcp-tools/hono/compare/v1.5.0...v1.6.0) (2025-10-21)

### Features

* better result types ([dfb5287](https://github.com/gcp-tools/hono/commit/dfb5287095d2422cef4070b13e72dce140c52202))

## [1.5.0](https://github.com/gcp-tools/hono/compare/v1.4.0...v1.5.0) (2025-10-21)

### Features

* better discriminated union ([be2a5ca](https://github.com/gcp-tools/hono/commit/be2a5caf5fbf9b75086e443cf9ce2cbb632ca92f))

## [1.4.0](https://github.com/gcp-tools/hono/compare/v1.3.0...v1.4.0) (2025-10-21)

### Features

* better generics ([3aef4b9](https://github.com/gcp-tools/hono/commit/3aef4b9aa7ee29fa71b65f1a7205dccf2f0a73cd))

## [1.3.0](https://github.com/gcp-tools/hono/compare/v1.2.0...v1.3.0) (2025-10-21)

### Features

* better generics ([b6b7d33](https://github.com/gcp-tools/hono/commit/b6b7d333ea4ed0579227ecc4ba3b9e514a591d1d))
* better generics ([98576bf](https://github.com/gcp-tools/hono/commit/98576bf81cc9a083b0a895d22209901a4ea3d40e))

## [1.2.0](https://github.com/gcp-tools/hono/compare/v1.1.0...v1.2.0) (2025-10-20)

### Features

* better generics ([473aa4d](https://github.com/gcp-tools/hono/commit/473aa4db74a76570f6c5163697d5ec6b6ad97ac0))

## [1.1.0](https://github.com/gcp-tools/hono/compare/v1.0.0...v1.1.0) (2025-10-20)

### Features

* simplifies service setup for hono client ([03f724a](https://github.com/gcp-tools/hono/commit/03f724a450653ab351525f9d2a440eddd1a1b184))

### Bug Fixes

* broken build ([ff43130](https://github.com/gcp-tools/hono/commit/ff431304b3ee4112b85eb8cc7bd0e0e77cbafaa2))

## 1.0.0 (2025-10-10)

### Features

* initial commit ([be2b7fa](https://github.com/gcp-tools/hono/commit/be2b7faab77e83dcd79df9cd8b80a33889995667))
