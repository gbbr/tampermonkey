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
// ==/UserScript==

/* ====== END TAMPERMONKEY SCRIPT ====== */

/* global Diff */

var mine = {
    // Anapanasatisutta
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
    "mn118:24.5": `at that time they’re meditating by observing an aspect of the body—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:24.7": `That’s why at that time a mendicant is meditating by observing an aspect of the body—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:25.5": `at that time they meditate observing an aspect of feelings—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:25.7": `That’s why at that time a mendicant is meditating by observing an aspect of feelings—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:26.5": `at that time they meditate observing an aspect of the mind—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:26.6": `There is no development of mindfulness of breathing for someone who is unaware and lacks understanding, I say. `,
    "mn118:26.7": `That’s why at that time a mendicant is meditating by observing an aspect of the mind—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:27.2": `or observing disinvolvement, `,
    "mn118:27.6": `Having seen with wisdom the giving up of craving and aversion, they watch over closely with equanimity. `,
    "mn118:27.5": `at that time they meditate observing an aspect of principles—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:27.7": `That’s why at that time a mendicant is meditating by observing an aspect of principles—ardently aware and understanding, letting go of craving and aversion towards the world. `,
    "mn118:42.7": `and equanimity, which rely on seclusion, disinvolvment, and cessation, and ripen as letting go. `,

    // Anudhammasutta
    "sn22.39:1.3": `They should live full of disenchantment towards form, feeling, perception, choices, and consciousness. `,

    // Satisutta
    "sn47.35:0.3": `Aware `,
    "sn47.35:1.2": `“Mendicants, a mendicant should live with awareness and understanding. `,
    "sn47.35:2.1": `And how is a mendicant aware? `,
    "sn47.35:2.2": `It’s when a mendicant lives observing the body—ardently aware and understanding, letting go of craving and aversion towards the world <span class="add">of mind and matter</span>. `,
    "sn47.35:2.3": `He lives observing an aspect of feelings … `,
    "sn47.35:2.5": `principles—ardently aware and understanding, putting aside craving and aversion towards the world <span class="add">of mind and matter</span>. `,
    "sn47.35:2.6": `That’s how a mendicant is aware. `,
    "sn47.35:3.1": `And how is a mendicant understanding? `,
    "sn47.35:3.2": `It’s when a mendicant knows feelings as they arise, as they persist, and as they disappear. `,
    "sn47.35:3.3": `He knows thoughts as they arise, as they persist, and as they disappear. `,
    "sn47.35:3.4": `He knows perceptions as they arise, as they persist, and as they disappear. `,

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
    "mn10:34.2": `It"s when a mendicant understands mind with greed as "greedy mind," `,
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
        // Replace translations with custom ones
        var replaced = 0;
        Object.keys(mine).forEach(function(id) {
            var txt = mine[id];
            if (txt.length > 1 && txt[0] == '^') {
                // the key value is referencing another ID
                // to get the text from
                txt = mine[txt.slice(1)];
            }

            var el = $('[id="' + id + '"]');

            if (el.length == 0) {
                return
            }

            var t = el.find(".translation > .text"),
                o = t.html();

            // Map the parts to HTML
            const html = Diff.diffWords(o, txt).map(part => {
                const colorClass = part.added ? 'diff-added' : part.removed ? 'diff-removed' : '';
                return `<span class="${colorClass}">${part.value}</span>`;
            }).join('');

            t.html(txt + ' <span class="comment red"><b>Original text</b>: '+ html +'</span>');
            replaced++;
        });

        console.log("Replaced " + replaced + " translations.");
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
