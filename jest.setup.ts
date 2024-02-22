let originalEnv: NodeJS.ProcessEnv

beforeAll(() => {
  // Store the original environment
  originalEnv = {...process.env}
})

// beforeEach(() => {})

afterAll(() => {
  process.env = originalEnv
})
