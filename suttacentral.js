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

const SUTTA_BASE = "file:///Users/azzalos/g/tampermonkey/sujato/sutta";

var mine = {
    // Anapanasatisutta
    "mn118:2.1": `Now at that time the senior meditators were advising and instructing the junior meditators. `,
    "mn118:2.2": `Some senior meditators instructed ten meditators, while some instructed twenty, thirty, or forty. `,
    "mn118:2.3": `Being instructed by the senior meditators, the junior meditators realized a higher distinction than they had before. `,
    "mn118:3.2": `Then the Buddha looked around the Saṅgha of meditators, who were so very silent. He addressed them: `,
    "mn118:4.1": `“I am satisfied, meditators, with this practice. `,
    "mn118:5.1": `Meditators from around the country heard about this, `,
    "mn118:6.1": `And those senior meditators instructed the junior meditators even more. `,
    "mn118:6.2": `Some senior meditators instructed ten meditators, while some instructed twenty, thirty, or forty. `,
    "mn118:6.3": `Being instructed by the senior meditators, the junior meditators realized a higher distinction than they had before. `,
    "mn118:7.2": `Then the Buddha looked around the Saṅgha of meditators, who were so very silent. He addressed them: `,
    "mn118:8.1": `“This assembly has no chaff, meditators, it is free of chaff, pure, and consolidated in the core. `,
    "mn118:8.2": `Such is this Saṅgha of meditators, such is this assembly! `,
    "mn118:8.4": `^mn118:8.2`,
    "mn118:8.6": `^mn118:8.2`,
    "mn118:8.8": `^mn118:8.2`,
    "mn118:9.1": `For in this Saṅgha there are perfected meditators, who have ended the defilements, completed the spiritual journey, done what had to be done, laid down the burden, achieved their heart’s goal, utterly ended the fetter of continued existence, and are rightly freed through enlightenment. `,
    "mn118:9.2": `There are such meditators in this Saṅgha. `,
    "mn118:10.1": `In this Saṅgha there are meditators who, with the ending of the five lower fetters are reborn spontaneously. They are extinguished there, and are not liable to return from that world. `,
    "mn118:10.2": `^mn118:9.2`,
    "mn118:11.1": `In this Saṅgha there are meditators who, with the ending of three fetters, and the weakening of greed, hate, and delusion, are once-returners. They come back to this world once only, then make an end of suffering. `,
    "mn118:11.2": `^mn118:9.2`,
    "mn118:12.2": `^mn118:9.2`,
    "mn118:13.1": `In this Saṅgha there are meditators who are committed to developing the four kinds of mindfulness meditation … `,
    "mn118:14.7": `^mn118:9.2`,
    "mn118:14.8": `In this Saṅgha there are meditators who are committed to developing the meditation on love … `,
    "mn118:14.14": `^mn118:9.2`,
    "mn118:14.15": `In this Saṅgha there are meditators who are committed to developing the meditation on mindfulness of breathing. `,
    "mn118:15.1": `Meditators, when mindfulness of breathing is developed and cultivated it is very fruitful and beneficial. `,
    "mn118:17.1": `It’s when a meditator—gone to a wilderness, or to the root of a tree, or to an empty hut—sits down cross-legged, sets their body straight, and brings mindfulness to the present. `,
    "mn118:17.2": `Just mindful, he breathes in. Just mindful, he breathes out. `,
    "mn118:18.1": `Breathing in long he knows: "I"m breathing in long." Breathing out long he knows: "I"m breathing out long." `,
    "mn118:18.2": `Breathing in short he knows: "I"m breathing in short." Breathing out short he knows: "I"m breathing out short." `,
    "mn118:18.3": `He practices like this: "I'll breathe in aware of the whole body." He practices like this: "I"ll breathe out aware of the whole body."`,
    "mn118:18.4": `He practices like this: "I"ll breathe in calming the body formations." He practices like this: "I"ll breathe out calming the body formations."`,
    "mn118:19.1": `He practices like this: "I'll breathe in feeling delighted." He practices like this: "I"ll breathe out feeling delighted."`,
    "mn118:19.2": `He practices like this: "I'll breathe in feeling contented." He practices like this: "I"ll breathe out feeling contented."`,
    "mn118:19.3": `He practices like this: "I'll breathe in experiencing the mental activity." He practices like this: "I"ll breathe out experiencing the mental activity."`,
    "mn118:19.4": `He practices like this: "I'll breathe in stilling the mental activity." He practices like this: "I"ll breathe out stilling the mental activity."`,
    "mn118:20.1": `He practices like this: "I'll breathe in experiencing the mind." He practices like this: "I"ll breathe out experiencing the mind." `,
    "mn118:20.2": `He practices like this: "I'll breathe in gladdening the mind." He practices like this: "I"ll breathe out gladdening the mind." `,
    "mn118:20.3": `He practices like this: "I'll breathe in collecting the mind." He practices like this: "I"ll breathe out collecting the mind."`,
    "mn118:20.4": `He practices like this: "I'll breathe in freeing the mind." He practices like this: "I"ll breathe out freeing the mind." `,
    "mn118:21.1": `He practices like this: "I'll breathe in observing impermanence." He practices like this: "I"ll breathe out observing impermanence." `,
    "mn118:21.2": `He practices like this: "I'll breathe in observing disinvolvement." He practices like this: "I"ll breathe out observing disinvolvement."`,
    "mn118:21.3": `He practices like this: "I'll breathe in observing cessation." He practices like this: "I"ll breathe out observing cessation." `,
    "mn118:21.4": `He practices like this: "I'll breathe in letting go." He practices like this: "I"ll breathe out letting go."`,
    "mn118:24.1": `Whenever a meditator knows that they are breathing in long, or breathing out long, `,
    "mn118:24.2": `or breathing in short, or breathing out short, `,
    "mn118:24.3": `or being aware of the whole body, `,
    "mn118:24.4": `or calming the body formations—`,
    "mn118:24.5": `at that time they’re meditating by observing the body in and of itself—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:24.7": `That’s why at that time a meditator is meditating by observing the body in and of itself—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:25.1": `Whenever a meditator practices breathing while feeling delighted, `,
    "mn118:25.2": `or feeling contented, `,
    "mn118:25.3": `or experiencing the mental activity, `,
    "mn118:25.4": `or stilling the mental activity—`,
    "mn118:25.6": `For I say that careful attention to the in-breaths and out-breaths is an aspect of feelings. `,
    "mn118:25.5": `at that time they meditate observing feelings in and of themselves—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:25.7": `That’s why at that time a meditator is meditating by observing feelings in and of themselves—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:26.1": `Whenever a meditator practices breathing while experiencing the mind, `,
    "mn118:26.3": `or collecting the mind, `,
    "mn118:26.5": `at that time they meditate observing the mind in and of itself—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:26.6": `There is no development of mindfulness of breathing for someone who is unaware and lacks understanding, I say. `,
    "mn118:26.7": `That’s why at that time a meditator is meditating by observing the mind in and of itself—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:27.1": `Whenever a meditator practices breathing while observing impermanence, `,
    "mn118:27.2": `or observing disinvolvement, `,
    "mn118:27.5": `at that time they meditate observing principles in and of themselves—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:27.6": `Having seen with wisdom the giving up of craving and aversion, they watch over closely with equanimity. `,
    "mn118:27.7": `That’s why at that time a meditator is meditating by observing principles in and of themselves—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:30.1": `Whenever a meditator meditates by observing the body in and of itself, at that time their awareness is established and lucid. `,
    "mn118:30.2": `At such a time, a meditator cultivates the awakening factor of mindfulness; they develop it and perfect it. `,
    "mn118:31.2": `At such a time, a meditator cultivates the awakening factor of investigation of principles; they develop it and perfect it. `,
    "mn118:32.2": `At such a time, a meditator cultivates the awakening factor of energy; they develop it and perfect it. `,
    "mn118:33.1": `When they’re energetic, delight not of the flesh arises. `,
    "mn118:33.2": `At such a time, a meditator cultivates the awakening factor of joy; they develop it and perfect it. `,
    "mn118:34.1": `When they're delighted, the body and mind become tranquil. `,
    "mn118:34.2": `At such a time, a meditator cultivates the awakening factor of tranquility; they develop it and perfect it. `,
    "mn118:35.1": `When the body is calm and they feel contented, the mind becomes collected. `,
    "mn118:35.2": `At such a time, a meditator cultivates the awakening factor of immersion; they develop it and perfect it. `,
    "mn118:36.1": `They closely watch over that collected mind. `,
    "mn118:36.2": `At such a time, a meditator cultivates the awakening factor of equanimity; they develop it and perfect it. `,
    "mn118:37.1": `Whenever a meditator meditates by observing feelings … `,
    "mn118:38.2": `principles, at that time their awareness is established and lucid. `,
    "mn118:38.3": `At such a time, a meditator has initiated the awakening factor of mindfulness … `,
    "mn118:42.1": `It’s when a meditator develops the awakening factors of mindfulness, `,
    "mn118:42.4": `joy, `,
    "mn118:42.7": `and equanimity, which rely on seclusion, disinvolvment, and cessation, and ripen as letting go. `,
    "mn118:43.3": `Satisfied, the meditators approved what the Buddha said. `,

    // Kummopamasutta
    "sn35.240:2.7": `If the faculty of sight were left unrestrained, bad unskillful qualities of craving and aversion would become overwhelming. For this reason, practice restraint, protecting the faculty of sight, and achieving its restraint. `,
    "sn35.240:2.13": `If the faculty of mind were left unrestrained, bad unskillful qualities of craving and aversion would become overwhelming. For this reason, practice restraint, protecting the faculty of mind, and achieving its restraint. `,

    // Sabbasutta
    "sn35.23:1.11": `Because it's out of one's range.” `,

    // Anudhammasutta
    "sn22.39:1.3": `They should live full of disenchantment towards form, feeling, perception, choices, and consciousness. `,

    // Satisutta
    "sn47.35:0.3": `Aware `,
    "sn47.35:1.2": `“Meditators, a meditator should live with awareness and understanding. `,
    "sn47.35:2.1": `And how is a meditator aware? `,
    "sn47.35:2.2": `It’s when a meditator lives observing the body in and of itself — ardently aware and understanding, without craving and aversion towards the world <span class="add">of mind and matter</span>. `,
    "sn47.35:2.3": `He lives observing feelings in and of themselves … `,
    "sn47.35:2.5": `principles — ardently aware and understanding, without craving and aversion towards the world <span class="add">of mind and matter</span>. `,
    "sn47.35:2.6": `That’s how a meditator is aware. `,
    "sn47.35:3.1": `And how is a meditator understanding? `,
    "sn47.35:3.2": `Feelings are known to the meditator as they arise, as they persist, and as they disappear. `,
    "sn47.35:3.3": `Thoughts are known as they arise, as they persist, and as they disappear. `,
    "sn47.35:3.4": `Perceptions are known as they arise, as they persist, and as they disappear. `,
    "sn47.35:3.5": `That’s how a meditator is understanding. `,
    "sn47.35:3.6": `A meditator should live with awareness and understanding. `,

    // Mahārāhulovādasutta
    "mn62:26.1": "^mn118:18.1",
    "mn62:26.2": "^mn118:18.2",
    "mn62:26.3": "^mn118:18.3",
    "mn62:26.4": "^mn118:18.4",
    "mn62:27.1": "^mn118:19.1",
    "mn62:27.2": "^mn118:19.2",
    "mn62:27.3": "^mn118:19.3",
    "mn62:27.4": "^mn118:19.4",
    "mn62:28.1": "^mn118:20.1",
    "mn62:28.2": "^mn118:20.2",
    "mn62:28.3": "^mn118:20.3",
    "mn62:28.4": "^mn118:20.4",
    "mn62:29.1": "^mn118:21.1",
    "mn62:29.2": "^mn118:21.2",
    "mn62:29.3": "^mn118:21.3",
    "mn62:29.4": "^mn118:21.4",

    // Satipatthana Sutta
    "mn10:34.2": `It"s when a meditator understands mind with greed as "greedy mind," `,
    "mn10:34.4": `They understand mind with hate as "hateful mind," `,
    "mn10:34.6": `They understand mind with delusion as "deluded mind," `,
    "mn10:34.8": `They know contracted <span class="add">[dull]</span> mind as "contracted mind," `,
    "mn10:34.9": `and distracted <span class="add">[restless]</span> mind as "distracted mind." `,
    "mn10:34.10": `They know great mind as "great mind," `,
    "mn10:34.11": `and not great mind as "not great mind." `,
    "mn10:34.12": `They know mind that is unsurpassable as "unsurpassable mind," `,
    "mn10:34.13": `and mind that is surpassable as "surpassable mind." `,
    "mn10:34.14": `They know collected mind as "mind collected," `,
    "mn10:34.15": `and not collected mind as "mind not collected." `,
    "mn10:34.16": `They know a mind that is freed as "freed mind," `,
    "mn10:34.17": `and a mind that is not freed as "unfreed mind." `,

    "#": ""
};

