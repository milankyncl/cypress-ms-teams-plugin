import CypressCommandLine from 'cypress';
import { IncomingWebhook } from "ms-teams-webhook";
import { Options } from ".";

// Should implement CypressCommandLine.CypressRunResult
interface TestRun {
    tests: {
        state: string;
        title: string[];
    }[];
    stats: {
        failures: number;
    };
    spec: {
        name: string;
    };
}

interface RunResult {
    totalDuration: number;
    totalFailed: number;
    runs: TestRun[];
}

export function getResultMessagePayload(options: Omit<Options, 'msTeamsWebhookUrl'>, result: RunResult) {
    let index = 0;
    const failedCases = result.runs.map((run) => {
        if (run.stats.failures > 0) {
            return run.tests.map((test) => test.state === 'failed'
                ? `${++index}) ${test.title.join(' / ')} (${run.spec.name})` : null).filter((test): test is string => test !== null);
        }
        return [];
    }).flat();
    const failed = result.totalFailed > 0;
    const title = failed ? `${result.totalFailed} test case(s) failed` : 'All test cases have passed';
    return {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: title,
        themeColor: failed ? '#FF0000' : '#009a00',
        title,
        sections: ([
            options.ref ? {
                activityTitle: options.ref,
                activitySubtitle: `Test run completed finished in ${(result.totalDuration / 1000).toString()}s`,
            } : undefined,
            failed ? {
                text: failed ? ['<strong>Failed test cases:</strong>', ...failedCases].join('<br />') : undefined,
            } : undefined
        ]).filter((section) => section !== undefined),
        potentialAction: options.runUrl ? [
            {
                '@context': 'http://schema.org',
                '@type': 'ViewAction',
                name: 'Open Test Run Report',
                target: [options.runUrl],
            },
        ] : undefined,
    }
}

export async function sendFinishedResults(
    options: Options,
    testResults: CypressCommandLine.CypressRunResult,
) {
    const webhook = new IncomingWebhook(options.msTeamsWebhookUrl);
	try {
		await webhook.send(getResultMessagePayload(
			options,
			testResults,
		));
	} catch (err) {
		console.error('Sending the result webhook has failed', err);
	}
}
