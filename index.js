const express = require("express");
const fs = require("fs");
const hbs = require("hbs");
const { parseSync, stringifySync } = require("subtitle");

const app = express();
app.set("view engine", "hbs");

app.get("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const path = req.params[0];
  const format = req.query.format;

  console.log(path);
  const seen = new Set();
  seen.add("0");
  if (path.includes(".srt")) {
    let subs = fs
      .readFileSync(path)
      .toString()
      .replace(/(\r\n|\r|\n)/, "\n")
      .split("\n")
      .map((e) => e.trim().replace(/  /g, " "))
      .map((e) => {
        if (seen.has(e) || e == "") {
          seen.add(e);
          return "";
        }
        console.log(`output: "${e}"`);
        seen.add(e);
        return e;
      })
      .filter((e) => e !== "")
      .join("\n");

    let nodes = parseSync(subs);
    const parsed = stringifySync(nodes, { format: "WebVTT" });
    res.setHeader("Content-Type", "text/vtt");
    res.send(parsed);

    return;
  } else if (path.includes(".mp4.html")) {
    let pathList = path.split("/");
    console.log("porraaaa");
    res.render("video", {
      title: pathList[pathList.length - 1].replace(".html", ""),
    });
    return;
  } else if (fs.lstatSync(path).isDirectory()) {
    const dirContents = fs
      .readdirSync(path)
      .filter((p) => p.match(/.*(srt|vtt)$/) == null);

    if (format === "json") {
      res.json({
        files: dirContents
          .filter((e) => e.match(/^\d+/) != null)
          .sort((a, b) => a.match(/^\d+/)[0] - b.match(/^\d+/)[0]),
      });
    }

    const pathList = path.split("/");

    res.render("dir", {
      title: `Index of ${pathList[pathList.length - 1]}`,
      dir_names: dirContents.map((d) => {
        return {
          name: d,
          href: `${path}/${d}${d.endsWith(".mp4") ? ".html" : ""}`,
        };
      }),
      breadcrumbs: path.split("/").map((d, i) => {
        return {
          name: d,
          path: path
            .split("/")
            .filter((p, j) => j <= i)
            .join("/"),
        };
      }),
    });
    return;
  }
  console.log(path, path.includes(".mp4.html"));

  res.sendFile(path);
});

app.listen(9910);
