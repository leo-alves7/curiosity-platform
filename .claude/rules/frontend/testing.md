---
paths:
  - "**/*.test.{tsx,ts}"
---

# Instructions for testing with TypeScript/React files

## API Calls

When writing unit tests for components or functions that make API calls, use `msw` to intercept these calls and provide mock responses.

## General Guidelines

- Use `describe` blocks to group related tests together for better organization and readability.
- Use `beforeEach` and `afterEach` hooks to set up and clean up any shared state before and after each test.
- Create a `setup` function to render the component being tested, which can help reduce code duplication across tests. It can receive arguments to customize the rendering as needed.
- Use `userEvent` from `@testing-library/user-event` to simulate user interactions with the components.
- Prefer `getByRole` and `getByLabelText` queries from `@testing-library/react` to select elements in the DOM, as they are more resilient to changes in the UI. Use test ids only as a last resort.
