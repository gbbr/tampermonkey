/* ====== START TAMPERMONKEY HEADER ====== */

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
// ==/UserScript==

/* ====== END TAMPERMONKEY HEADER ====== */

/* global Diff */

var mine = {
    // MN62
    "mn62:26.1": "Breathing in long they know: ‘I’m breathing in long.’ Breathing out long they know: ‘I’m breathing out long.’ ",
    "mn62:26.2": "Breathing in short they know: ‘I’m breathing in short.’ Breathing out short they know: ‘I’m breathing out short.’ ",
    "mn62:26.4": "They practice like this: ‘I’ll breathe in calming bodily formations.’ They practice like this: ‘I’ll breathe out calming bodily formations.’",
    "mn62:27.1": "They practice like this: ‘I’ll breathe in experiencing joy.’ They practice like this: ‘I’ll breathe out experiencing joy.’",
    "mn62:27.2": "They practice like this: ‘I’ll breathe in feeling ease.’ They practice like this: ‘I’ll breathe out feeling ease.’",
    "mn62:27.3": "They practice like this: ‘I’ll breathe in experiencing the mental activity.’ They practice like this: ‘I’ll breathe out experiencing the mental activity.’",
    "mn62:27.4": "They practice like this: ‘I’ll breathe in stilling the mental activity.’ They practice like this: ‘I’ll breathe out stilling the mental activity.’",
    "mn62:28.3": "They practice like this: ‘I’ll breathe in collecting the mind.’ They practice like this: ‘I’ll breathe out collecting the mind.’",
    "mn62:29.2": "They practice like this: ‘I’ll breathe in observing dispassion.’ They practice like this: ‘I’ll breathe out observing dispassion.’",
    "mn62:29.4": "They practice like this: ‘I’ll breathe in letting go.’ They practice like this: ‘I’ll breathe out letting go.’",

    // MN11
    "mn118:18.1": "^mn62:26.1",
    "mn118:18.2": "^mn62:26.2",
    "mn118:18.4": "^mn62:26.4",
    "mn118:19.1": "^mn62:27.1",
    "mn118:19.2": "^mn62:27.2",
    "mn118:19.3": "^mn62:27.3",
    "mn118:19.4": "^mn62:27.4",
    "mn118:20.3": "^mn62:28.3",
    "mn118:21.2": "^mn62:29.2",
    "mn118:21.4": "^mn62:29.4",

    "#": ""
};

(function($) {
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
            copyTextToClipboard('    "' + id + '": "' + text + '",\r\n');
        });

        // clicking outside the text closes all open root texts
        $(document).on('dblclick', function(e) {
            var $target = $('#segmented_text_content');

            if (!$target.is(e.target) && $target.has(e.target).length === 0) {
                $(".root").removeClass("show");
            }
        });
    });
})(window.jQuery.noConflict(true));

function addStyles() {
    injectFont('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap');

    GM_addStyle(`
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
        font-family: "EB Garamond", serif !important;
        font-weight: 400 !important;
        font-size: 1.2em !important;
      }

      .root .text {
          font-size: 1.1em !important;
      }

      .spanFocused {
          display: inline-block;
          padding: 0 3px;
          line-height: 1.3;
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

function injectFont(url) {
  const link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';

  document.head.appendChild(link);
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
