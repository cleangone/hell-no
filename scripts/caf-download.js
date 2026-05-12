// ==UserScript==
// @name       CAF Download
// @namespace  http://tampermonkey.net/
// @match      https://www.comicartfans.com/*
// @require    https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
// @grant      GM_download
// ==/UserScript==

const Status = {
   FOUND:      "Found",
   RETRIEVED:  "Retrieved",
   DOWNLOADED: "Downloaded",
   ERROR:      "Error"
}

const now = dayjs().format('MM-DD-YYYY_HH-mm-ss');
const gallery = {};
const urlToItem = new Map();
const statusDiv = document.createElement("div")
statusDiv.setAttribute("style", "position:fixed; z-index:1000; top:10%; left:.5%; background-color:white; text-align:left;" );
statusDiv.style.padding = "10px 20px";
statusDiv.style.border = "2px solid black";

const titleDiv = appendChildDiv(statusDiv)
titleDiv.innerHTML = "CAF Download";
titleDiv.style.fontWeight = 'bold';

var galleryStatusDiv = appendChildDiv(statusDiv)

var retrieveBtn = createButton("Retrieve");
var downloadBtn = createButton("Download");
const broadcast = new BroadcastChannel('channel');

(function() {
    'use strict';
    console.log("CAF Script")
    retrieveBtn.onclick = function() { getItemInfo(); }
    downloadBtn.onclick = function() { downloadItems(); }
    broadcast.onmessage = (event) => {
        //console.log("Retrieved " + event.data.title);
        //console.log(event.data);
        urlToItem.set(event.data.url, event.data);
        setStatusHtml();
    }

    document.body.appendChild(statusDiv)
    setStatusHtml()
    processPage()
})();

function processPage() {
    if (isPage("galleryroom.asp")) { processGalleryPage() }
    else if (isPage("gallerypiece.asp")) { processItemPage() }
}

function processGalleryPage() {
    const currentUrl = window.location.href;
    console.log("currentUrl", currentUrl)

    gallery.title = "New Gallery " + now;
    gallery.desc = "";
    var titleDiv = getElementByClassName(document,"title-container")
    if (titleDiv) {
        const titleEle = getElementByClassName(titleDiv, "title")
        if (titleEle) { gallery.title = titleEle.innerHTML }

        const descEle = getElementByClassName(titleDiv, "description")
        if (descEle) { gallery.desc = descEle.innerHTML.trim() }
    }

    urlToItem.clear()
    var productDivs = document.getElementsByClassName("card-thumbnail")
    for (const productDiv of productDivs) {
        var anchor = getAnchor(productDiv)
        var href = anchor.getAttribute("href")
        var image = getElementByTagName(anchor, "img")
        var altText = image.getAttribute("alt")
        urlToItem.set('https://www.comicartfans.com/' + href, { status: Status.FOUND })
    }
    setStatusHtml()
}

function processItemPage() {
    const itemData = { url:window.location.href, status:Status.RETRIEVED }
    var titleDiv = getElementByClassName(document,"title-container")
    if (titleDiv) {
        itemData.title = titleDiv.firstElementChild.innerHTML
    }

    var statsDiv = getElementByClassName(document, "stats-likes")
    if (statsDiv) {
        var imgDiv = statsDiv.parentElement.nextElementSibling;
        itemData.imageUrl = imgDiv.firstElementChild.href;
    }

    statsDiv = getElementByClassName(document, "stats-wrapper");
    console.log("stats-wrapper", statsDiv);
    if (statsDiv) {
        var bolds = statsDiv.querySelectorAll("b");
        for (const bold of bolds) {
            console.log("bold", bold);
            if (bold.innerHTML.toLowerCase().trim() == "artist:") {
                var anchor = bold.nextElementSibling;
                console.log("anchor", anchor);
                var artist = anchor ? anchor.innerHTML : "";
                artist = artist.trim().replace(/&nbsp;/g, " ");
                console.log("artist", artist);
                itemData.artist = artist;
            }
        }
    }

    var descDiv = getElementByClassName(document, "description-box")
    if (descDiv) {
        var html = descDiv.innerHTML;
        itemData.descHtml = html.trim(); // remove whitespace, \t, \n from start/end
    }

    setTimeout(() => {
        broadcast.postMessage(itemData);
        window.close();
    }, 100);
}

