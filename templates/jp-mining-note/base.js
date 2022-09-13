/// {% from "modules/main.html" import modules with context %}


/* quick fix for legacy anki versions (replaces ?? operator) */
function nullish(a, b) {
  if ((typeof a === "undefined") || (a === null)) {
    return b;
  }
  return a;
}



/// {% for m in modules %}
/// {% if m.js is defined %}
{{ m.js.globals.get(note.card_type, note.side) }}
/// {% endif %}
/// {% endfor %}



(function () { // restricts ALL javascript to hidden scope

// "global" variables within the hidden scope
let note = (function () {
  let my = {};
  my.colorQuotes = false;
  return my;
}());



function getSetting(keys, defaultVal) {
  if (typeof JPMNOpts === "undefined") {
    return defaultVal;
  }

  let keyList = ["settings"].concat(keys);

  let obj = JPMNOpts;
  for (let key of keyList) {
    if (!(key in obj)) {

      // checks if we need to warn, manual search
      if ("settings" in JPMNOpts && "debug" in JPMNOpts["settings"] && JPMNOpts["settings"]["debug"]) {
        logger.warn("Option " + keys.join(".") + " is not defined in the options file.");
      }
      return defaultVal;
    }
    obj = obj[key];
  }
  return obj;
};


function _debug(message) {
  if ({{ utils.opt("debug") }}) {
    logger.info(message);
  }
}



// global variable to set the PA indicator color (as a css class)
/// {% call IF("PAShowInfo") %}
var paIndicator = (function () {
  let my = {};
  my.type = null;
  my.className = null;
  my.tooltip = null;

  if ('{{ utils.any_of_str("PADoNotTest", "PASeparateWordCard") }}') {
    my.type = "none";
  } else if ('{{ utils.any_of_str("PASeparateSentenceCard", "PATestOnlyWord") }}') {
    my.type = "word";
  } else if ('{{ utils.any_of_str("IsSentenceCard") }}') {
    my.type = "sentence";
  } else {
    my.type = "word";
  }

  my.className = "pa-indicator-color--" + my.type;

  if (my.type === "none") {
    my.tooltip = "Do not test"
  } else if (my.type == "word") {
    my.tooltip = "Word"
  } else { // sentence
    my.tooltip = "Sentence"
  }

  return my;
}());
/// {% endcall %} // PAShowInfo


/// {% if note.card_type != "pa_word" %}


/*
 * Toggles the display of any given details tag
 */
function toggleDetailsTag(ele) {
  if (ele.hasAttribute('open')) {
    ele.removeAttribute('open');
  } else {
    ele.setAttribute("open", "true");
  }
}



/// {% endif %} /// note.card_type != "pa_word"



/// {% block js_functions %}
/// {% endblock %}

/// {% for m in modules %}
/// {% if m.js is defined %}
{{ m.js.functions.get(note.card_type, note.side) }}
/// {% endif %}
/// {% endfor %}





// shift to switch between sentence & word on click & hover cards
// NOTICE: we MUST use document.onkeyup instead of document.addEventListener(...)
// because functions persist and cannot be easily removed within anki,
// whereas .onkeyup = ... replaces the previous function with the current.
document.onkeyup = (e => {
  let keys = null;
  let ele = null;

  // tests for the existance of extraKeybindSettings
  //if (typeof extraKeybindSettings !== 'undefined') {
  //  extraKeybindSettings(e);
  //}

  /// {% filter indent(width=2) %}
  /// {% block js_keybind_settings %}
  /// {% endblock %}
  /// {% for m in modules %}
  /// {% if m.js is defined %}
  {{ m.js.keybinds.get(note.card_type, note.side) }}
  /// {% endif %}
  /// {% endfor %}
  /// {% endfilter %}




  //if (e.getModifierState && e.getModifierState('CapsLock')) {
  //  if ("CapsLock" === e.key) {
  //    // either just enabled or disabled
  //    logger.removeWarn("caps");
  //  } else {
  //    logger.warn("Caps lock is enabled. Keybinds may not work as expected.", true, "caps")
  //  }
  //} else {
  //  //_debug("Caps lock is not enabled");
  //}


  if (e.getModifierState && e.getModifierState('CapsLock')) {
    if (e.key === "CapsLock") {
      // either just enabled or disabled, not sure which one is which
      // it seems like normal browsers can't reach this point during (caps lock enabled -> caps lock disabled...)
      logger.removeWarn("caps");
    } else if (!["Meta"].includes(e.key)) {
      _debug(e.key);
      logger.warn("Caps lock is enabled. Keybinds may not work as expected.", true, "caps")
    }
  } else {
    //_debug("Caps lock is not enabled");
    logger.removeWarn("caps");
  }


  /// {% call IF("WordAudio") %}
  //keys = settings.keybind("play-word-audio");
  keys = {{ utils.opt("keybinds", "play-word-audio") }};

  if (keys !== null && keys.includes(e.key)) {
    ele = document.querySelector("#word-audio .soundLink, #word-audio .replaybutton");
    if (ele) {
      ele.click();
    }
  }
  /// {% endcall %}

  /// {% call IF("SentenceAudio") %}
  keys = {{ utils.opt("keybinds", "play-sentence-audio") }};
  if (keys !== null && keys.includes(e.key)) {

    let hSent = document.getElementById("hybrid-sentence");

    /// {% if note.card_type == "main" and note.side == "front" %}
    if ({{ utils.opt("hybrid-sentence-open-on-play-sentence") }}
        && '{{ utils.any_of_str("IsHoverCard", "IsClickCard") }}'
        && '{{ utils.any_of_str("IsTargetedSentenceCard", "IsSentenceCard") }}'
        && hSent !== null && !hSent.classList.contains("override-display-inline-block")) {
      // this somehow works even when hybridClick is undefined here, woah
      // TODO clean this up lmao
      hybridClick();
    } else {
    /// {% endif %}
      ele = document.querySelector("#sentence-audio .soundLink, #sentence-audio .replaybutton");
      if (ele) {
        ele.click();
      }
    /// {% if note.card_type == "main" and note.side == "front" %}
    }
    /// {% endif %}
  }
  /// {% endcall %}

  keys = {{ utils.opt("keybinds", "toggle-front-full-sentence-display") }};
  ele = document.getElementById("full_sentence_front_details");
  if (keys !== null && ele && keys.includes(e.key)) {
    toggleDetailsTag(ele)
  }

  /// {% call IF("Hint") %}
  keys = {{ utils.opt("keybinds", "toggle-hint-display") }};
  ele = document.getElementById("hint_details");
  if (keys !== null && ele && keys.includes(e.key)) {
    toggleDetailsTag(ele)
  }
  /// {% endcall %}

  /// {% if note.side == "back" %}
  /// {% call IF("SecondaryDefinition") %}
  keys = {{ utils.opt("keybinds", "toggle-secondary-definitions-display") }};
  ele = document.getElementById("secondary_definition_details");
  if (keys !== null && ele && keys.includes(e.key)) {
    toggleDetailsTag(ele)
  }
  /// {% endcall %}

  /// {% call IF("AdditionalNotes") %}
  keys = {{ utils.opt("keybinds", "toggle-additional-notes-display") }};
  ele = document.getElementById("additional_notes_details");
  if (keys !== null && ele && keys.includes(e.key)) {
    toggleDetailsTag(ele)
  }
  /// {% endcall %}

  /// {% call IF("ExtraDefinitions") %}
  keys = {{ utils.opt("keybinds", "toggle-extra-definitions-display") }};
  ele = document.getElementById("extra_definitions_details");
  if (keys !== null && ele && keys.includes(e.key)) {
    toggleDetailsTag(ele)
  }
  /// {% endcall %}

  if ('{{ utils.any_of_str("PAGraphs", "UtilityDictionaries") }}') {
    keys = {{ utils.opt("keybinds", "toggle-extra-info-display") }};
    ele = document.getElementById("extra_info_details");
    if (keys !== null && ele && keys.includes(e.key)) {
      toggleDetailsTag(ele)
    }
  }
  /// {% endif %} {# note.side == back #}

})


// sanity check
if (typeof JPMNOpts === 'undefined') {
  logger.warn("JPMNOpts was not defined in the options file. Was there an error?");
}

/// {% block js_run %}
/// {% endblock %}
/// {% for m in modules %}
/// {% if m.js is defined %}
{{ m.js.run.get(note.card_type, note.side) }}
/// {% endif %}
/// {% endfor %}

//})();


}());