(function($) {
    if ('history' in window && 'scrollRestoration' in window) {
      window.history.scrollRestoration = 'auto';
    }

    addStyles()

    waitForElement("h1.sutta-title").then((el) => {
        // Replace translation from disk
        loadSutta($("article[id]").attr("id"), (err, en) => {
            if (err != null) {
                console.error(err);
                return
            }
            Object.entries(en).forEach(([key, value]) => {
                console.log(key, value);
                $("span.segment[id='"+key+"'] > .translation > .text").html(value);
            });
        });
    })

    // toggle root text on clicking translation
    $(document).ready(function() {
        // expose Pali root on click
        $(document).on("click", ".segment .translation", function() {
            $(this).parent().find(".root").toggleClass("show");
        });

        fixClose($)

        $(document).on("dblclick", ".segment", function() {
            const id = $(this).attr("id");
            const text = $(this).find(".translation .text").text();
            copyTextToClipboard('    "' + id + '": `' + text + '`,\r\n');
        });

        // clicking outside the text closes all open root texts
        $(document).on('dblclick', function(e) {
            var $target = $('#segmented_text_content');
            var $target2 = $('sc-bottom-sheet');

            if (!$target.is(e.target) && $target.has(e.target).length === 0) {
                if (!$target2.is(e.target) && $target2.has(e.target).length === 0) {
                    $(".root").removeClass("show");
                }
            }
        });
    });
})(window.jQuery.noConflict(true));

