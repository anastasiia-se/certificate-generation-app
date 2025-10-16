<!--
=============================================================================
CONSTITUTION SYNC IMPACT REPORT
=============================================================================
Version Change: (none) → 1.0.0
Change Type: Initial constitution ratification
Modified Principles: N/A (initial creation)
Added Sections: All sections (initial creation)
Removed Sections: None

Templates Requiring Updates:
✅ .specify/templates/plan-template.md - Updated Constitution Check reference
✅ .specify/templates/spec-template.md - Aligned with functional requirements principles
✅ .specify/templates/tasks-template.md - Aligned with testing and deployment principles

Follow-up TODOs:
- None (initial ratification complete)

=============================================================================
-->

# Gen AI Diploma System Constitution

## Core Principles

### I. Azure-Native Architecture
The system MUST leverage Azure platform services as the primary infrastructure:
- Azure Static Web Apps for frontend hosting with automatic CI/CD
- Azure Functions v4 for serverless backend compute
- Azure Table Storage for diploma metadata persistence
- Azure Blob Storage for PDF document storage
- GitHub Actions for deployment automation

**Rationale**: Azure-native design ensures scalability, reduces operational overhead, aligns with Swedbank's cloud strategy, and provides built-in security and compliance features required for enterprise deployment.

### II. Security & Compliance First
All features MUST prioritize security and data protection:
- HTTPS-only communication for all endpoints
- API authentication required before production deployment (function keys minimum, Azure AD preferred)
- Personal data handling MUST comply with GDPR requirements
- Storage encryption at rest (Azure default) and in transit (TLS 1.2+)
- Audit logging for all data operations (create, read, delete)
- Password protection MUST NOT be stored in client-side code
- Data residency MUST be in EU regions (North Europe preferred)

**Rationale**: The system handles personally identifiable information (names, emails, diplomas) and must meet banking industry security standards and European data protection regulations.

### III. Branch Strategy & Feature Isolation
Development MUST follow a structured branch strategy:
- **main**: Production-ready code only, automatically deployed
- **disabled-sending-diplomas**: Current development branch (no email functionality)
- **enabled-sending-diplomas**: Alternative branch with Resend email integration
- Feature branches MUST merge to appropriate base branch based on email dependency
- NO direct commits to main; all changes via pull requests

**Rationale**: Dual-branch strategy allows parallel development of email and non-email features while maintaining a stable production deployment path.

### IV. Data Integrity & Storage Patterns
Storage operations MUST follow established conventions:
- Table Storage: Partition key `CERT`, row key `diploma_{timestamp}_{random}`
- Blob Storage: File naming `{diplomaId}.pdf` with `application/pdf` content type
- Duplicate prevention: Check Name+Surname+Date combination before generation
- Fallback pattern: Azure Storage primary, in-memory for local development only
- Transactional consistency: Metadata and blob operations MUST both succeed or both fail

**Rationale**: Consistent storage patterns prevent data corruption, enable efficient querying, and ensure diploma uniqueness while supporting local development workflows.

### V. Frontend-Backend Separation
Clear separation of concerns between frontend and backend:
- Frontend (React + TypeScript): UI, validation, user interaction only
- Backend (Azure Functions): Business logic, PDF generation, storage operations
- NO business logic in frontend code
- API contracts MUST be documented and versioned
- CORS configuration MUST explicitly list allowed origins

**Rationale**: Separation enables independent scaling, facilitates security auditing, allows backend reuse by other clients, and prevents business logic leakage to client code.

### VI. Observability & Monitoring
All production deployments MUST include monitoring:
- Application Insights integration for Azure Functions
- Structured logging with severity levels (info, warning, error)
- Key metrics: Diploma generation success rate, PDF generation time, storage operations
- Error tracking with stack traces and context
- Performance monitoring: API response times, cold start durations

**Rationale**: Observability is critical for diagnosing production issues, understanding system behavior, meeting SLAs, and providing visibility to Swedbank operations teams.

### VII. Migration-Ready Design
All implementation decisions MUST consider Swedbank Azure migration:
- Parameterized configuration: NO hardcoded URLs, connection strings, or domain names
- Environment variable driven: All environment-specific values in app settings
- Custom domain preparation: Code MUST work with both Azure default and custom domains
- Email abstraction: Email sending isolated in dedicated service module
- Documentation: Migration steps documented in MIGRATION_REQUIREMENTS.md

**Rationale**: The current deployment is on personal Azure infrastructure and MUST migrate to Swedbank's Azure tenant with minimal code changes.

## Testing Requirements

### Test Strategy
Testing is REQUIRED for all new features and changes:
- **Frontend**: React component tests for user interactions
- **Backend**: Unit tests for business logic, integration tests for Azure Functions
- **End-to-End**: Manual testing checklist in CLAUDE.md
- **Batch Processing**: CSV upload tested with various file formats and edge cases
- **Error Scenarios**: Duplicate diploma detection, invalid inputs, storage failures

### Test Execution
- Tests MUST pass locally before creating pull requests
- GitHub Actions MUST run tests automatically on all PRs
- Test failures MUST block merges to main
- Test coverage SHOULD increase over time (current: minimal, target: 70%+)

## Deployment Standards

### Deployment Process
- **Automated CI/CD**: GitHub Actions trigger on push to main
- **Frontend**: Build and deploy to Azure Static Web Apps
- **Backend**: Deploy Azure Functions via linked deployment
- **Environment Variables**: Configured in Azure Portal, NEVER committed to repository
- **Rollback**: Previous deployment preserved for quick rollback if needed

### Pre-Deployment Checklist
Before deploying to production:
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Breaking changes documented
- [ ] Backward compatibility verified for data storage

## Code Quality Standards

### Code Conventions
- **Frontend**: TypeScript with strict mode, React functional components and hooks
- **Backend**: JavaScript (Node.js) with async/await, NO callbacks
- **Styling**: Material-UI (MUI) components, Swedbank brand colors (#FF5F00, #FF6B35)
- **Error Handling**: Try-catch blocks required, detailed error messages logged
- **Comments**: Complex business logic MUST include explanatory comments

### File Organization
- Frontend structure: `src/components/`, `src/services/`, `src/types/`
- Backend structure: `api/` for functions, `api/shared/` for utilities and assets
- Shared assets: Logo, background images in `api/shared/`
- Type definitions: TypeScript interfaces in dedicated type files

## Governance

### Amendment Process
This constitution MUST be updated when:
- Major architectural decisions are made (e.g., switching from Table Storage to SQL)
- New security or compliance requirements emerge
- Migration to Swedbank Azure introduces new constraints
- Technology stack changes (e.g., React version upgrade)

Amendments require:
1. Proposal documented with rationale
2. Review by development team
3. Update to version number (semantic versioning)
4. Propagation to dependent templates (plan, spec, tasks)
5. Git commit with descriptive message

### Constitution Compliance
- All PRs MUST verify compliance with these principles
- Complexity or deviations MUST be justified in plan.md
- Security violations MUST be flagged and remediated immediately
- Monitoring MUST be configured before production deployment

### Version Control
- Version format: MAJOR.MINOR.PATCH
- MAJOR: Backward-incompatible changes (e.g., removing a principle)
- MINOR: New principles or expanded guidance (e.g., adding test requirements)
- PATCH: Clarifications, typo fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16
