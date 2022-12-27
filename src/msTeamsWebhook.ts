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
    const failedCases = result.runs.map((run) => {
        if (run.stats.failures > 0) {
            return run.tests.map((test, i) => test.state === 'failed'
                ? `${i + 1}) ${test.title.join(' / ')} (${run.spec.name})` : null).filter((test): test is string => test !== null);
        }
        return [];
    }).flat();
    const failed = result.totalFailed > 0;

    return {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: 'Cypress test results',
        themeColor: failed ? '#FF0000' : '#009a00',
        title: failed ? `${result.totalFailed} test case(s) failed` : 'All test cases passed',
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
    await webhook.send(JSON.stringify(getResultMessagePayload(
        options,
        testResults,
    )));
}