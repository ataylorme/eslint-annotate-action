import { jest } from '@jest/globals'

const mockUpdate = jest.fn<(options: unknown) => Promise<{ data: unknown }>>()

jest.unstable_mockModule('../constants.js', () => ({
  default: {
    core: { info: jest.fn() },
  },
  octokit: {
    rest: { checks: { update: mockUpdate } },
  },
}))

const { default: updateStatusCheck } = await import('../updateStatusCheck.js')

const options = { owner: 'ataylorme', repo: 'eslint-annotate-github-action', check_run_id: 42 }

describe('updateStatusCheck', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('retries a 404 until the check run can be updated', async () => {
    mockUpdate
      .mockRejectedValueOnce(Object.assign(new Error('Not Found'), { status: 404 }))
      .mockResolvedValueOnce({ data: { id: 42 } })

    const result = updateStatusCheck(options)
    await jest.runAllTimersAsync()

    await expect(result).resolves.toEqual({ id: 42 })
    expect(mockUpdate).toHaveBeenCalledTimes(2)
  })

  it('gives up after four attempts when the 404 does not go away', async () => {
    const notFound = Object.assign(new Error('Not Found'), { status: 404 })
    mockUpdate.mockRejectedValue(notFound)

    const error = updateStatusCheck(options).catch((err: unknown) => err)
    await jest.runAllTimersAsync()

    expect(await error).toBe(notFound)
    expect(mockUpdate).toHaveBeenCalledTimes(4)
  })

  it('does not retry other errors', async () => {
    mockUpdate.mockRejectedValueOnce(Object.assign(new Error('Validation Failed'), { status: 422 }))

    await expect(updateStatusCheck(options)).rejects.toThrow('Validation Failed')
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })
})
