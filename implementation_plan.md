# API Specification Audit & Implementation Plan

This document outlines the proposed changes to the [shop-list.swagger.yaml](file:///c:/shop-listV2.2/shop77_be/shop-list.swagger.yaml) document based on a deep audit of the `src/routers`, `src/controllers`, `src/validators`, and `src/models` directories.

## Goal Description
The objective is to fix and synchronize the Swagger documentation (`shop-list.swagger.yaml`) with the current Express implementation. The current documentation contains missing parameters, lacks ID validation, has some incorrect references, and misses proper examples/descriptions.

## Proposed Changes

### [Documentation]
#### [MODIFY] [shop-list.swagger.yaml](file:///c:/shop-listV2.2/shop77_be/shop-list.swagger.yaml)
1. **Synchronization:**
   - Add proper `/users/me` PUT body schema based on `UserValidator.updateUser` (name, email, password, phone, all optional).
   - Verify all paths strictly match the routers.

2. **Validation and Data Integrity (MongoDB IDs):**
   - Apply `type: string` and `pattern: '^[0-9a-fA-F]{24}$'` to all MongoDB ID schemas and path parameters (e.g., `userId`, `friendId`, `purchaseListId`, `itemId`).
   - Example to add: `example: "60b8d295f1d4f4001f5c3a5b"`.

3. **Usability (Try it out):**
   - Add detailed, realistic `example` instances for all request/response objects.
   - Add helpful `description` properties for parameters, e.g., "The 24-character hexadecimal assigned by MongoDB".

4. **Error Handling:**
   - Add `400 Bad Request` to all POST/PUT/PATCH endpoints containing a body payload (for validation errors).
   - Add `404 Not Found` and `403 Forbidden` consistently.

5. **Dredd Fixes:**
   - Ensure standards compliance by checking that `tags` and `security` are placed properly and `bearerFormat` doesn't break external tool parsers if invalid.

## Verification Plan

### Automated Verification
Since this task modifies documentation only, no unit tests will be executed directly on the codebase logic.
Run a swagger validation command or linter if available (e.g. `npx swagger-cli validate shop-list.swagger.yaml`).

### Manual Verification
1. User should serve the API locally (`npm run start:dev`).
2. Visit `http://localhost:3005/api-docs`.
3. Verify that all endpoints render correctly, parameters accept correct MongoDB format with proper error definitions displayed.