function addStyles() {
    injectFonts();

    GM_addStyle(`
      h1 .text, h2 .text, h3 .text {
        color: #777 !important;
      }

      .text {
        color: #000 !important;
      }

      .segment .root .text {
        color: #667 !important;
      }

      body {
        background-color: #FFF !important;
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

      .segment {
        margin: 0px 40px;
        grid-template-columns: minmax(200px, 900px) !important;
      }

      .segment .root {
        display: none;
      }

      .comment.red {
        padding-right: 0px !important;
      }

      .comment.red::before {
        color: #ffb182 !important;
      }

      sc-text-page-selector, .root .text {
        font-family: "Georgia", serif !important;
        font-weight: 400 !important;
        line-height: 1.6em !important;
        font-size: 1.0em !important;
      }

      p { margin-top: 1em !important; }

      .spanFocused {
          display: inline-block;
          padding: 0 3px;
          line-height: 1.3;
          background-color: #f9b20f63 !important;
      }

      .segment .root.show {
        display: block;
      }

      .diff-added { background-color: #e6ffec; color: #24292f; text-decoration: none; }
      .diff-removed { background-color: #ffebe9; color: #24292f; text-decoration: line-through; }
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

function injectFonts() {
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
}

// fixClose fixes an issue when closing the dictionary popup
// where the highlighted text isn't removed
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
        return `${SUTTA_BASE}/kn/${collection}/${filename}`;
    }

    throw new Error(
        `Unknown collection prefix "${collection}" in ID "${suttaId}". ` +
        `Known: ${[...FLAT, ...NUMERIC_SUB, ...KHUDDAKA].sort().join(", ")}`
    );
}

// loadSutta loads the sutta with the given suttaId and calls the callback.
function loadSutta(suttaId, cb) {
  const promise = new Promise((resolve, reject) => {
    let url;
    try {
      url = suttaPath(suttaId);
    } catch (err) {
      return reject(err);
    }
 
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
          resolve(JSON.parse(text));
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
    promise.then(data => cb(null, data)).catch(err => cb(err, null));
  }
 
  return promise;
}
