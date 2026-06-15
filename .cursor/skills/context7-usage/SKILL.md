---
name: context7-usage
description: Query up-to-date documentation and code examples for any programming library, framework, SDK, API, or CLI tool using Context7 MCP. Use when you need to fetch current API docs, find usage examples, resolve library IDs, or ask specific technical questions about a library's features, configuration, version differences, or debugging. Do not use for general programming concepts or code review.
allowed-tools: CallMcpTool
---

# Context7 MCP Usage

Use the Context7 MCP server to retrieve current, accurate documentation and code examples for any library or framework.

## Core Workflow

Always follow these two steps in order:

### Step 1: Resolve Library ID

Call `resolve-library-id` to find the correct Context7-compatible ID for the library.

**Parameters:**
- `libraryName` (string, required): Official library name with proper punctuation (e.g., "Godot Engine", "Next.js", "Three.js")
- `query` (string, required): Your specific question or task context (e.g., "Godot API documentation", "React hooks examples")

**Returns:**
- Library ID (format: `/org/project`)
- Name, description, code snippet count
- Source reputation (High/Medium/Low)
- Benchmark score (0-100)
- Available versions

**Example:**
```json
{
  "libraryName": "Godot Engine",
  "query": "How to create a 2D sprite"
}
```

**Response:**
```
Library ID: /godotengine/godot-docs
Code Snippets: 20147
Source Reputation: High
Benchmark Score: 77.52
```

### Step 2: Query Documentation

Call `query-docs` with the resolved library ID to get specific API information.

**Parameters:**
- `libraryId` (string, required): The ID from step 1 (e.g., `/godotengine/godot-docs`)
- `query` (string, required): Specific question about API methods, classes, configuration, examples, or version differences

**Example:**
```json
{
  "libraryId": "/godotengine/godot-docs",
  "query": "Node class add_child method parameters"
}
```

**Returns:**
- Relevant documentation sections
- Code examples
- Parameter descriptions
- Usage patterns

## Important Rules

1. **Always resolve first**: Do not skip to query-docs without a valid library ID unless the user explicitly provides one in format `/org/project` or `/org/project/version`
2. **Limit calls**: Maximum 3 calls per question total (resolve-library-id + query-docs)
3. **Be specific**: In query-docs, ask concrete questions like "How to set up authentication with JWT in Express.js" not "auth"
4. **Version pinning**: If user mentions a version, append it to library ID (e.g., `/vercel/next.js/v14.3.0`)

## Example Full Session

**User:** "How do I animate a sprite in Godot 4?"

**Assistant:** 
1. Call `resolve-library-id` with `libraryName: "Godot Engine"`, `query: "Godot 4 sprite animation"`
2. Get ID `/godotengine/godot-docs`
3. Call `query-docs` with `libraryId: "/godotengine/godot-docs"`, `query: "AnimatedSprite2D node animation frames godot 4"`

**Result:** Returns documentation for AnimatedSprite2D, AnimationPlayer, and code examples for frame-based and skeletal animation.

## Error Recovery

- If resolve-library-id returns no good matches: Try alternative library names (e.g., "React" instead of "React.js")
- If query-docs returns irrelevant results: Refine query to be more specific about the exact API element
- If library has multiple versions: Use the version tag in libraryId (e.g., `/godotengine/godot-docs/4.5`)

## Do Not Use For

- General programming concepts (loops, conditionals, algorithms) - use your training data
- Code review or refactoring advice
- Debugging business logic
- Asking about your own codebase

Use only for external library/framework documentation needs.