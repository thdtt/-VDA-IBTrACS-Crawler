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

let finalCsv =
	'"NAME","ID","BASIN","ISO_TIME_________","NATURE","LAT","LON","WMO WIND","WMO PRES","USA WIND","TOKYO WIND","TOKYO PRES","CMA WIND","CMA PRES","HKO WIND","HKO PRES"\n';

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

		//parse name and id
		let name = "",
			id = "";
		let separatedName = dom.window.document
			.querySelectorAll("h1")[0]
			.textContent.split("\n")[2]
			.split(" ");
		for (let i = 0; i < separatedName.length; ++i) {
			if (
				separatedName[i] !== "" &&
				separatedName[i] === separatedName[i].toUpperCase()
			) {
				name = separatedName[i];
				break;
			}
		}
		id = separatedName[separatedName.length - 1];
		console.log({ name, id });

		//convert table to csv
		const csv = tableToCsv(table);

		//append csv to final csv
		finalCsv = finalCsv.concat(
			csv
				.split("\n")
				.slice(2)
				.map((str) =>
					str !== ""
						? `"${name}","${id
								.split("")
								.slice(1, id.length - 1)
								.join("")}",`.concat(str)
						: str
				)
				.join("\n")
		);

		//write to file
		fs.writeFileSync(path + `result.csv`, finalCsv);
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
