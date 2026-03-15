let originalEnv: NodeJS.ProcessEnv

beforeAll(() => {
  originalEnv = { ...process.env }
})

afterAll(() => {
  process.env = originalEnv
})