function getItemInfo() {
    for (const url of [...urlToItem.keys()]) {
        openInNewTab(url)
    }
}

function downloadItems() {
    const manifest = { gallery: gallery, items: [] }
    var i = 1;
    for (const value of urlToItem.values()) {
        if (value.status == Status.RETRIEVED) {
            console.log("Downloading", value.title);
            const extension = getExtension(value.imageUrl);
            value.filename = "image" + (i<10?"0":"") + i + "_" + now + extension;
            downloadImage(value.imageUrl, value.filename, value);
            manifest.items.push(value);
            i++;
        }
    }

    downloadTextFile(JSON.stringify(manifest), "manifest_" + now + ".json");
    setStatusHtml();
}

function getExtension(url) {
    const index = url.lastIndexOf(".")
    var extension = url.substring(index)
    var lowercase = extension.toLowerCase();
    return lowercase == ".jpeg" ? ".jpg" : lowercase;
}

function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, filename)
    URL.revokeObjectURL(url);
}

function downloadImage(url, filename, item) {
    GM_download({
        url: url,
        name: filename,
        saveAs: false,
        onload: () => {
            item.status = Status.DOWNLOADED;
            setStatusHtml();
        },
        onerror: (error) => {
            item.status = Status.ERROR;
            item.error = error;
            setStatusHtml();
        }
    });
}

function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setStatusHtml() {
    var retrieved = 0
    var downloaded = 0
    var error = 0
    if (urlToItem.size) {
        for (const value of urlToItem.values()) {
            if (value.status == Status.RETRIEVED) { retrieved++ }
            else if (value.status == Status.DOWNLOADED) { downloaded++ }
            else if (value.status == Status.ERROR) { error++ }
        }
    }

    var table = document.createElement("table");
    galleryStatusDiv.innerHTML = "";
    if (urlToItem.size) {
        galleryStatusDiv.appendChild(table);
        var tr = appendChildEle(table, "tr");
        var td = appendChildEle(tr, "td");
        td.innerHTML = urlToItem.size + " Items in Gallery";
        td = appendChildEle(tr, "td");
        td.appendChild(retrieveBtn);
    }
    if (retrieved) {
        tr = appendChildEle(table, "tr");
        td = appendChildEle(tr, "td");
        td.innerHTML = retrieved + " Retrieved";
        td = appendChildEle(tr, "td");
        td.appendChild(downloadBtn);
    }
    if (downloaded) {
        tr = appendChildEle(table, "tr");
        td = appendChildEle(tr, "td");
        td.innerHTML = downloaded + " Downloaded"
    }
    if (error) {
        tr = appendChildEle(table, "tr");
        td = appendChildEle(tr, "td");
        td.innerHTML = error + " Error" + (error > 1 ? "s" : "")
    }
}

function createButton(text) {
    var btn = document.createElement("button");
    btn.textContent = text;
    btn.style.backgroundColor = "#1976D2";
    btn.style.color = "white";
    btn.style.padding = '2px 5px';
    btn.style.borderRadius = "5px";
    return btn
}

function openInNewTab(url) { window.open(url, '_blank'); }

function getElementByClassName(parentElement, name) {
    var elements = parentElement.getElementsByClassName(name)
    return elements.length == 0 ? null : elements[0]
}

function getElementByName(parentElement, name) {
    var elements = parentElement.getElementsByName(name)
    return elements.length == 0 ? null : elements[0]
}

function getAnchor(parentElement) { return getElementByTagName(parentElement, "a") }
function getElementByTagName(parentElement, name) {
    var elements = parentElement.getElementsByTagName(name);
    return elements.length == 0 ? null : elements[0]
}

function appendChildDiv(parent) { return appendChildEle(parent, "div") }
function appendChildEle(parent, childType) {
    var child = document.createElement(childType)
    parent.appendChild(child)
    return child
}

function isPage(page) { return window.location.href.indexOf(page) != -1; }

