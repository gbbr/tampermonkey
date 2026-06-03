/* ====== START TAMPERMONKEY SCRIPT ====== */
/* The below needs to go into the actual browser TamperMonkey script */

// ==UserScript==
// @name         Pali Toggle
// @namespace    http://tampermonkey.net/
// @version      2026-05-13
// @description  Toggle Pali translation
// @author       Gabriel
// @match        https://suttacentral.net/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jsdiff/5.1.0/diff.min.js
// @require      file:///Users/azzalos/g/tampermonkey/suttacentral.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=suttacentral.net
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* ====== END TAMPERMONKEY SCRIPT ====== */

/* global Diff */

const SUB_FOLDER = "mine"; // "original" (Sujato) or "mine" (my own)

const SUTTA_BASE = `file:///Users/azzalos/g/tampermonkey/${SUB_FOLDER}/sujato/sutta`;
const BLURB_BASE = `file:///Users/azzalos/g/tampermonkey/${SUB_FOLDER}/blurb`;

(function($) {
    addStyles()

    waitForElement("main").then((el) => {
        // Once the page has loaded, load the JSON sutta translation from
        // disk and replace the HTML with it, adding a diff to show the changes.
        var rangeid = $("section.range[id]").attr("id"),
            id = $("article[id]").attr("id");

        if (typeof rangeid != 'undefined') {
            id = rangeid;
        }
        loadSutta(id, (err, en, blurb) => {
            if (err != null) {
                console.error(err);
                return
            }

            if (blurb != null) {
                $("h1.sutta-title").after(`<p class="blurb">${blurb}</p>`);
            }

            var nfile = Object.keys(en).length,
                npage = $("article .segment").length - 1;

            console.log(`Loaded ${nfile} segments from file and found ${npage} segments in page.`);
            if (nfile != npage) {
                console.error(`Mismatch between file and page segment count (${nfile}/${npage}).`);
            }

            Object.entries(en).forEach(([key, value]) => {
                var el = $("span.segment[id='"+key+"'] > .translation > .text"),
                    orig = el.html(),
                    diff = "";

                if (orig != value) {
                    // the text is changed, so create the diff
                    const diffHTML = Diff.diffWords(orig, value).map(part => {
                        const cls = part.added ? 'diff-added' : part.removed ? 'diff-removed' : '';
                        return `<span class="${cls}">${part.value}</span>`;
                    }).join('');

                    diff = ' <span class="comment red"><b>Original text</b>: '+ diffHTML +'</span>';
                }

                el.html(value + diff);
            });
        });
    })

    $(document).ready(function() {
        // The root pali text ("line-by-line") is hidden, and this code
        // toggles it when clicking each text segment.
        $(document).on("click", ".segment .translation", function() {
            $(this).parent().find(".root").toggleClass("show");
        });

        fixClose($)
    });
})(window.jQuery.noConflict(true));

// add CSS styles
function addStyles() {
    [
      'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap',
      'https://db.onlinewebfonts.com/c/8682a614b45207e84ddd15ef6093cdab?family=Sabon+Next+LT+W04+Regular',
      'https://db.onlinewebfonts.com/c/663c911905498d27729fe0a7f1ca2cc4?family=Bookerly',
      'https://fonts.googleapis.com/css2?family=Baskervville:ital,wght@0,400..700;1,400..700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet'
    ].forEach(resourceURL => {
      const link = document.createElement('link');
      link.href = resourceURL;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
    });

    GM_addStyle(`
      header h1 {
        font-variant-caps: normal !important;
      }

      h1 .text,
      h2 .text,
      h3 .text,
      .text { 
        font-family: "Georgia", serif !important;
        color: #DDD !important;
        font-size: 1.3em !important;
      }

      header p.blurb {
        font-size: 1.4em;
        width: 80%;
        margin: 0 auto;
        font-style: italic;
      }

      #bottom_sheet {
        --sc-font-size-s: 1.2rem !important;
      }

      div.floating-tooltip.comment-tooltip {
          font-size: 1.2em !important;
      }

      div.floating-tooltip.comment-tooltip a {
        color: #FFF !important;
      }

      sc-text-page-selector, .root .text {
        font-weight: 400 !important;
      }

      body {
        background-color: #111 !important;
      }

      #btnInfo:after {
         content: '' !important;
      }

      header h1 {
        margin-top: 0 !important;
      }

      .generalTitle span {
        font-size: 0.4em !important;
      }

      a.skip-to-content-link { display: none !important; }

      main > article, div > article, .range {
        margin: 0 5em !important;
        max-width: 1000px;
      }

      header .segment {
        display: inline !important;
      }

      .segment {
        margin: 0px 40px;
        grid-template-columns: minmax(200px, 1000px) !important;
      }

      .segment .root {
        display: none;
      }

      .segment .root .text {
        color: #AAA !important;
      }

      .segment .root.show {
        display: block;
      }


      .comment::before {
        color: #1f8da99e !important;
      }

      .comment.red {
        padding-right: 0px !important;
      }

      .comment.red::before {
        color: #ffb1828c !important;
      }

      p { margin-top: 1em !important; }

      .diff-added { color: #e6ffec; text-decoration: none; }
      .diff-removed { color: #ffebe9; text-decoration: line-through; }
    `);
}

