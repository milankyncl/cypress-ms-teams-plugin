import Cypress from 'cypress';
import { sendFinishedResults } from './msTeamsWebhook';

export interface Options {
	msTeamsWebhookUrl: string;
	ref?: string;
}

export default (on: Cypress.PluginEvents, opts: Options) => {
	on('after:run', async (results) => {
		if (results.status === 'finished') {
			await sendFinishedResults(opts, results);
		}
	});
}