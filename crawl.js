//Import lib
const axios = require("axios");
const jsdom = require("jsdom");
const tableToCsv = require("node-table-to-csv");
const fs = require("fs");
const readline = require("readline");
const prompt = require("prompt-sync")({ sigint: true });

//define path
const path = "./data/";
const crawlFilePath = "./url-crawl.txt";

(async () => {
	//Fetching web page
	console.log(`Fetching ${crawlFilePath} ...`);

	const listURL = await processLineByLine(crawlFilePath);

	console.log(listURL);

	listURL.forEach(async (url) => {
		const response = await axios(url);

		//init document
		const document = response.data;
		const dom = new jsdom.JSDOM(document);

		//get table content
		const table = dom.window.document.querySelectorAll(
			'table[border="1"][width="650"]'
		)[0].outerHTML;

		//convert table to csv
		const csv = tableToCsv(table);

		//define file name to save
		const fileName = path + url.split("-")[1] + ".csv";

		//write to file
		fs.writeFileSync(fileName, csv);
	});
})();

async function processLineByLine(path) {
	const fileStream = fs.createReadStream(path);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});
	// Note: we use the crlfDelay option to recognize all instances of CR LF
	// ('\r\n') in input.txt as a single line break.

	const lineArray = [];

	for await (const line of rl) {
		// Each line in input.txt will be successively available here as `line`.
		lineArray.push(line);
	}

	return lineArray;
}
