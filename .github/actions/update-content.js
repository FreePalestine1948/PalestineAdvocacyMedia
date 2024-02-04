const json2md = require("json2md");
const fs = require("fs");

let outputDir = "./Media/";
let headers = {
  Authorization: "Basic " + btoa("pal:love"),
};

let socialNetworksAPIendpint =
  "https://palestinelove.org/api/v1/social-media/networks";

async function convertJson2Markdown(title, data) {
  data = data.map((item) => {
    return `[${item.name}](${item.url}) - ${item.description}`;
  });
  data = [{ h1: title }, { ul: data }];
  return json2md(data);
}

async function writeMarkdown(filename, md) {
  md = md
    .split("\n")
    .map((item) => {
      return item.replace(/^ | $/g, "");
    })
    .join("\n");

  fs.writeFileSync(`${outputDir}${filename}`, md, (err) => {
    if (err) throw err;
    console.log(`${filename} saved!`);
  });
}

async function getNetworksData() {
  let req = await fetch(socialNetworksAPIendpint, { headers: headers });
  let networksAPIs = await req.json();
  let networks = networksAPIs.map((item) => {
    let res = fetch(item.endpoint, { headers: headers }).then((res) => {
      return res.json();
    });
    return res;
  });
  return await Promise.all(networks);
}

async function main() {
  let promises = getNetworksData();
  let dataForAllNetworks = (await Promise.all([promises]))[0];
  for (i in dataForAllNetworks) {
    let network = dataForAllNetworks[i];
    let title = network[0].network;
    title = title.charAt(0).toUpperCase() + title.slice(1);
    let md = await convertJson2Markdown(title, network);
    await writeMarkdown(`${title}.md`, md);
  }
}

main().catch((err) => {
  console.log(err);
});
