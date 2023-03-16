import { describe, expect, it } from '@jest/globals';
import { getResultMessagePayload } from "./msTeamsWebhook";

describe('MS Teams webhook', () => {
	describe('#getResultMessagePayload', () => {
		describe('with one test case failed', () => {
			it('should create failure message payload', () => {
				expect(
					getResultMessagePayload({
						ref: 'v0.0.1',
					}, {
						totalFailed: 1,
						totalDuration: 2_000,
						runs: [
							{
								stats: {
									failures: 1,
								},
								tests: [
									{
										title: ['Test suite #1', 'do this and that'],
										state: 'failed',
									},
									{
										title: ['Test suite #2', 'do that and this also'],
										state: 'failed',
									},
									{
										title: ['Test suite #3', 'do this only'],
										state: 'succeeded',
									},
									{
										title: ['Test suite #4', 'do that only'],
										state: 'failed',
									},
								],
								spec: {
									name: 'file1.spec.js',
								},
							}
						],
					}),
				).toMatchSnapshot();
			});

			it('should create success message payload', () => {
				expect(
					getResultMessagePayload({
						ref: 'v0.0.2',
					}, {
						totalFailed: 0,
						totalDuration: 5_000,
						runs: [
							{
								stats: {
									failures: 0,
								},
								tests: [
									{
										title: ['Test suite #2', 'should do this and this'],
										state: 'passed',
									},
								],
								spec: {
									name: 'file2.spec.js',
								},
							}
						],
					}),
				).toMatchSnapshot();
			});
		});
	});
});