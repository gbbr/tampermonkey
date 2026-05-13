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
    "mn62:26.4": "They practice like this: ‘I’ll breathe in calming bodily formations.’ They practice like this: ‘I’ll breathe out calming bodily formations.’",
    "mn62:27.1": "They practice like this: ‘I’ll breathe in experiencing joy.’ They practice like this: ‘I’ll breathe out experiencing joy.’",
    "mn62:27.2": "They practice like this: ‘I’ll breathe in feeling ease.’ They practice like this: ‘I’ll breathe out feeling ease.’",
    "mn62:27.3": "They practice like this: ‘I’ll breathe in experiencing the mental activity.’ They practice like this: ‘I’ll breathe out experiencing the mental activity.’",
    "mn62:27.4": "They practice like this: ‘I’ll breathe in stilling the mental activity.’ They practice like this: ‘I’ll breathe out stilling the mental activity.’",
    "mn62:28.3": "They practice like this: ‘I’ll breathe in collecting the mind.’ They practice like this: ‘I’ll breathe out collecting the mind.’",
    "mn62:29.2": "They practice like this: ‘I’ll breathe in observing dispassion.’ They practice like this: ‘I’ll breathe out observing dispassion.’",
    "mn62:29.4": "They practice like this: ‘I’ll breathe in letting go.’ They practice like this: ‘I’ll breathe out letting go.’",

    // MN118
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
        $(document).on("click", ".segment .translation", function() {
            $(this).parent().find(".root").toggleClass("show");
        });

        $(document).on('dblclick', function(e) {
            // Select your target element
            var $target = $('#segmented_text_content');

            // Check if the clicked element is NOT the target AND not a child of the target
            if (!$target.is(e.target) && $target.has(e.target).length === 0) {
                $(".root").removeClass("show");
            }
        });
    });
})(window.jQuery.noConflict(true));

function addStyles() {
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

      .segment .root.show {
        display: block;
      }

      .diff-added { background-color: #e6ffec; color: #24292f; text-decoration: none; }
      .diff-removed { background-color: #ffebe9; color: #24292f; text-decoration: line-through; }
    `);
}

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