// waits for element to load
function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

// fixClose fixes an issue when closing the dictionary popup
// where the highlighted word isn't de-highlighted
function fixClose($) {
    // This function handles the logic once the shadow root is accessible
    function startShadowObserver(host) {
        if (!host.shadowRoot) return;

        const shadowObserver = new MutationObserver(() => {
            const $btn = $(host.shadowRoot).find('#btnClose');

            if ($btn.length && !$btn.attr('data-tm-ready')) {
                $btn.attr('data-tm-ready', 'true');
                $btn.on('click.myScript', function(e) {
                    $(".word.spanFocused").removeClass("spanFocused");
                });
            }
        });

        shadowObserver.observe(host.shadowRoot, {
            childList: true,
            subtree: true
        });
    }

    // TIER 1: Watch the main document for the 'sc-bottom-sheet'
    const mainObserver = new MutationObserver(() => {
        const host = document.querySelector('sc-bottom-sheet');
        
        if (host && !host.hasAttribute('data-tm-watching')) {
            // Mark the host so we don't start multiple observers on it
            host.setAttribute('data-tm-watching', 'true');
            console.log("Host sc-bottom-sheet found. Checking Shadow Root...");
            // Sometimes the host exists but the shadow root takes a millisecond to attach
            if (host.shadowRoot) {
                startShadowObserver(host);
            } else {
                // Wait for shadowRoot to be attached if it's not there yet
                const waitLimit = 50; // try for 5 seconds
                let tries = 0;
                const checkInterval = setInterval(() => {
                    if (host.shadowRoot) {
                        clearInterval(checkInterval);
                        startShadowObserver(host);
                    }
                    if (++tries > waitLimit) clearInterval(checkInterval);
                }, 100);
            }
        }
    });

    mainObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

// suttaPath returns the file path to the JSON containing the translation based
// on the sutta ID such as mn118 or sn47.35 etc.
function suttaPath(suttaId) {
    // DN and MN: files sit directly in their collection folder
    const FLAT = new Set(["dn", "mn"]);
     
    // SN and AN: files are nested in a numeric sub-folder (e.g. sn/sn47/, an/an3/)
    const NUMERIC_SUB = new Set(["sn", "an"]);
     
    // Khuddaka Nikaya collections, nested under kn/<collection>/
    const KHUDDAKA = new Set([
      "kp", "dhp", "ud", "iti", "snp",
      "thag", "thig", "vv", "pv",
      "ja", "mnd", "cnd", "ps",
      "bv", "cp", "ap", "ne", "pe", "mil",
    ]);

    const id = suttaId.trim().toLowerCase();
    const match = id.match(/^([a-z]+)(.*)$/);

    if (!match) {
        throw new Error(`Cannot parse sutta ID: "${suttaId}"`);
    }

    const collection = match[1]; // e.g. "sn", "mn", "dhp"
    const suffix     = match[2]; // e.g. "47.35", "118", "1.1", ""
    const filename   = `${id}_translation-en-sujato.json`;

    if (FLAT.has(collection)) {
        // mn/mn118_translation-en-sujato.json
        return `${SUTTA_BASE}/${collection}/${filename}`;
    }

    if (NUMERIC_SUB.has(collection)) {
        // sn/sn47/sn47.35_translation-en-sujato.json
        const subNumber = suffix.split(".")[0];
        if (!subNumber || !/^\d+$/.test(subNumber)) {
            throw new Error(`Expected a numeric suffix for "${collection}", got "${suffix}"`);
        }
        const sub = `${collection}${subNumber}`; // e.g. "sn47"
        return `${SUTTA_BASE}/${collection}/${sub}/${filename}`;
    }

    if (KHUDDAKA.has(collection)) {
        // kn/dhp/dhp1_translation-en-sujato.json
        if (collection == "ud" || collection == "snp") {
            v = suffix[0];
            return `${SUTTA_BASE}/kn/${collection}/vagga${v}/${filename}`;
        }
        return `${SUTTA_BASE}/kn/${collection}/${filename}`;
    }

    throw new Error(
        `Unknown collection prefix "${collection}" in ID "${suttaId}". ` +
        `Known: ${[...FLAT, ...NUMERIC_SUB, ...KHUDDAKA].sort().join(", ")}`
    );
}

// loadSutta loads the sutta with the given suttaId and calls the callback(err, data).
function loadSutta(suttaId, cb) {
  const promise = new Promise((resolve, reject) => {
    let url;
    try {
      url = suttaPath(suttaId);
    } catch (err) {
      return reject(err);
    }
 
    console.log(`Loading ${suttaId} from ${url}...`);
    GM_xmlhttpRequest({
      method: "GET",
      url,
      responseType: "arraybuffer",
      onload(response) {
        if (response.status !== 200 && response.status !== 0) {
          // status 0 is normal for file:// in TamperMonkey
          reject(new Error(`Failed to load "${url}" (status ${response.status})`));
          return;
        }
        try {
          const text = new TextDecoder("utf-8").decode(response.response);
          loadBlurb(suttaId, (err, b) => {
            const blurb = err ? null : b;
            resolve({ sutta: JSON.parse(text), blurb });
          })
        } catch (e) {
          reject(new Error(`JSON parse error for "${url}": ${e.message}`));
        }
      },
      onerror(response) {
        reject(new Error(
          `Network error loading "${url}". ` +
          `Check that TamperMonkey has "Allow access to file URLs" enabled ` +
          `and that REPO_ROOT is set correctly.`
        ));
      },
    });
  });
 
  // Support optional callback alongside the returned Promise
  if (typeof cb === "function") {
      promise.then(({ sutta, blurb }) => cb(null, sutta, blurb)).catch(err => cb(err, null, null));
  }
 
  return promise;
}

// blurbPath returns { url, key } for the given sutta ID.
function blurbPath(suttaId) {
    // 'snp' must be tested before 'sn' to avoid a false match
    const prefixes = ["snp", "dn", "mn", "an", "sn", "ud"];

    const id = suttaId.trim().toLowerCase();
    let prefix = null, numberPart = null;

    for (const p of prefixes) {
        if (id.startsWith(p)) {
            prefix     = p;
            numberPart = id.slice(p.length);
            break;
        }
    }

    if (!prefix || !numberPart) {
        throw new Error(`Cannot parse sutta ID for blurb: "${suttaId}"`);
    }

    return {
        url: `${BLURB_BASE}/${prefix}-blurbs_root-en.json`,
        key: `${prefix}-blurbs:${prefix}${numberPart}`,
    };
}

// loadBlurb loads the short blurb string for the given sutta ID and calls
// callback(err, blurb). Also returns a Promise for async/await usage.
function loadBlurb(suttaId, cb) {
    const promise = new Promise((resolve, reject) => {
        let url, key;
        try {
            ({ url, key } = blurbPath(suttaId));
        } catch (err) {
            return reject(err);
        }

        console.log(`Loading blurb for ${suttaId} from ${url}...`);

        GM_xmlhttpRequest({
            method: "GET",
            url,
            responseType: "arraybuffer",
            onload(response) {
                if (response.status !== 200 && response.status !== 0) {
                    // status 0 is normal for file:// in TamperMonkey
                    reject(new Error(`Failed to load "${url}" (status ${response.status})`));
                    return;
                }
                try {
                    const text = new TextDecoder("utf-8").decode(response.response);
                    const data = JSON.parse(text);
                    const blurb = data[key] ?? null;
                    if (blurb === null) {
                        reject(new Error(`No blurb found for key "${key}" in "${url}"`));
                    } else {
                        resolve(blurb);
                    }
                } catch (e) {
                    reject(new Error(`JSON parse error for "${url}": ${e.message}`));
                }
            },
            onerror(response) {
                reject(new Error(
                    `Network error loading "${url}". ` +
                    `Check that TamperMonkey has "Allow access to file URLs" enabled ` +
                    `and that BLURB_BASE is set correctly.`
                ));
            },
        });
    });

    // Support optional callback alongside the returned Promise
    if (typeof cb === "function") {
        promise.then(data => cb(null, data)).catch(err => cb(err, null));
    }

    return promise;
}
